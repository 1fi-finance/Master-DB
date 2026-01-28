import { serial, integer, decimal, date, boolean, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { lmsSchema } from "../../definitions";

export const interestAccrualTable = lmsSchema.table("interest_accrual", {
    id: uuid().defaultRandom().primaryKey(),
    loanAccountId: uuid().references(() => loanAccountTable.id).notNull(),

    // Accrual Details
    accrualDate: date().notNull(),
    principalOutstanding: decimal({ precision: 15, scale: 2 }).notNull(),
    interestRate: decimal({ precision: 8, scale: 4 }).notNull(),
    daysInPeriod: integer().notNull(),
    accruedInterest: decimal({ precision: 15, scale: 2 }).notNull(),

    // Posting Status
    postedToLedger: boolean().notNull().default(false),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("int_accr_loan_acc").on(table.loanAccountId),
    accrualDateIdx: index("int_accr_date").on(table.accrualDate),
    postedToLedgerIdx: index("int_accr_posted").on(table.postedToLedger),
    loanAccrualDateIdx: index("int_accr_loan_date").on(table.loanAccountId, table.accrualDate)
}));
