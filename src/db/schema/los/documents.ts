import { integer, varchar, text, timestamp, index, uuid } from "drizzle-orm/pg-core";

import { documentTypeEnum, documentStatusEnum } from "../enums";
import { loanApplicationsTable } from "./applications";
import { losSchema } from "../definitions";
import { usersTable } from "../users";

export const documentsTable = losSchema.table("documents", {
    id: uuid().defaultRandom().primaryKey(),
    loanApplicationId: uuid().references(() => loanApplicationsTable.id).notNull(),
    documentType: documentTypeEnum().notNull(),
    documentUrl: varchar({ length: 500 }).notNull(),
    fileName: varchar({ length: 255 }).notNull(),
    fileSize: integer(),
    status: documentStatusEnum().notNull().default("pending"),
    verificationRemarks: text(),
    verifiedBy: uuid().references(() => usersTable.id),
    verifiedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("docs_loan_app").on(table.loanApplicationId),
    documentTypeIdx: index("docs_type").on(table.documentType),
    statusIdx: index("docs_status").on(table.status)
}));
