import { serial, integer, decimal, date, varchar, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanFeesTable } from "./loan-fees";
import { lmsSchema } from "../../definitions";

export const feePaymentTable = lmsSchema.table("fee_payment", {
    id: uuid().defaultRandom().primaryKey(),
    loanFeeId: uuid().references(() => loanFeesTable.id).notNull(),

    // Payment Details
    paymentAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    paymentDate: date().notNull(),
    paymentMode: varchar({ length: 50 }).notNull(),

    // Transaction References
    transactionReference: varchar({ length: 100 }),
    utrNumber: varchar({ length: 100 }),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanFeeIdIdx: index("fee_pay_loan_fee").on(table.loanFeeId),
    paymentDateIdx: index("fee_pay_date").on(table.paymentDate),
    utrIdx: index("fee_pay_utr").on(table.utrNumber)
}));
