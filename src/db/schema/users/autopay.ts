import { serial, varchar, timestamp, jsonb, text, index, uuid, decimal } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { usersTable } from "./index";

export const autopayTable = usersSchema.table("autopay", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),

    // Subscription Identifiers
    subscriptionId: varchar({ length: 100 }).unique().notNull(), // Internal ID (e.g., SUB0028)
    cfSubscriptionId: varchar({ length: 100 }), // Cashfree ID
    subscriptionSessionId: varchar({ length: 255 }),

    // Status & Plans
    subscriptionStatus: varchar({ length: 50 }).notNull().default('INITIALIZED'),
    planName: varchar({ length: 255 }),
    planType: varchar({ length: 50 }), // ON_DEMAND, PERIODIC
    // Dates
    expiryTime: timestamp(),
    nextScheduleDate: timestamp(),
    subscriptionFirstChargeTime: timestamp(),

    // JSON Details
    authorizationDetails: jsonb(),
    customerDetails: jsonb(),
    planDetails: jsonb(),
    subscriptionMeta: jsonb(),
    subscriptionNote: text(),
    subscriptionTags: jsonb(),
    subscriptionPaymentSplits: jsonb(),
    maxAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    userIdIdx: index("autopay_user_id").on(table.userId),
    subIdIdx: index("autopay_sub_id").on(table.subscriptionId),
    statusIdx: index("autopay_status").on(table.subscriptionStatus)
}));
