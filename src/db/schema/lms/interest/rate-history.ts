import { serial, integer, decimal, date, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { lmsSchema } from "../../definitions";

export const interestRateHistoryTable = lmsSchema.table("interest_rate_history", {
    id: serial().primaryKey(),
    loanAccountId: integer().references(() => loanAccountTable.id).notNull(),

    // Rate Change Details
    effectiveDate: date().notNull(),
    oldRate: decimal({ precision: 8, scale: 4 }).notNull(),
    newRate: decimal({ precision: 8, scale: 4 }).notNull(),
    reason: text().notNull(),
    changedBy: varchar({ length: 255 }).notNull(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("int_rate_hist_loan_acc").on(table.loanAccountId),
    effectiveDateIdx: index("int_rate_hist_eff_date").on(table.effectiveDate),
    loanEffectiveDateIdx: index("int_rate_hist_loan_date").on(table.loanAccountId, table.effectiveDate)
}));
