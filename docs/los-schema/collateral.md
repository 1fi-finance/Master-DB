# LOS Collateral Domain

## Overview

The Collateral domain manages mutual fund collateral for loan applications. It tracks pledge details, RTA integrations, and lien information to ensure proper collateral management and compliance.

## Tables

### mutual_fund_collateral

Master table for managing mutual fund collateral used as security for loan applications.

**Primary Key:** `id` (UUID)

**Foreign Key:** `loanApplicationId` → `loan_applications.id` (ON DELETE RESTRICT)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique collateral record identifier |
| loanApplicationId | UUID | FK, NOT NULL | Reference to loan application |
| fundName | VARCHAR(255) | NOT NULL | Name of the mutual fund |
| fundHouse | VARCHAR(255) | NOT NULL | Mutual fund house/sponsor name |
| schemeCode | VARCHAR(50) | NOT NULL | Scheme identification code |
| folioNumber | VARCHAR(50) | NOT NULL | Folio number for the investment |
| mutualFundType | ENUM | NOT NULL | Type of mutual fund (equity, debt, hybrid, etf) |
| unitsPledged | DECIMAL(18,4) | NOT NULL | Number of units pledged as collateral |
| navAtPledge | DECIMAL(12,4) | NOT NULL | Net Asset Value at the time of pledge |
| collateralValue | DECIMAL(15,2) | NOT NULL | Calculated collateral value (units × NAV) |
| ltvApplied | DECIMAL(5,2) | NOT NULL | Loan-to-Value ratio applied to this collateral |
| rtaVerified | BOOLEAN | NOT NULL, DEFAULT false | Whether RTA verification is completed |
| rtaVerificationDate | TIMESTAMP | - | Date when RTA verification was completed |
| pledgeReferenceNumber | VARCHAR(100) | - | Legacy reference number for backward compatibility |
| validateId | VARCHAR(100) | - | Validation ID from RTA API |
| isin | VARCHAR(50) | - | International Securities Identification Number |
| rtaName | VARCHAR(50) | - | RTA (Registrar and Transfer Agent) name |
| amc | VARCHAR(100) | - | Asset Management Company name |
| lienRefNo | VARCHAR(100) | - | Lien reference number from RTA |
| lienStatus | VARCHAR(50) | - | Current status of the lien (e.g., "active", "released") |
| lienRemarks | TEXT | - | Remarks about the lien status |
| clientId | VARCHAR(100) | - | Client identifier in RTA system |
| lenderCode | VARCHAR(100) | - | Lender code in RTA system |
| apiResponse | JSONB | - | Raw API response data from RTA integration |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `mf_collateral_loan_app` on `loanApplicationId` - For querying collateral by loan application
- `mf_collateral_folio` on `folioNumber` - For searching by folio number
- `mf_collateral_lien_ref` on `lienRefNo` - For tracking lien references

**Relationships:**
- Many-to-one with `loan_applications` via `loanApplicationId`
- One collateral record per loan application (unique constraint implied)

**Business Rules:**

1. **Collateral Valuation:**
   - Collateral value is calculated as: `unitsPledged × navAtPledge`
   - LTV ratio determines maximum loan amount against the collateral
   - Regular valuation updates may be required for volatile funds

2. **RTA Integration:**
   - RTA verification must be completed before collateral can be used for loan processing
   - Lien information is real-time from RTA systems
   - API responses are stored for audit and troubleshooting purposes

3. **Lien Management:**
   - Lien status must be "active" for collateral to be valid
   - Lien release requires RTA confirmation and proper documentation
   - Multiple lien references may exist for complex pledge structures

4. **Compliance:**
   - All mutual funds must have valid ISIN numbers
   - Scheme codes must match RTA records
   - Regular validation of collateral ownership and pledge status

5. **Risk Management:**
   - LTV ratios may vary based on mutual fund type (equity vs debt funds)
   - Haircuts may be applied for volatile or illiquid funds
   - Regular monitoring of collateral value against outstanding loan amount
