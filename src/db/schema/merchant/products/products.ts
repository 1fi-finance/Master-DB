import {
    integer,
    uuid,
    varchar,
    text,
    timestamp,
    boolean,
    decimal,
    jsonb,
    index
} from "drizzle-orm/pg-core";

import { merchantCategoriesTable } from "./categories";
import { merchantSchema } from "../../definitions";
import { merchants } from "../../merchant/merchants/merchants";

// Products - Merchant product catalog
export const productsTable = merchantSchema.table("products", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid().references(() => merchantCategoriesTable.id),

    // Product Identity
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    sku: varchar({ length: 100 }).notNull(),
    barcode: varchar({ length: 50 }),

    // Product Type
    productType: varchar({ length: 20 }).notNull().default("product"),

    // Description
    shortDescription: varchar({ length: 500 }),
    longDescription: text(),

    // Pricing
    basePrice: decimal({ precision: 15, scale: 2 }).notNull(),
    compareAtPrice: decimal({ precision: 15, scale: 2 }), // MRP for strike-through pricing

    // Cost
    costPrice: decimal({ precision: 15, scale: 2 }), // For margin calculations

    // Tax
    taxRate: decimal({ precision: 5, scale: 2 }).default("18.00"), // GST %
    taxIncluded: boolean().default(true), // Price includes tax

    // Inventory Tracking
    trackInventory: boolean().default(true),
    allowBackorder: boolean().default(false),
    lowStockThreshold: integer().default(10),

    // Product Status
    isActive: boolean().default(true),
    isFeatured: boolean().default(false),

    // SEO
    metaTitle: varchar({ length: 255 }),
    metaDescription: text(),
    metaKeywords: text(),

    // Media
    primaryImageUrl: varchar({ length: 500 }),
    additionalImages: jsonb(), // Array of image URLs

    // Merchant-defined Attributes
    attributes: jsonb(), // {"color": "Red", "size": "M", "material": "Cotton"}

    // Weight & Dimensions
    weight: decimal({ precision: 10, scale: 2 }), // in grams
    weightUnit: varchar({ length: 10 }).default("g"),
    length: decimal({ precision: 10, scale: 2 }),
    width: decimal({ precision: 10, scale: 2 }),
    height: decimal({ precision: 10, scale: 2 }),
    dimensionUnit: varchar({ length: 10 }).default("cm"),

    // Product Specifications
    specifications: jsonb(), // {"brand": "Samsung", "model": "Galaxy S21", "warranty": "1 year"}

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("product_merchant").on(table.merchantId),
    categoryIdIdx: index("product_category").on(table.categoryId),
    skuIdx: index("product_sku").on(table.sku),
    slugIdx: index("product_slug").on(table.slug),
    barcodeIdx: index("product_barcode").on(table.barcode),
    isActiveIdx: index("product_active").on(table.isActive),
    isFeaturedIdx: index("product_featured").on(table.isFeatured),
    createdAtIdx: index("product_created").on(table.createdAt)
}));

// Product Variants - For size, color, etc.
export const productVariantsTable = merchantSchema.table("product_variants", {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }).notNull(),

    // Variant Identity
    variantSku: varchar({ length: 100 }).notNull(),
    variantName: varchar({ length: 255 }).notNull(), // "Red - Large"
    barcode: varchar({ length: 50 }),

    // Variant Attributes
    attributes: jsonb().notNull(), // {"color": "Red", "size": "Large"}

    // Variant Pricing (can differ from base product)
    price: decimal({ precision: 15, scale: 2 }).notNull(),
    compareAtPrice: decimal({ precision: 15, scale: 2 }),
    costPrice: decimal({ precision: 15, scale: 2 }),

    // Inventory
    stockAvailable: integer().notNull().default(0),
    stockOnOrder: integer().default(0),
    lowStockThreshold: integer().default(5),

    // Variant Status
    isActive: boolean().default(true),

    // Media
    imageUrl: varchar({ length: 500 }),

    // Weight & Dimensions (can differ from base product)
    weight: decimal({ precision: 10, scale: 2 }),
    weightUnit: varchar({ length: 10 }).default("g"),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    productIdIdx: index("variant_product").on(table.productId),
    variantSkuIdx: index("variant_sku").on(table.variantSku),
    barcodeIdx: index("variant_barcode").on(table.barcode),
    isActiveIdx: index("variant_active").on(table.isActive),
    stockIdx: index("variant_stock").on(table.stockAvailable)
}));

// Product Bundles - Product + Service bundles
export const productBundlesTable = merchantSchema.table("product_bundles", {
    id: uuid().defaultRandom().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),

    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    sku: varchar({ length: 100 }).notNull(),
    description: text(),

    // Bundle Pricing
    bundlePrice: decimal({ precision: 15, scale: 2 }).notNull(),
    compareAtPrice: decimal({ precision: 15, scale: 2 }), // Sum of individual prices

    // Discount
    discountAmount: decimal({ precision: 15, scale: 2 }),
    discountPercentage: decimal({ precision: 5, scale: 2 }),

    // Bundle Components (JSON array of product/variant IDs with quantities)
    components: jsonb().notNull(), // [{"type": "product", "id": 123, "quantity": 1}, {"type": "variant", "id": 456, "quantity": 2}]

    // Availability
    isActive: boolean().default(true),
    isAvailable: boolean().default(true), // Based on component availability

    // Media
    primaryImageUrl: varchar({ length: 500 }),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("bundle_merchant").on(table.merchantId),
    skuIdx: index("bundle_sku").on(table.sku),
    slugIdx: index("bundle_slug").on(table.slug),
    isActiveIdx: index("bundle_active").on(table.isActive)
}));

// Channel-Specific Pricing - Omnichannel pricing support
export const productChannelPricingTable = merchantSchema.table("product_channel_pricing", {
    id: uuid().defaultRandom().primaryKey(),
    productId: uuid().references(() => productsTable.id, { onDelete: "cascade" }),
    productVariantId: uuid().references(() => productVariantsTable.id, { onDelete: "cascade" }),
    bundleId: uuid().references(() => productBundlesTable.id, { onDelete: "cascade" }),

    // Channel Type
    channel: varchar({ length: 20 }).notNull(), // online, offline, pos
    pricingType: varchar({ length: 20 }).notNull().default("standard"),

    // Channel-specific Price
    price: decimal({ precision: 15, scale: 2 }).notNull(),
    compareAtPrice: decimal({ precision: 15, scale: 2 }),

    // Effective Dates
    effectiveFrom: timestamp().notNull().defaultNow(),
    effectiveTo: timestamp(),

    // Store-specific (if applicable)
    storeId: uuid(), // For store-specific pricing

    isActive: boolean().default(true),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    productIdIdx: index("channel_price_product").on(table.productId),
    variantIdIdx: index("channel_price_variant").on(table.productVariantId),
    bundleIdIdx: index("channel_price_bundle").on(table.bundleId),
    channelIdx: index("channel_price_channel").on(table.channel),
    storeIdIdx: index("channel_price_store").on(table.storeId),
    isActiveIdx: index("channel_price_active").on(table.isActive),
    effectiveDatesIdx: index("channel_price_dates").on(table.effectiveFrom, table.effectiveTo)
}));
