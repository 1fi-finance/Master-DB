import { jsonb, uuid, varchar, text, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";
import { merchantSchema } from "../definitions";
import { productsTable } from "../merchant/products/products";
import { productVariantsTable } from "../merchant/products/productVariants";

export const userJourney = merchantSchema.table("merchant_user_journey", {
    id: uuid().primaryKey(),
    page: varchar({ length: 255 }).notNull(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    pageIdx: index("user_journey_page").on(table.page),
    productIdIdx: index("user_journey_product").on(table.productId),
    variantIdIdx: index("user_journey_variant").on(table.variantId),
    createdAtIdx: index("user_journey_created").on(table.createdAt)
}))