import { serial, varchar, integer, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { usersSchema } from "../definitions";
import { usersTable } from "./index";

/**
 * Idempotency keys table
 *
 * Prevents duplicate operations for payment and refund requests.
 * Stores the original response for idempotent returns.
 * Keys expire after a configurable time period (default 48 hours).
 */
export const idempotencyKeysTable = usersSchema.table("idempotency_keys", {
    id: serial().primaryKey(),
    key: varchar({ length: 255 }).unique().notNull(),
    operation: varchar({ length: 100 }).notNull(),
    userId: uuid().references(() => usersTable.id),

    // Store original response for idempotent returns
    responseStatus: integer().notNull(),
    responseBody: jsonb().notNull(),

    createdAt: timestamp().notNull().defaultNow(),
    expiresAt: timestamp().notNull()
}, (table) => ({
    keyIdx: index("idem_key").on(table.key),
    operationIdx: index("idem_op").on(table.operation),
    userIdx: index("idem_user").on(table.userId),
    expiresAtIdx: index("idem_expires").on(table.expiresAt)
}));
