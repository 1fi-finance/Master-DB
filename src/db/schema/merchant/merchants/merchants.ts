import { uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";

import { merchantSchema } from "../../definitions";
import { storeTypeEnum, gstVerificationStatusEnum } from "../../enums";

export const merchants = merchantSchema.table("merchants", {
    id: uuid().primaryKey(),
    name: varchar({ length: 255 }).notNull(),
    slug: varchar({ length: 255 }).notNull(),
    description: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    isActive: boolean().default(false)
});

export const merchantKYC = merchantSchema.table("merchant_kyc", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),
    panNumber: varchar({ length: 10 }).notNull(),
    gstin: varchar({ length: 15 }).notNull(),
    bankAccountNumber: varchar({ length: 20 }).notNull(),
    bankName: varchar({ length: 255 }).notNull(),
    bankBranch: varchar({ length: 255 }).notNull(),
    bankIfsc: varchar({ length: 11 }).notNull(),
    bankAccountHolderName: varchar({ length: 255 }).notNull(),
    bankAccountType: varchar({ length: 20 }).notNull(),
    upiId: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 20 }).notNull().default("pending"),
    primaryContactName: varchar({ length: 255 }).notNull(),
    primaryContactPhone: varchar({ length: 15 }).notNull(),
    primaryContactEmail: varchar({ length: 255 }).notNull(),
    businessPhone: varchar({ length: 15 }),
    businessEmail: varchar({ length: 255 }),
    address: text().notNull(),
    city: varchar({ length: 100 }).notNull(),
    state: varchar({ length: 100 }).notNull(),
    pincode: varchar({ length: 10 }).notNull(),
    country: varchar({ length: 100 }).default("India"),
    commissionRate: decimal({ precision: 5, scale: 2 }).default("0.00"),
    logoUrl: varchar({ length: 500 }),
    businessDescription: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),

    // GST Verification Fields
    gstVerificationStatus: gstVerificationStatusEnum().default("pending"),
    gstVerifiedAt: timestamp(),
    gstVerificationData: jsonb(),  // Full API response for audit
    gstLegalName: varchar({ length: 255 }),
    gstTradeName: varchar({ length: 255 }),
    gstConstitution: varchar({ length: 100 }),  // "Private Limited Company", etc.
    gstType: varchar({ length: 50 }),  // "Regular", "Composition", etc.
    gstState: varchar({ length: 100 }),
    gstStateCode: varchar({ length: 10 }),
    gstRegisteredDate: varchar({ length: 20 }),
    gstActive: boolean(),
    gstEinvoiceEnabled: boolean(),
});

export const merchantStoresTable = merchantSchema.table("merchant_stores", {
    id: uuid().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),

    storeName: varchar({ length: 255 }).notNull(),
    storeCode: varchar({ length: 50 }).unique().notNull(),
    storeType: storeTypeEnum().notNull(),

    // Address for physical stores
    address: text(),
    landmark: varchar({ length: 255 }),
    city: varchar({ length: 100 }),
    state: varchar({ length: 100 }),
    pincode: varchar({ length: 10 }),
    country: varchar({ length: 100 }).default("India"),
    gstin: varchar({ length: 15 }).notNull(),
    bankAccountNumber: varchar({ length: 20 }).notNull(),
    bankName: varchar({ length: 255 }).notNull(),
    bankBranch: varchar({ length: 255 }).notNull(),
    bankIfsc: varchar({ length: 11 }).notNull(),
    bankAccountHolderName: varchar({ length: 255 }).notNull(),
    bankAccountType: varchar({ length: 20 }).notNull(),
    upiId: varchar({ length: 255 }).notNull(),
    status: varchar({ length: 20 }).notNull().default("pending"),

    // Geolocation for store locator
    latitude: decimal({ precision: 10, scale: 8 }),
    longitude: decimal({ precision: 11, scale: 8 }),
    radiusKm: integer().default(10), // Search radius for store locator

    // Contact Details
    phone: varchar({ length: 15 }),
    email: varchar({ length: 255 }),

    // Operating Hours
    operatingHours: jsonb(), // {"monday": {"open": "09:00", "close": "21:00"}, ...}

    // Store-specific Settings
    isActive: boolean().default(true),
    isDefault: boolean().default(false), // Default store for online orders
    supportsPickup: boolean().default(true),
    supportsBopis: boolean().default(true), // Buy Online, Pick Up In Store
    commissionRate: decimal({ precision: 5, scale: 2 }).default("0.00"),
    // Store Manager
    storeManagerName: varchar({ length: 255 }),
    storeManagerPhone: varchar({ length: 15 }),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),

    // GST Verification Fields
    gstVerificationStatus: gstVerificationStatusEnum().default("pending"),
    gstVerifiedAt: timestamp(),
    gstVerificationData: jsonb(),  // Full API response for audit
    gstLegalName: varchar({ length: 255 }),
    gstTradeName: varchar({ length: 255 }),
    gstConstitution: varchar({ length: 100 }),
    gstType: varchar({ length: 50 }),
    gstState: varchar({ length: 100 }),
    gstStateCode: varchar({ length: 10 }),
    gstRegisteredDate: varchar({ length: 20 }),
    gstActive: boolean(),
    gstEinvoiceEnabled: boolean(),
}, (table) => ({
    merchantIdIdx: index("store_merchant_id").on(table.merchantId),
    storeCodeIdx: index("store_code").on(table.storeCode),
    storeTypeIdx: index("store_type").on(table.storeType),
    locationIdx: index("store_location").on(table.latitude, table.longitude),
    isActiveIdx: index("store_active").on(table.isActive)
}));
