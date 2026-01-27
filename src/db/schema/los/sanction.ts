import { serial, integer, varchar, decimal, timestamp, boolean, index, uuid } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "./applications";
import { usersTable } from "../users";
import { losSchema } from "../definitions";

export const loanSanctionTable = losSchema.table("loan_sanction", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull().unique(),

    // Sanction Details
    sanctionLetterNumber: varchar({ length: 100 }).notNull().unique(),
    sanctionedAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    sanctionedInterestRate: decimal({ precision: 8, scale: 4 }).notNull(),
    sanctionedTenureMonths: integer().notNull(),
    sanctionDate: timestamp().notNull().defaultNow(),
    validUntil: timestamp().notNull(),

    // EMI Details
    emiType: varchar({ length: 20 }).notNull(),
    emiAmount: decimal({ precision: 15, scale: 2 }),
    totalInterestPayable: decimal({ precision: 15, scale: 2 }).notNull(),
    totalAmountPayable: decimal({ precision: 15, scale: 2 }).notNull(),

    // Sanction Terms
    processingFees: decimal({ precision: 15, scale: 2 }).notNull(),
    otherCharges: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // Agreement Details
    agreementGenerated: boolean().notNull().default(false),
    agreementUrl: varchar({ length: 500 }),
    agreementSignedAt: timestamp(),
    agreementIp: varchar({ length: 50 }),

    sanctionedBy: uuid().references(() => usersTable.id).notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("sanction_loan_app").on(table.loanApplicationId),
    sanctionLetterIdx: index("sanction_letter").on(table.sanctionLetterNumber),
    sanctionDateIdx: index("sanction_date").on(table.sanctionDate)
}));
