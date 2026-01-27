import { serial, integer, varchar, decimal, text, timestamp, index } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "../los/applications";
import { loanSanctionTable } from "../los/sanction";
import { disbursementStatusEnum } from "../enums";
import { lmsSchema } from "../definitions";

export const disbursementTable = lmsSchema.table("disbursement", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),
    loanSanctionId: integer().references(() => loanSanctionTable.id).notNull(),

    // Disbursement Details
    disbursementAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    disbursementDate: timestamp().notNull().defaultNow(),
    status: disbursementStatusEnum().notNull().default("pending"),

    // Bank Details
    beneficiaryAccountNumber: varchar({ length: 50 }).notNull(),
    beneficiaryIfsc: varchar({ length: 20 }).notNull(),
    beneficiaryName: varchar({ length: 255 }).notNull(),
    bankName: varchar({ length: 255 }).notNull(),

    // Transaction Details
    utrNumber: varchar({ length: 100 }),
    transactionReference: varchar({ length: 100 }),
    paymentGatewayReference: varchar({ length: 100 }),

    // Processing
    initiatedAt: timestamp(),
    completedAt: timestamp(),
    failureReason: text(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("disb_loan_app").on(table.loanApplicationId),
    utrIdx: index("disb_utr").on(table.utrNumber),
    statusIdx: index("disb_status").on(table.status),
    disbursementDateIdx: index("disb_date").on(table.disbursementDate)
}));
