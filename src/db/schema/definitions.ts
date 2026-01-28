import { pgSchema } from "drizzle-orm/pg-core";

export const usersSchema = pgSchema("users");
export const losSchema = pgSchema("los");
export const lmsSchema = pgSchema("lms");
export const merchantSchema = pgSchema("merchant");
export const sharedSchema = pgSchema("shared");

