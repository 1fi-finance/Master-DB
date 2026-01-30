import { serial, varchar, decimal, timestamp, uuid, index, text, jsonb } from "drizzle-orm/pg-core";
import { usersSchema } from "../definitions";
import { usersTable } from "./index";
import { subscriptionPaymentsTable } from "./subscription-payments";

/**
 * Subscription refunds table
 *
 * Tracks refund operations against subscription payments.
 * Links to payment (subscriptionPaymentsTable) and user (usersTable).
 * Stores refund details, gateway responses, and processing status.
 */
export const subscriptionRefundsTable = usersSchema.table("subscription_refunds", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),
    paymentId: varchar({ length: 100 }).references(() => subscriptionPaymentsTable.paymentId).notNull(),

    // Refund Identifiers
    refundId: varchar({ length: 100 }).unique().notNull(),
    cfRefundId: varchar({ length: 100 }).unique(),
    idempotencyKey: varchar({ length: 255 }).unique(),

    // Refund Details
    refundAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    refundCurrency: varchar({ length: 10 }).default('INR'),
    refundStatus: varchar({ length: 50 }).notNull(),

    // Refund Reason
    refundReason: text(),
    refundType: varchar({ length: 50 }),

    // Processing
    processedAt: timestamp(),
    refundMethod: varchar({ length: 50 }),

    // Gateway Response
    gatewayResponse: jsonb(),
    errorCode: varchar({ length: 50 }),
    errorMessage: text(),

    // Audit
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    userIdIdx: index("sub_ref_user_id").on(table.userId),
    paymentIdIdx: index("sub_ref_pay_id").on(table.paymentId),
    refundIdIdx: index("sub_ref_ref_id").on(table.refundId),
    idempotencyKeyIdx: index("sub_ref_idem").on(table.idempotencyKey),
    statusIdx: index("sub_ref_status").on(table.refundStatus)
}));
