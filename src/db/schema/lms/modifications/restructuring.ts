import { date, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";

import { lmsSchema } from "../../definitions";
import { restructuringTypeEnum, restructuringStatusEnum } from "../../enums";
import { loanAccountTable } from "../account";

export const loanRestructuringTable = lmsSchema.table("loan_restructuring", {
    id: uuid().defaultRandom().primaryKey(),
    loanAccountId: uuid().references(() => loanAccountTable.id).notNull(),

    // Restructuring Details
    restructuringType: restructuringTypeEnum().notNull(),

    // Dates
    requestedDate: date().notNull(),
    effectiveDate: date(),
    approvedDate: date(),

    // Approval
    approvedBy: varchar({ length: 255 }),

    // Reason
    reason: text().notNull(),

    // Status
    status: restructuringStatusEnum().notNull().default("requested"),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("loan_restruct_loan_acc").on(table.loanAccountId),
    statusIdx: index("loan_restruct_status").on(table.status),
    requestedDateIdx: index("loan_restruct_req_date").on(table.requestedDate)
}));
