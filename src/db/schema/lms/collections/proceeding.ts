import { serial, integer, date, decimal, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";
import { loanAccountTable } from "../account";
import { proceedingTypeEnum, proceedingStageEnum } from "../../enums";
import { lmsSchema } from "../../definitions";

export const recoveryProceedingTable = lmsSchema.table("recovery_proceeding", {
    id: uuid().defaultRandom().primaryKey(),
    loanAccountId: uuid().references(() => loanAccountTable.id).notNull(),

    // Proceeding Details
    proceedingType: proceedingTypeEnum().notNull(),
    stage: proceedingStageEnum().notNull().default("initiated"),

    // Case Information
    filingDate: date().notNull(),
    caseNumber: varchar({ length: 100 }),
    courtName: varchar({ length: 255 }),
    lawyerName: varchar({ length: 255 }),

    // Financial
    legalCharges: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // Recovery
    expectedRecoveryDate: date(),
    actualRecoveryDate: date(),
    recoveryAmount: decimal({ precision: 15, scale: 2 }).notNull().default("0"),

    // Status
    status: varchar({ length: 50 }).notNull().default("active"),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAccountIdIdx: index("rec_proc_loan_acc").on(table.loanAccountId),
    proceedingTypeIdx: index("rec_proc_type").on(table.proceedingType),
    stageIdx: index("rec_proc_stage").on(table.stage),
    statusIdx: index("rec_proc_status").on(table.status),
    caseNumberIdx: index("rec_proc_case_num").on(table.caseNumber)
}));
