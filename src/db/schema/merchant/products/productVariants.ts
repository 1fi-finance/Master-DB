import { merchantSchema } from "../../definitions";
import { uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { merchants } from "../merchants/merchants";
import { productsTable } from "./products";
export const productVariantsTable = merchantSchema.table("merchant_product_variants", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid().references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
    variantSku: uuid(),
    variantName: varchar({ length: 255 }),
    variantAttributes: jsonb(),
    basePrice: decimal({ precision: 15, scale: 2 }),
    sellingPrice: decimal({ precision: 15, scale: 2 }),
    isActive: boolean().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
})
