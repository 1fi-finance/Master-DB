import { serial, integer, date, decimal, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { lmsSchema } from "../../definitions";

export const tenureChangeTable = lmsSchema.table("tenure_change", {
    id: serial().primaryKey(),
    loanAccountId: integer().references(() => loanAccountTable.id).notNull(),

    // Tenure Details
    oldTenureMonths: integer().notNull(),
    newTenureMonths: integer().notNull(),

    // Effective Date
    effectiveDate: date().notNull(),

    // Reason
    reason: text().notNull(),

    // Impact
    impactOnEmi: decimal({ precision: 15, scale: 2 }).notNull(),

    // Approval
    approvedBy: varchar({ length: 255 }),
    approvedAt: timestamp(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("tenure_change_loan_acc").on(table.loanAccountId),
    effectiveDateIdx: index("tenure_change_eff").on(table.effectiveDate)
}));
