import {
    integer,
    uuid,
    varchar,
    text,
    timestamp,
    decimal,
    index
} from "drizzle-orm/pg-core";

import { merchantSchema } from "../../definitions";
import { settlementStatusEnum } from "../../enums";
import { merchants as merchantsTable } from "../merchants/merchants";
import { ordersTable } from "../orders/orders";

// Settlements - Merchant payment settlements
export const settlementsTable = merchantSchema.table("settlements", {
    id: uuid().defaultRandom().primaryKey(),
    settlementNumber: varchar({ length: 50 }).unique().notNull(),

    // Merchant & Period
    merchantId: uuid().references(() => merchantsTable.id, { onDelete: "cascade" }).notNull(),
    settlementPeriodStart: timestamp().notNull(),
    settlementPeriodEnd: timestamp().notNull(),

    // Order Count
    totalOrders: integer().notNull().default(0),
    ordersSettled: integer().notNull().default(0),

    // Financial Breakdown
    totalSalesAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    totalCommission: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    totalRefunds: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    totalReturns: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    totalCancellation: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),

    // Adjustments
    adjustments: decimal({ precision: 15, scale: 2 }).notNull().default("0.00"),
    adjustmentNotes: text(),

    // Net Settlement (no reserve - 100% payout)
    netSettlementAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Settlement Status
    status: settlementStatusEnum().notNull().default("pending"),

    // Bank Transfer Details
    bankAccountNumber: varchar({ length: 35 }).notNull(),
    bankIfsc: varchar({ length: 11 }).notNull(),
    bankAccountName: varchar({ length: 255 }).notNull(),

    // Processing
    initiatedAt: timestamp(),
    processedAt: timestamp(),
    completedAt: timestamp(),

    // Transaction Details
    utr: varchar({ length: 50 }), // UTR for NEFT/RTGS/IMPS
    transactionReference: varchar({ length: 255 }),
    paymentMethod: varchar({ length: 50 }), // neft, rtgs, imps, upi

    // Failure Details
    failureReason: text(),
    retryCount: integer().default(0),
    lastRetryAt: timestamp(),

    // Supporting Documents
    settlementReportUrl: varchar({ length: 500 }),
    invoiceUrl: varchar({ length: 500 }),

    // Notes
    notes: text(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    settlementNumberIdx: index("settlement_number").on(table.settlementNumber),
    merchantIdIdx: index("settlement_merchant").on(table.merchantId),
    periodIdx: index("settlement_period").on(table.settlementPeriodStart, table.settlementPeriodEnd),
    statusIdx: index("settlement_status").on(table.status),
    utrIdx: index("settlement_utr").on(table.utr),
    completedAtIdx: index("settlement_completed").on(table.completedAt),
    createdAtIdx: index("settlement_created").on(table.createdAt)
}));

// Settlement Orders - Order-level settlement tracking
export const settlementOrdersTable = merchantSchema.table("settlement_orders", {
    id: uuid().defaultRandom().primaryKey(),
    settlementId: uuid().references(() => settlementsTable.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid().references(() => ordersTable.id).notNull(),

    // Order Financials
    orderAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    commissionAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    refundAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    returnAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),
    cancellationAmount: decimal({ precision: 15, scale: 2 }).default("0.00"),

    // Settlement Calculation
    netAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Delivery/Completion Date (for T+7, T+15 calculation)
    deliveredAt: timestamp().notNull(),
    settlementDate: timestamp().notNull(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    settlementIdIdx: index("settlement_order_settlement").on(table.settlementId),
    orderIdIdx: index("settlement_order_order").on(table.orderId),
    settlementDateIdx: index("settlement_order_date").on(table.settlementDate),
    deliveredAtIdx: index("settlement_order_delivered").on(table.deliveredAt)
}));
