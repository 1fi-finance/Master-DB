import { serial, integer, varchar, text, boolean, timestamp, decimal, index, uuid } from "drizzle-orm/pg-core";
import { lmsSchema } from "../../definitions";

export const collectionBucketTable = lmsSchema.table("collection_bucket", {
    id: uuid().defaultRandom().primaryKey(),

    // Bucket Definition
    bucketCode: varchar({ length: 50 }).notNull().unique(),
    bucketName: varchar({ length: 255 }).notNull(),

    // DPD Range
    minDpdDays: integer().notNull(),
    maxDpdDays: integer().notNull(),

    // Provisioning and Strategy
    provisioningPercentage: decimal({ precision: 5, scale: 2 }).notNull(),
    collectionStrategy: text().notNull(),

    // Status
    isActive: boolean().notNull().default(true),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    bucketCodeIdx: index("coll_bucket_code").on(table.bucketCode),
    isActiveIdx: index("coll_bucket_active").on(table.isActive),
    dpdRangeIdx: index("coll_bucket_dpd").on(table.minDpdDays, table.maxDpdDays)
}));
