import {
    serial,
    integer,
    uuid,
    varchar,
    text,
    timestamp,
    jsonb,
    index
} from "drizzle-orm/pg-core";
import { merchantSchema } from "../../definitions";
import { ordersTable } from "./orders";

// Order Status History - Complete status audit trail
export const orderStatusHistoryTable = merchantSchema.table("order_status_history", {
    id: serial().primaryKey(),
    orderId: integer().references(() => ordersTable.id, { onDelete: "cascade" }).notNull(),

    // Status Change
    fromStatus: varchar({ length: 50 }),
    toStatus: varchar({ length: 50 }).notNull(),

    // Location & Tracking
    location: varchar({ length: 255 }),
    trackingNumber: varchar({ length: 255 }),
    trackingUrl: varchar({ length: 500 }),

    // Additional Information
    notes: text(),
    metadata: jsonb(),

    // Who made the change
    changedBy: uuid(), // User or system

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    orderIdIdx: index("status_history_order").on(table.orderId),
    toStatusIdx: index("status_history_to_status").on(table.toStatus),
    createdAtIdx: index("status_history_created").on(table.createdAt)
}));
