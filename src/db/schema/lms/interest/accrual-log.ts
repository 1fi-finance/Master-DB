import { serial, integer, date, decimal, text, timestamp, index } from "drizzle-orm/pg-core";

import { lmsSchema } from "../../definitions";
import { accrualStatusEnum } from "../../enums";

export const accrualRunLogTable = lmsSchema.table("accrual_run_log", {
    id: serial().primaryKey(),

    // Run Details
    runDate: date().notNull(),
    startDate: date().notNull(),
    endDate: date().notNull(),

    // Summary
    loansProcessed: integer().notNull(),
    totalAccruedInterest: decimal({ precision: 15, scale: 2 }).notNull(),

    // Status
    status: accrualStatusEnum().notNull().default("pending"),
    errorMessage: text(),

    // Timing
    startedAt: timestamp().notNull(),
    completedAt: timestamp()
}, (table) => ({
    runDateIdx: index("accrual_log_run_date").on(table.runDate),
    statusIdx: index("accrual_log_status").on(table.status)
}));
