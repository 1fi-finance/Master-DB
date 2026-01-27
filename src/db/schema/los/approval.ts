import { serial, integer, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "./applications";
import { usersTable } from "../users";
import { approvalStatusEnum } from "../enums";
import { losSchema } from "../definitions";

export const approvalWorkflowTable = losSchema.table("approval_workflow", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),

    // Approval Hierarchy
    approverId: uuid().references(() => usersTable.id).notNull(),
    approvalLevel: integer().notNull(),
    role: varchar({ length: 100 }).notNull(),

    // Status
    status: approvalStatusEnum().notNull().default("pending"),
    remarks: text(),
    approvedAt: timestamp(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("approval_loan_app").on(table.loanApplicationId),
    approverIdIdx: index("approval_approver").on(table.approverId),
    statusIdx: index("approval_status").on(table.status)
}));
