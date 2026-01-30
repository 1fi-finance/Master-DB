import { varchar, integer, timestamp, boolean, uuid } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { userStatusEnum } from "../enums";


export const usersTable = usersSchema.table("users", {
    id: uuid().primaryKey(),
    fullName: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    pan: varchar({ length: 35 }),
    pekrn: varchar({ length: 15 }),
    mobile: varchar({ length: 13 }),
    email: varchar({ length: 255 }),
    status: userStatusEnum().notNull().default("pending"),
    emailVerified: boolean().notNull().default(false),
    mobileVerified: boolean().notNull().default(false),
    panVerified: boolean().notNull().default(false),
    pekrnVerified: boolean().notNull().default(false),
    kycVerified: boolean().notNull().default(false),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),


});

// Re-export autopayTable for modules that need both users and autopay
export { autopayTable } from "./autopay";
