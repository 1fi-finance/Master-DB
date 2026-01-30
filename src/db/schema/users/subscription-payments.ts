import { serial, varchar, decimal, timestamp, uuid, index, jsonb, text } from "drizzle-orm/pg-core";
import { usersSchema } from "../definitions";
import { usersTable, autopayTable } from "./index";

/**
 * Subscription payments table
 *
 * Tracks individual payments made against subscriptions.
 * Links to both subscription (autopayTable) and transaction (transactionsTable).
 * Stores payment details, gateway responses, and refund information.
 */
export const subscriptionPaymentsTable = usersSchema.table("subscription_payments", {
    id: serial().primaryKey(),
    subscriptionId: varchar({ length: 100 }).references(() => autopayTable.subscriptionId),
    userId: uuid().references(() => usersTable.id).notNull(),

    // Payment Identifiers
    cfPaymentId: varchar({ length: 100 }).unique(),
    paymentId: varchar({ length: 100 }).unique().notNull(),
    idempotencyKey: varchar({ length: 255 }).unique(),

    // Payment Details
    amount: decimal({ precision: 15, scale: 2 }).notNull(),
    currency: varchar({ length: 10 }).default('INR'),
    paymentStatus: varchar({ length: 50 }).notNull(),
    paymentDate: timestamp(),

    // Payment Method
    paymentMethod: varchar({ length: 50 }),
    paymentMethodDetails: jsonb(),

    // Gateway Response
    gatewayResponse: jsonb(),
    errorCode: varchar({ length: 50 }),
    errorMessage: text(),

    // Refund Information (if applicable)
    refundAmount: decimal({ precision: 15, scale: 2 }),
    refundStatus: varchar({ length: 50 }),
    refundId: varchar({ length: 100 }),
    cfRefundId: varchar({ length: 100 }),
    refundDate: timestamp(),

    // Audit
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    subscriptionIdx: index("sub_pay_sub_id").on(table.subscriptionId),
    userIdIdx: index("sub_pay_user_id").on(table.userId),
    paymentIdIdx: index("sub_pay_pay_id").on(table.paymentId),
    idempotencyKeyIdx: index("sub_pay_idem").on(table.idempotencyKey),
    statusIdx: index("sub_pay_status").on(table.paymentStatus)
}));
