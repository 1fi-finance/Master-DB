import { serial, integer, date, decimal, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { lmsSchema } from "../../definitions";

export const topUpLoanTable = lmsSchema.table("top_up_loan", {
    id: serial().primaryKey(),
    parentLoanAccountId: integer().references(() => loanAccountTable.id).notNull(),

    // Top-up Details
    topUpAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    newTotalLoan: decimal({ precision: 15, scale: 2 }).notNull(),

    // New Terms
    newTenure: integer().notNull(),
    newInterestRate: decimal({ precision: 8, scale: 4 }).notNull(),

    // Dates
    approvedDate: date(),
    disbursedDate: date(),

    // Status
    status: varchar({ length: 50 }).notNull().default("pending"),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    parentLoanAccountIdIdx: index("top_up_parent_loan").on(table.parentLoanAccountId),
    statusIdx: index("top_up_status").on(table.status),
    approvedDateIdx: index("top_up_app_date").on(table.approvedDate)
}));
