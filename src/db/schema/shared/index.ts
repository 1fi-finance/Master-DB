import { uuid, varchar, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";

import { sharedSchema } from "../definitions";
import { productsTable, productVariantsTable } from "../merchant/products/products";

export const sessionJourney = sharedSchema.table("session_journey", {
    id: uuid().defaultRandom().primaryKey(),
    journeySessionId: uuid().notNull(),
    page: varchar({ length: 255 }).notNull(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }),
    variantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }),
    metadata: jsonb(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    journeySessionIdIdx: index("session_journey_session_id").on(table.journeySessionId),
    createdAtIdx: index("session_journey_created").on(table.createdAt)
}));

export const apiKeys = sharedSchema.table("api_keys", {
    id: uuid().primaryKey(),
    secret: varchar({ length: 255 }).notNull(),
    key: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});

export const cors = sharedSchema.table("cors", {
    id: uuid().primaryKey(),
    origin: varchar({ length: 255 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});

// Enhanced CORS configuration table for dynamic CORS management
export const corsConfig = sharedSchema.table("cors_config", {
    id: uuid().primaryKey().defaultRandom(),
    service: varchar({ length: 50 }).notNull(), // 'mms', 'los', '*'
    origin: varchar({ length: 255 }).notNull(),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});
