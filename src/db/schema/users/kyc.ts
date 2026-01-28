import { serial, varchar, jsonb, date, text, boolean, timestamp, index, uuid } from "drizzle-orm/pg-core";

import { losSchema } from "../definitions";
import { usersTable } from "../users";

export const kycVerificationTable = losSchema.table("kyc_verification", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),

    aadhaarNumber: varchar({ length: 12 }),
    care_of: varchar({ length: 255 }),
    panNumber: varchar({ length: 10 }),
    fullName: varchar({ length: 255 }),
    gender: varchar({ length: 10 }),
    image: varchar({ length: 255 }),
    dateOfBirth: date(),
    address: jsonb(),

    // Verification Status
    isVerified: boolean().notNull().default(false),
    verificationDate: timestamp(),
    verificationRemarks: text(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    userIdIdx: index("kyc_user").on(table.userId),
    aadhaarIdx: index("kyc_aadhaar").on(table.aadhaarNumber),
    panIdx: index("kyc_pan").on(table.panNumber)
}));
