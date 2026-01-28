import { integer, decimal, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { loanRestructuringTable } from "./restructuring";
import { lmsSchema } from "../../definitions";

export const restructuringTermsTable = lmsSchema.table("restructuring_terms", {
    id: uuid().defaultRandom().primaryKey(),
    loanRestructuringId: uuid().references(() => loanRestructuringTable.id).notNull(),

    // Tenure Changes
    oldTenure: integer().notNull(),
    newTenure: integer().notNull(),

    // Interest Rate Changes
    oldInterestRate: decimal({ precision: 8, scale: 4 }).notNull(),
    newInterestRate: decimal({ precision: 8, scale: 4 }).notNull(),

    // EMI Changes
    oldEmiAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    newEmiAmount: decimal({ precision: 15, scale: 2 }).notNull(),

    // Moratorium
    moratoriumPeriod: integer().notNull().default(0),
    moratoriumReason: text(),

    // Charges
    restructuringCharges: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    createdAt: timestamp().notNull().defaultNow()
});
