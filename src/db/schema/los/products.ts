import { serial, varchar, text, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { mutualFundTypeEnum } from "../enums";
import { losSchema } from "../definitions";

export const loanProductsTable = losSchema.table("loan_products", {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    code: varchar({ length: 50 }).notNull().unique(),
    description: text(),
    minLoanAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    maxLoanAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    minTenureMonths: integer().notNull(),
    maxTenureMonths: integer().notNull(),
    baseInterestRate: decimal({ precision: 8, scale: 4 }).notNull(),
    processingFeePercent: decimal({ precision: 8, scale: 4 }).notNull(),
    prepaymentFeePercent: decimal({ precision: 8, scale: 4 }).notNull().default("0"),
    isActive: boolean().notNull().default(true),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});

export const ltvConfigTable = losSchema.table("ltv_config", {
    id: serial().primaryKey(),
    loanProductId: integer().references(() => loanProductsTable.id).notNull(),
    mutualFundType: mutualFundTypeEnum().notNull(),
    ltvRatio: decimal({ precision: 5, scale: 2 }).notNull(),
    minCollateralValue: decimal({ precision: 15, scale: 2 }).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});
