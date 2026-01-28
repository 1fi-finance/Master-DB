import { serial, varchar, decimal, boolean, date, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { feeTypeEnum, feeCalculationMethodEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const feeMasterTable = lmsSchema.table("fee_master", {
    id: uuid().defaultRandom().primaryKey(),

    // Fee Identification
    feeCode: varchar({ length: 50 }).notNull().unique(),
    feeName: varchar({ length: 255 }).notNull(),

    // Fee Type and Calculation
    feeType: feeTypeEnum().notNull(),
    calculationMethod: feeCalculationMethodEnum().notNull(),

    // Amount Calculation
    rate: decimal({ precision: 8, scale: 4 }),
    fixedAmount: decimal({ precision: 15, scale: 2 }),

    // Applicability
    applicability: varchar({ length: 100 }).notNull(),

    // Accounting
    glHead: varchar({ length: 100 }).notNull(),

    // Status
    isActive: boolean().notNull().default(true),
    effectiveDate: date().notNull(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    feeCodeIdx: index("fee_master_code").on(table.feeCode),
    feeTypeIdx: index("fee_master_type").on(table.feeType),
    isActiveIdx: index("fee_master_active").on(table.isActive)
}));
