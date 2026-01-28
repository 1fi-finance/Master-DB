import { serial, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { usersTable } from "./index";

export const casData = usersSchema.table("cas_data", {
    id: serial().primaryKey(),
    userId: uuid().references(() => usersTable.id).notNull(),
    casData: jsonb().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
});