import { serial, integer, decimal, date, boolean, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { emiScheduleTable } from "../repayment";
import { lmsSchema } from "../../definitions";

export const penaltyCalculationTable = lmsSchema.table("penalty_calculation", {
    id: uuid().defaultRandom().primaryKey(),
    emiScheduleId: uuid().references(() => emiScheduleTable.id).notNull(),

    // Penalty Details
    overdueDays: integer().notNull(),
    penaltyAmount: decimal({ precision: 15, scale: 2 }).notNull(),
    calculatedDate: date().notNull(),

    // Waiver
    waived: boolean().notNull().default(false),
    waivedBy: varchar({ length: 255 }),
    waivedReason: text(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    emiScheduleIdIdx: index("penalty_emi_sched").on(table.emiScheduleId),
    calculatedDateIdx: index("penalty_calc_date").on(table.calculatedDate),
    waivedIdx: index("penalty_waived").on(table.waived)
}));
