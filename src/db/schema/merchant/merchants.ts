import {
    serial,
    uuid,
    varchar,
    timestamp,
    boolean,
    decimal,
    integer,
    index
} from "drizzle-orm/pg-core";

import { merchantSchema } from "../definitions";
import { merchants } from "./merchants/merchants";


export { merchants, merchantKYC, merchantStoresTable } from "./merchants/merchants";

// Merchant Settlement Configuration
export const merchantSettlementConfigTable = merchantSchema.table("merchant_settlement_config", {
    id: serial().primaryKey(),
    merchantId: uuid().references(() => merchants.id, { onDelete: "cascade" }).notNull(),

    // Settlement Cycle
    settlementCycleDays: integer().notNull(), // T+7, T+15, etc.
    settlementDayOfMonth: integer(), // For monthly settlements (1-30)

    // Bank Details for Settlements
    settlementBankAccount: varchar({ length: 35 }).notNull(),
    settlementBankIfsc: varchar({ length: 11 }).notNull(),
    settlementBankAccountName: varchar({ length: 255 }).notNull(),

    // Reserve Configuration (not used - always 0% per requirements)
    reservePercentage: integer().default(0),
    reserveReleaseDays: integer(),

    // Settlement Thresholds
    minimumSettlementAmount: decimal({ precision: 15, scale: 2 }).default("1000.00"),

    // Auto Settlement
    autoSettlementEnabled: boolean().default(true),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    merchantIdIdx: index("settlement_config_merchant").on(table.merchantId)
}));
