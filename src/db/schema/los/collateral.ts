import { serial, integer, varchar, decimal, boolean, timestamp, index, jsonb, text } from "drizzle-orm/pg-core";
import { mutualFundTypeEnum } from "../enums";
import { loanApplicationsTable } from "./applications";
import { losSchema } from "../definitions";

export const mutualFundCollateralTable = losSchema.table("mutual_fund_collateral", {
    id: serial().primaryKey(),
    loanApplicationId: integer().references(() => loanApplicationsTable.id).notNull(),

    // Mutual Fund Details
    fundName: varchar({ length: 255 }).notNull(),
    fundHouse: varchar({ length: 255 }).notNull(),
    schemeCode: varchar({ length: 50 }).notNull(),
    folioNumber: varchar({ length: 50 }).notNull(),
    mutualFundType: mutualFundTypeEnum().notNull(),

    // Unit & Value Details
    unitsPledged: decimal({ precision: 18, scale: 4 }).notNull(),
    navAtPledge: decimal({ precision: 12, scale: 4 }).notNull(),
    collateralValue: decimal({ precision: 15, scale: 2 }).notNull(),
    ltvApplied: decimal({ precision: 5, scale: 2 }).notNull(),

    // RTA Integration Details
    rtaVerified: boolean().notNull().default(false),
    rtaVerificationDate: timestamp(),
    pledgeReferenceNumber: varchar({ length: 100 }), // Keep for backward compatibility or internal ref

    // New RTA/Pledge Fields
    validateId: varchar({ length: 100 }),
    isin: varchar({ length: 50 }),
    rtaName: varchar({ length: 50 }),
    amc: varchar({ length: 100 }),
    lienRefNo: varchar({ length: 100 }),
    lienStatus: varchar({ length: 50 }),
    lienRemarks: text(),
    clientId: varchar({ length: 100 }),
    lenderCode: varchar({ length: 100 }),
    apiResponse: jsonb(),

    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow()
}, (table) => ({
    loanAppIdIdx: index("mf_collateral_loan_app").on(table.loanApplicationId),
    folioNumberIdx: index("mf_collateral_folio").on(table.folioNumber),
    lienRefIdx: index("mf_collateral_lien_ref").on(table.lienRefNo)
}));
