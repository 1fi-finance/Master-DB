import { serial, uuid, varchar, text, timestamp, boolean, decimal, } from "drizzle-orm/pg-core";

import { merchantSchema } from "../../definitions";
import { JourneyType } from "../../enums";
import { merchants } from "../merchants/merchants";
import { productsTable } from "../products/products";


export const qrTable = merchantSchema.table("qrTable", {
    id: serial().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    qrCode: varchar({ length: 255 }).notNull(),
    journeyType: JourneyType("journeyType").default("basic"),
    amount: decimal({ precision: 15, scale: 2 }),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }),
    variantId: uuid().references(() => productsTable.id, { onDelete: "cascade" }),
    expiresAt: timestamp(),
    qrCodeData: text(),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});