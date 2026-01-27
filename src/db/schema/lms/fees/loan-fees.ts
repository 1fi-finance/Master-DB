import { serial, integer, decimal, date, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { feeMasterTable } from "./fee-master";
import { feeStatusEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const loanFeesTable = lmsSchema.table("loan_fees", {
    id: serial().primaryKey(),
    loanAccountId: integer().references(() => loanAccountTable.id).notNull(),
    feeId: integer().references(() => feeMasterTable.id).notNull(),

    // Amount Details
    feeAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    waivedAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    paidAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    outstandingAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Dates
    applicableDate: date().notNull(),
    dueDate: date().notNull(),

    // Status
    status: feeStatusEnum().notNull().default("applicable"),

    // Waiver Details
    waivedBy: varchar({ length: 255 }),
    waivedReason: text(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("loan_fees_loan_acc").on(table.loanAccountId),
    feeIdIdx: index("loan_fees_fee_id").on(table.feeId),
    statusIdx: index("loan_fees_status").on(table.status),
    dueDateIdx: index("loan_fees_due_date").on(table.dueDate)
}));
