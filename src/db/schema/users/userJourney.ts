import { uuid, varchar, timestamp, jsonb, index } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { usersTable } from "./index";
import { productsTable, productVariantsTable } from "../merchant/products/products";
import { sessionJourney } from "../shared/index";
import { loanApplicationsTable } from "../los/applications";
export const userJourney = usersSchema.table("logged_in_user_journey", {
    id: uuid().defaultRandom().primaryKey(),
    journeySessionId: uuid().notNull(),
    sessionId: uuid().references(() => sessionJourney.id),
    userId: uuid().references(() => usersTable.id).notNull(),
    page: varchar({ length: 255 }).notNull(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }),
    variantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }),
    loanApplicationId: uuid().references(() => loanApplicationsTable.id),
    metadata: jsonb(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    journeySessionIdIdx: index("logged_in_journey_session_id").on(table.journeySessionId),
    pageIdx: index("user_journey_page").on(table.page),
    productIdIdx: index("user_journey_product").on(table.productId),
    variantIdIdx: index("user_journey_variant").on(table.variantId),
    createdAtIdx: index("user_journey_created").on(table.createdAt)
}))
