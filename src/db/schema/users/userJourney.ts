import { uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";

import { usersSchema } from "../definitions";
import { usersTable } from "./index";
import { productsTable, productVariantsTable } from "../merchant/products/products";
import { sessionJourney } from "../shared/index";
import { loanApplicationsTable } from "../los/applications";
export const userJourney = usersSchema.table("merchant_user_journey", {
    id: uuid().primaryKey(),
    sessionId: uuid().references(() => sessionJourney.id).notNull(),
    userId: uuid().references(() => usersTable.id).notNull(),
    page: varchar({ length: 255 }).notNull(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }).notNull(),
    variantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }).notNull(),
    loanApplicationId: uuid().references(() => loanApplicationsTable.id),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    pageIdx: index("user_journey_page").on(table.page),
    productIdIdx: index("user_journey_product").on(table.productId),
    variantIdIdx: index("user_journey_variant").on(table.variantId),
    createdAtIdx: index("user_journey_created").on(table.createdAt)
}))