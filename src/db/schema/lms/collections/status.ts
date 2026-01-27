import { serial, integer, date, decimal, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { collectionBucketTable } from "./bucket";
import { npaCategoryEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const loanCollectionStatusTable = lmsSchema.table("loan_collection_status", {
    id: serial().primaryKey(),
    loanAccountId: integer().references(() => loanAccountTable.id).notNull().unique(),

    // Bucket and DPD
    currentBucket: integer().references(() => collectionBucketTable.id),
    dpdDays: integer().notNull().default(0),

    // Payment Tracking
    lastPaymentDate: date(),

    // Overdue Amounts
    totalOverdueAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    principalOverdue: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    interestOverdue: decimal({ precision: 15, scale: 2 }).notNull().default("0"),
    feeOverdue: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // NPA Details
    npaDate: date(),
    npaCategory: npaCategoryEnum(),
    provisioningAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // Assignment
    assignedTo: varchar({ length: 255 }),
    assignedDate: date(),

    // Follow-up
    lastFollowUpDate: date(),
    nextFollowUpDate: date(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("loan_coll_status_loan_acc").on(table.loanAccountId),
    currentBucketIdx: index("loan_coll_status_bucket").on(table.currentBucket),
    dpdDaysIdx: index("loan_coll_status_dpd").on(table.dpdDays),
    assignedToIdx: index("loan_coll_status_assigned").on(table.assignedTo),
    npaCategoryIdx: index("loan_coll_status_npa").on(table.npaCategory)
}));
