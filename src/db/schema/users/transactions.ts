import { serial, varchar, decimal, timestamp, jsonb, text, index, uuid } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { usersTable } from "./index";

export const transactionsTable = usersSchema.table("transactions", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),
    cfPaymentId: varchar({ length: 100 }).unique(),
    orderId: varchar({ length: 100 }).notNull(),
    entity: varchar({ length: 50 }).default('payment'),

    // Payment Details
    paymentAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    paymentCurrency: varchar({ length: 10 }).default('INR'),
    paymentStatus: varchar({ length: 50 }).notNull(),
    paymentMessage: text(),
    paymentTime: timestamp(),
    paymentCompletionTime: timestamp(),

    // Group & Method
    paymentGroup: varchar({ length: 50 }),
    paymentMethod: jsonb(),

    // Authorization
    authorization: jsonb(),
    authId: varchar({ length: 100 }),

    // Gateway Details
    paymentGatewayDetails: jsonb(),
    bankReference: varchar({ length: 100 }),

    // Errors
    errorDetails: jsonb(),

    // Audit
    isCaptured: varchar({ length: 50 }).default('false'), // Using varchar as source is boolean but sometimes string in older systems, safe to check
    rawResponse: jsonb(), // Store full JSON for future proofing

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    userIdIdx: index("txn_user_id").on(table.userId),
    orderIdIdx: index("txn_order_id").on(table.orderId),
    cfPaymentIdIdx: index("txn_cf_payment_id").on(table.cfPaymentId),
    statusIdx: index("txn_status").on(table.paymentStatus)
}));
