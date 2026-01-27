import { serial, integer, varchar, decimal, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanApplicationStatusEnum } from "../enums";
import { usersTable } from "../users";
import { loanProductsTable } from "./products";
import { losSchema } from "../definitions";

export const loanApplicationsTable = losSchema.table("loan_applications", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),
    loanProductId: integer().references(() => loanProductsTable.id).notNull(),
    applicationNumber: varchar({ length: 50 }).notNull().unique(),
    status: loanApplicationStatusEnum().notNull().default("draft"),

    // Loan Details
    requestedLoanAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    requestedTenureMonths: integer().notNull(),
    emiType: varchar({ length: 20 }).notNull(),

    // Approved Details
    approvedLoanAmount: decimal({ precision: 15, scale: 2 }),
    approvedTenureMonths: integer(),
    approvedInterestRate: decimal({ precision: 8, scale: 4 }),
    approvedEmiAmount: decimal({ precision: 15, scale: 2 }),

    // Metadata
    rejectionReason: text(),
    submittedAt: timestamp(),
    approvedAt: timestamp(),
    reviewedBy: uuid().references(() => usersTable.id),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    userIdIdx: index("loan_app_user_id").on(table.userId),
    applicationNumberIdx: index("loan_app_number").on(table.applicationNumber),
    statusIdx: index("loan_app_status").on(table.status),
    createdAtIdx: index("loan_app_created").on(table.createdAt)
}));
