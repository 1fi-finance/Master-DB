import { decimal, date, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";

import { loanAccountTable } from "../account";
import { feeMasterTable } from "./fee-master";
import { lmsSchema } from "../../definitions";
import { feeStatusEnum } from "../../enums";

export const loanFeesTable = lmsSchema.table("loan_fees", {
    id: uuid().defaultRandom().primaryKey(),
    loanAccountId: uuid().references(() => loanAccountTable.id).notNull(),
    feeId: uuid().references(() => feeMasterTable.id).notNull(),

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
