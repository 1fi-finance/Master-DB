import { serial, integer, date, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanCollectionStatusTable } from "./status";
import { collectionActivityTypeEnum, collectionOutcomeEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const collectionActivityTable = lmsSchema.table("collection_activity", {
    id: uuid().defaultRandom().primaryKey(),
    loanCollectionStatusId: uuid().references(() => loanCollectionStatusTable.id).notNull(),

    // Activity Details
    activityType: collectionActivityTypeEnum().notNull(),
    activityDate: date().notNull(),
    notes: text(),

    // Outcome
    outcome: collectionOutcomeEnum(),
    nextActionDate: date(),

    // Assignment
    assignedTo: varchar({ length: 255 }).notNull(),

    createdAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanCollectionStatusIdIdx: index("coll_act_status").on(table.loanCollectionStatusId),
    activityDateIdx: index("coll_act_date").on(table.activityDate),
    activityTypeIdx: index("coll_act_type").on(table.activityType),
    assignedToIdx: index("coll_act_assigned").on(table.assignedTo)
}));
