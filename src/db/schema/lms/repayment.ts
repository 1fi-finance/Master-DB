import { serial, integer, decimal, date, varchar, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "../los/applications";
import { loanSanctionTable } from "../los/sanction";
import { emiStatusEnum } from "../enums";
import { lmsSchema } from "../definitions";

export const emiScheduleTable = lmsSchema.table("emi_schedule", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),
    loanSanctionId: integer().references(() => loanSanctionTable.id).notNull(),

    // Schedule Details
    installmentNumber: integer().notNull(),
    dueDate: date().notNull(),

    // Payment Breakdown
    principalAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    interestAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    totalEmiAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Outstanding Tracking
    openingPrincipal: decimal({ precision: 15, scale: 2 }).notNull(),
    closingPrincipal: decimal({ precision: 15, scale: 2 }).notNull(),

    // Status
    status: emiStatusEnum().notNull().default("scheduled"),

    // Actual Payment Details
    paidDate: timestamp(),
    paidAmount: decimal({ precision: 15, scale: 2 }),
    overdueDays: integer().notNull().default(0),
    latePaymentCharges: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("emi_loan_app").on(table.loanApplicationId),
    dueDateIdx: index("emi_due_date").on(table.dueDate),
    statusIdx: index("emi_status").on(table.status),
    installmentIdx: index("emi_installment").on(table.loanApplicationId, table.installmentNumber)
}));

export const repaymentTable = lmsSchema.table("repayment", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),
    emiScheduleId: integer().references(() => emiScheduleTable.id),

    // Payment Details
    paymentAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    paymentDate: timestamp().notNull().defaultNow(),
    paymentMode: varchar({ length: 50 }).notNull(),

    // Breakdown
    principalComponent: decimal({ precision: 15, scale: 2 }).notNull(),
    interestComponent: decimal({ precision: 15, scale: 2 }).notNull(),
    latePaymentCharges: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // Transaction Details
    transactionReference: varchar({ length: 100 }).notNull(),
    utrNumber: varchar({ length: 100 }),
    paymentGatewayResponse: jsonb(),

    // Allocation
    allocatedToEmiNumbers: varchar({ length: 500 }),
    foreclosurePayment: boolean().notNull().default(false),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("repayment_loan_app").on(table.loanApplicationId),
    emiScheduleIdIdx: index("repayment_emi").on(table.emiScheduleId),
    transactionRefIdx: index("repayment_txn").on(table.transactionReference),
    paymentDateIdx: index("repayment_date").on(table.paymentDate)
}));
