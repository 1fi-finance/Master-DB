import {
    serial,
    integer,
    varchar,
    text,
    timestamp,
    boolean,
    jsonb,
    index,
    uuid
} from "drizzle-orm/pg-core";
import { merchantSchema } from "../../definitions";

// Merchant Categories - Merchant-specific category trees
export const merchantCategoriesTable = merchantSchema.table("merchant_categories", {
    id: serial().primaryKey(),
    merchantId: uuid().notNull(), // Categories can be merchant-specific

    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    description: text(),

    // Category Hierarchant
    level: integer().notNull().default(0), // Depth in category tree
    path: text(), // Full path: Electronics > Mobile > Smartphones

    // Category Settings
    imageUrl: varchar({ length: 500 }),
    iconUrl: varchar({ length: 500 }),
    isActive: boolean().default(true),
    displayOrder: integer().default(0),

    // SEO
    metaTitle: varchar({ length: 255 }),
    metaDescription: text(),
    metaKeywords: text(),

    // Category Attributes (template for products in this category)
    attributeTemplate: jsonb(), // {"attributes": [{"name": "color", "type": "select", "required": true}]}

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("category_merchant").on(table.merchantId),
    slugIdx: index("category_slug").on(table.slug),
    isActiveIdx: index("category_active").on(table.isActive),
    displayOrderIdx: index("category_display_order").on(table.displayOrder)
}));
