import { serial, integer, date, decimal, varchar, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { adjustmentReasonEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const interestRateAdjustmentTable = lmsSchema.table("interest_rate_adjustment", {
    id: serial().primaryKey(),
    loanAccountId: integer().references(() => loanAccountTable.id).notNull(),

    // Rate Details
    effectiveFrom: date().notNull(),
    previousRate: decimal({ precision: 8, scale: 4 }).notNull(),
    newRate: decimal({ precision: 8, scale: 4 }).notNull(),

    // Reason
    adjustmentReason: adjustmentReasonEnum().notNull(),

    // Approval
    approvedBy: varchar({ length: 255 }),
    approvedAt: timestamp(),

    // Link to Restructuring
    linkedToRestructuring: boolean().notNull().default(false),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("int_rate_adj_loan_acc").on(table.loanAccountId),
    effectiveFromIdx: index("int_rate_adj_eff").on(table.effectiveFrom),
    linkedToRestructuringIdx: index("int_rate_adj_restruct").on(table.linkedToRestructuring)
}));
