import { serial, integer, varchar, jsonb, date, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { loanApplicationsTable } from "./applications";
import { usersTable } from "../users";
import { losSchema } from "../definitions";

export const kycVerificationTable = losSchema.table("kyc_verification", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),
    userId: integer().references(() => usersTable.id).notNull(),

    // KYC Provider Integration
    kycProvider: varchar({ length: 100 }),
    kycReferenceNumber: varchar({ length: 100 }),
    kycResponse: jsonb(),

    // KYC Details
    aadhaarNumber: varchar({ length: 12 }),
    panNumber: varchar({ length: 10 }),
    name: varchar({ length: 255 }),
    dateOfBirth: date(),
    address: text(),

    // Verification Status
    isVerified: boolean().notNull().default(false),
    verificationDate: timestamp(),
    verificationRemarks: text(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("kyc_loan_app").on(table.loanApplicationId),
    userIdIdx: index("kyc_user").on(table.userId),
    aadhaarIdx: index("kyc_aadhaar").on(table.aadhaarNumber),
    panIdx: index("kyc_pan").on(table.panNumber)
}));
