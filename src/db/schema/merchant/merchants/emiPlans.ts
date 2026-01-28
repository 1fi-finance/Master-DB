import { uuid, varchar, text, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";

import { merchants } from "./merchants";
import { merchantSchema } from "../../definitions";
import { productsTable } from "../products/products";

export const EmiPlans = merchantSchema.table("merchant_emi_plans", {
    id: uuid().primaryKey(),
    planName: varchar({ length: 255 }).notNull(),
    tenure: integer().notNull(),
    interestRate: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    minAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    maxAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    isActive: boolean().notNull().default(true),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    planDescription: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});


export const merchantEmiPlans = merchantSchema.table("merchant_emi_plans", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    emiPlanId: uuid().references(() => EmiPlans.id, { onDelete: "cascade" }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    overrideIntrestRate: boolean().notNull().default(false),
    subvention: decimal({ precision: 15, scale: 2 }).notNull(),
    subventionType: varchar({ length: 20 }).notNull().default("percentage"),
    isActive: boolean().notNull().default(true),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});

export const merchantVariantsEmiPlans = merchantSchema.table("merchant_variant_emi_plans", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid().references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
    emiPlanId: uuid().references(() => EmiPlans.id, { onDelete: "cascade" }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    overrideIntrestRate: boolean().notNull().default(false),
    subvention: decimal({ precision: 15, scale: 2 }).notNull(),
    subventionType: varchar({ length: 20 }).notNull().default("percentage"),
    isActive: boolean().notNull().default(true),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});