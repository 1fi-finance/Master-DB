import {
    serial,
    integer,
    varchar,
    timestamp,
    decimal,
    jsonb,
    index,
    pgEnum,
    text,
    uuid
} from "drizzle-orm/pg-core";
import { merchantSchema } from "../../definitions";
import { merchants as merchantsTable } from "../merchants/merchants";
import { analyticsPeriodEnum } from "../../enums";

// Merchant Analytics Daily - Daily aggregated metrics
export const merchantAnalyticsDailyTable = merchantSchema.table("merchant_analytics_daily", {
    id: serial().primaryKey(),
    merchantId: uuid().references(() => merchantsTable.id, { onDelete: "cascade" }).notNull(),
    storeId: integer(), // If null, aggregated across all stores
    date: timestamp().notNull(),
    period: analyticsPeriodEnum().notNull().default("daily"),

    // Sales Metrics
    totalOrders: integer().notNull().default(0),
    totalRevenue: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    averageOrderValue: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    totalItemsSold: integer().notNull().default(0),

    // Order Breakdown
    ordersByChannel: jsonb(), // {"online": 100, "offline": 50, "pos": 25}
    ordersByFulfillment: jsonb(), // {"delivery": 80, "pickup": 30, "store_purchase": 65}
    revenueByChannel: jsonb(), // {"online": "50000.00", "offline": "25000.00"}

    // Inventory Metrics
    totalProducts: integer().default(0),
    lowStockProducts: integer().default(0),
    outOfStockProducts: integer().default(0),
    inventoryValue: decimal({ precision: 15, scale: 2 }).default("0.00"),

    // Top Performing
    topSellingProducts: jsonb(),
    fastMovingProducts: jsonb(),
    slowMovingProducts: jsonb(),

    // Customer Metrics
    newCustomers: integer().default(0),
    returningCustomers: integer().default(0),
    totalCustomers: integer().default(0),

    // Customer Demographics
    customersByCity: jsonb(), // Top cities
    customersByGender: jsonb(), // {"male": 500, "female": 300, "other": 50}

    // Acquisition
    trafficSource: jsonb(), // {"web": 1000, "mobile_app": 800, "pos": 200}

    // Performance Metrics
    averageFulfillmentTime: decimal({ precision: 10, scale: 2 }), // In hours
    fulfillmentRate: decimal({ precision: 5, scale: 2 }), // Percentage
    returnRate: decimal({ precision: 5, scale: 2 }), // Percentage
    cancellationRate: decimal({ precision: 5, scale: 2 }), // Percentage

    // Rating Metrics
    averageProductRating: decimal({ precision: 3, scale: 2 }), // 1-5
    averageServiceRating: decimal({ precision: 3, scale: 2 }), // 1-5
    totalReviews: integer().default(0),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("analytics_daily_merchant").on(table.merchantId),
    storeIdIdx: index("analytics_daily_store").on(table.storeId),
    dateIdx: index("analytics_daily_date").on(table.date),
    periodIdx: index("analytics_daily_period").on(table.period),
    merchantDateIdx: index("analytics_daily_merchant_date").on(table.merchantId, table.date)
}));

// Merchant Analytics Raw - Detailed event data
export const merchantAnalyticsRawTable = merchantSchema.table("merchant_analytics_raw", {
    id: uuid().primaryKey(),
    merchantId: uuid().notNull(),
    storeId: uuid(),

    // Event Details
    eventType: varchar({ length: 50 }).notNull(), // page_view, add_to_cart, purchase, search, etc.
    eventName: varchar({ length: 100 }).notNull(),

    // Customer
    customerId: uuid(),
    sessionId: varchar({ length: 255 }), // For web sessions

    // Product Context
    productId: uuid(),
    productVariantId: uuid(),
    categoryId: uuid(),

    // Order Context
    orderId: uuid(),

    // Event Data
    eventProperties: jsonb(), // Flexible event-specific data

    // Channel & Source
    channel: varchar({ length: 20 }), // online, offline, pos
    source: varchar({ length: 50 }), // web, mobile_app, pos

    // Device Info
    deviceType: varchar({ length: 50 }), // desktop, mobile, tablet, pos
    userAgent: text(),
    ipAddress: varchar({ length: 45 }),

    // UTM Parameters
    utmSource: varchar({ length: 255 }),
    utmMedium: varchar({ length: 255 }),
    utmCampaign: varchar({ length: 255 }),
    utmTerm: varchar({ length: 255 }),
    utmContent: varchar({ length: 255 }),

    // Geolocation
    city: varchar({ length: 100 }),
    state: varchar({ length: 100 }),
    country: varchar({ length: 100 }).default("India"),

    // Timestamp
    occurredAt: timestamp().notNull(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("analytics_raw_merchant").on(table.merchantId),
    storeIdIdx: index("analytics_raw_store").on(table.storeId),
    eventTypeIdx: index("analytics_raw_type").on(table.eventType),
    customerIdIdx: index("analytics_raw_customer").on(table.customerId),
    productIdIdx: index("analytics_raw_product").on(table.productId),
    orderIdIdx: index("analytics_raw_order").on(table.orderId),
    occurredAtIdx: index("analytics_raw_occurred").on(table.occurredAt),
    sessionIdIdx: index("analytics_raw_session").on(table.sessionId),
    merchantEventIdx: index("analytics_raw_merchant_event").on(table.merchantId, table.eventType)
}));
