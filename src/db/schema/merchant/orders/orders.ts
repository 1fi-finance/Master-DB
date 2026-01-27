import {
    serial,
    uuid,
    integer,
    varchar,
    text,
    timestamp,
    boolean,
    decimal,
    jsonb,
    index
} from "drizzle-orm/pg-core";
import { merchantSchema } from "../../definitions";
import { orderStatusEnum, paymentStatusEnum, channelTypeEnum, fulfillmentTypeEnum } from "../../enums";
import { merchants } from "../merchants/merchants";
import { merchantStoresTable } from "../merchants/merchants";
import { usersTable } from "../../users/index";

// Orders - Master order table
export const ordersTable = merchantSchema.table("orders", {
    id: serial().primaryKey(),

    // Order Number
    orderNumber: varchar({ length: 50 }).unique().notNull(),

    // Customer & Merchant
    customerId: uuid().references(() => usersTable.id).notNull(),
    merchantId: uuid().references(() => merchants.id).notNull(),
    storeId: uuid().references(() => merchantStoresTable.id), // null for online orders without store pickup

    // Channel & Fulfillment
    channel: channelTypeEnum().notNull(), // online, offline, pos, marketplace
    fulfillmentType: fulfillmentTypeEnum().notNull().default("delivery"), // delivery, pickup, store_purchase, reserve_online

    // Order Status
    status: orderStatusEnum().notNull().default("pending"),
    paymentStatus: paymentStatusEnum().notNull().default("pending"),

    // Pricing Breakdown
    subtotalAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    discountAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    taxAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    shippingAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    totalAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Coupon & Offers
    couponCode: varchar({ length: 50 }),
    couponDiscount: decimal({ precision: 15, scale: 2 }).default("0.00"),

    // Payment
    paymentMethod: varchar({ length: 50 }), // upi, card, netbanking, wallet, emi, cod
    paymentTransactionId: varchar({ length: 255 }),
    paymentGateway: varchar({ length: 50 }),

    // Delivery Address
    deliveryAddress: jsonb(), // Full address as JSON
    billingAddress: jsonb(),

    // Delivery Details
    expectedDeliveryDate: timestamp(),
    deliveredAt: timestamp(),

    // Pickup Details (for BOPIS)
    pickupStoreId: uuid().references(() => merchantStoresTable.id),
    pickupScheduledAt: timestamp(),
    pickupCompletedAt: timestamp(),

    // Customer Notes
    customerNotes: text(),
    giftMessage: text(),
    isGift: boolean().default(false),

    // Internal Notes
    internalNotes: text(),

    // Device & IP (for fraud detection)
    ipAddress: varchar({ length: 45 }),
    userAgent: text(),

    // Source Tracking
    source: varchar({ length: 50 }), // web, mobile_app, pos, marketplace
    utmSource: varchar({ length: 255 }),
    utmMedium: varchar({ length: 255 }),
    utmCampaign: varchar({ length: 255 }),

    // Financing
    loanApplicationId: integer(), // Link to los.loan_applications if financed

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    orderNumberIdx: index("order_number").on(table.orderNumber),
    customerIdx: index("order_customer").on(table.customerId),
    merchantIdx: index("order_merchant").on(table.merchantId),
    storeIdx: index("order_store").on(table.storeId),
    statusIdx: index("order_status").on(table.status),
    paymentStatusIdx: index("order_payment_status").on(table.paymentStatus),
    channelIdx: index("order_channel").on(table.channel),
    fulfillmentIdx: index("order_fulfillment").on(table.fulfillmentType),
    createdAtIdx: index("order_created").on(table.createdAt),
    pickupStoreIdx: index("order_pickup_store").on(table.pickupStoreId)
}));

// Order Items - Line items
export const orderItemsTable = merchantSchema.table("order_items", {
    id: serial().primaryKey(),
    orderId: integer().references(() => ordersTable.id, { onDelete: "cascade" }).notNull(),

    // Product Reference
    productId: integer().notNull(),
    productVariantId: integer(),
    bundleId: integer(),

    // Product Details (snapshot at time of order)
    productName: varchar({ length: 255 }).notNull(),
    productSku: varchar({ length: 100 }).notNull(),
    variantName: varchar({ length: 255 }),
    variantSku: varchar({ length: 100 }),

    // Pricing
    quantity: integer().notNull(),
    unitPrice: decimal({ precision: 15, scale: 2 }).notNull(),
    totalPrice: decimal({ precision: 15, scale: 2 }).notNull(),
    discountAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    taxAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    finalPrice: decimal({ precision: 15, scale: 2 }).notNull(),

    // Product Attributes (snapshot)
    attributes: jsonb(),

    // Service Add-ons
    serviceAddOns: jsonb(), // Installation, repair, etc.

    // Fulfillment Status
    fulfillmentStatus: varchar({ length: 50 }).default("pending"), // pending, processing, shipped, delivered, cancelled
    shippedAt: timestamp(),
    deliveredAt: timestamp(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    orderIdIdx: index("order_item_order").on(table.orderId),
    productIdx: index("order_item_product").on(table.productId),
    variantIdx: index("order_item_variant").on(table.productVariantId),
    bundleIdx: index("order_item_bundle").on(table.bundleId),
    fulfillmentStatusIdx: index("order_item_fulfillment").on(table.fulfillmentStatus)
}));
