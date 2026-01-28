import { serial, integer, varchar, decimal, timestamp, date, index, uuid } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "../los/applications";
import { loanSanctionTable } from "../los/sanction";
import { loanStatusEnum } from "../enums";
import { lmsSchema } from "../definitions";

export const loanAccountTable = lmsSchema.table("loan_account", {
    id: uuid().defaultRandom().primaryKey(),
    loanApplicationId: uuid().references(() => loanApplicationsTable.id).notNull().unique(),
    loanSanctionId: uuid().references(() => loanSanctionTable.id).notNull(),
    accountNumber: varchar({ length: 50 }).notNull().unique(),

    // Loan Details
    principalAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    currentOutstanding: decimal({ precision: 15, scale: 2 }).notNull(),
    interestRate: decimal({ precision: 8, scale: 4 }).notNull(),
    tenureMonths: integer().notNull(),

    // Dates
    loanStartDate: timestamp().notNull(),
    loanEndDate: timestamp().notNull(),
    nextEmiDueDate: date(),

    // Status
    status: loanStatusEnum().notNull().default("active"),

    // Collateral Summary
    totalCollateralValue: decimal({ precision: 15, scale: 2 }).notNull(),
    currentLtv: decimal({ precision: 5, scale: 2 }).notNull(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("loan_acc_loan_app").on(table.loanApplicationId),
    accountNumberIdx: index("loan_acc_number").on(table.accountNumber),
    statusIdx: index("loan_acc_status").on(table.status),
    nextEmiIdx: index("loan_acc_next_emi").on(table.nextEmiDueDate)
}));
