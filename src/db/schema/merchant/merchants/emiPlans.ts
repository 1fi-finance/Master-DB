import { uuid, varchar, text, timestamp, decimal, integer, boolean } from "drizzle-orm/pg-core";

import { merchants } from "./merchants";
import { merchantSchema } from "../../definitions";
import { productsTable, productVariantsTable } from "../products/products";

export const EmiPlans = merchantSchema.table("emi_plans", {
    id: uuid().defaultRandom().primaryKey(),
    planName: varchar({ length: 255 }).notNull(),
    tenure: integer().notNull(),
    interestRate: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    minAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    maxAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    downPaymentTenure: integer().notNull().default(0),
    minDownPayment: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    planType: varchar({ length: 50 }).notNull().default("standard"),
    cashbackAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    isActive: boolean().notNull().default(true),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    planDescription: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});


export const merchantEmiPlans = merchantSchema.table("merchant_emi_plans", {
    id: uuid().defaultRandom().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    emiPlanId: uuid().references(() => EmiPlans.id, { onDelete: "cascade" }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    overrideInterestRate: boolean().notNull().default(false),
    subvention: decimal({ precision: 15, scale: 2 }).notNull(),
    subventionType: varchar({ length: 20 }).notNull().default("percentage"),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});

export const merchantVariantsEmiPlans = merchantSchema.table("merchant_variant_emi_plans", {
    id: uuid().defaultRandom().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }).notNull(),
    emiPlanId: uuid().references(() => EmiPlans.id, { onDelete: "cascade" }).notNull(),
    processingFee: decimal({ precision: 15, scale: 2 }).notNull(),
    processingFeeType: varchar({ length: 20 }).notNull().default("fixed"),
    overrideInterestRate: boolean().notNull().default(false),
    subvention: decimal({ precision: 15, scale: 2 }).notNull(),
    subventionType: varchar({ length: 20 }).notNull().default("percentage"),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});