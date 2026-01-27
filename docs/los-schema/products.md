# LOS Products

## Tables

### loan_products

Loan product definitions with configurable parameters for loan amounts, tenure, and fees.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique loan product identifier |
| name | VARCHAR(255) | NOT NULL | Display name of the loan product |
| code | VARCHAR(50) | NOT NULL, UNIQUE | Unique product code for system reference |
| description | TEXT | - | Detailed description of the loan product |
| minLoanAmount | DECIMAL(15,2) | NOT NULL | Minimum loan amount allowed |
| maxLoanAmount | DECIMAL(15,2) | NOT NULL | Maximum loan amount allowed |
| minTenureMonths | INTEGER | NOT NULL | Minimum loan tenure in months |
| maxTenureMonths | INTEGER | NOT NULL | Maximum loan tenure in months |
| baseInterestRate | DECIMAL(8,4) | NOT NULL | Base interest rate (percentage) |
| processingFeePercent | DECIMAL(8,4) | NOT NULL | Processing fee as percentage of loan amount |
| prepaymentFeePercent | DECIMAL(8,4) | NOT NULL, DEFAULT 0.0 | Prepayment penalty as percentage |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Product active/inactive status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- Primary key index on `id`
- Unique constraint on `code`

**Foreign Keys:**
- None (standalone master table)

**Relationships:**
- One-to-many with `ltv_config` via `id`
- One-to-many with loan applications via product reference

**Business Rules:**
- Product must have minLoanAmount < maxLoanAmount
- Product must have minTenureMonths < maxTenureMonths
- Interest rates must be positive (greater than 0)
- Processing fees cannot be negative
- Inactive products are not available for new loan applications
- Product code must be unique across all loan products
- Decimal precision ensures accurate financial calculations

---

### ltv_config

Loan-to-Value (LTV) ratio configuration for different mutual fund types as collateral.

**Primary Key:** `id` (UUID)

**Foreign Key:** `loanProductId` → `loan_products.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique LTV configuration identifier |
| loanProductId | UUID | FK, NOT NULL | Reference to loan product |
| mutualFundType | MUTUAL_FUND_TYPE | NOT NULL | Type of mutual fund for collateral |
| ltvRatio | DECIMAL(5,2) | NOT NULL | Maximum loan-to-value ratio (percentage) |
| minCollateralValue | DECIMAL(15,2) | NOT NULL | Minimum collateral value required |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- Primary key index on `id`
- Foreign key index on `loanProductId`
- Composite index recommended on `(loanProductId, mutualFundType)` for performance

**Foreign Keys:**
- `loanProductId` references `loan_products.id` with ON DELETE CASCADE

**Relationships:**
- Many-to-one with `loan_products` via `loanProductId`
- Each loan product can have multiple LTV configurations (one per mutual fund type)
- Each LTV configuration belongs to exactly one loan product

**Business Rules:**
- LTV ratio must be between 0.00 and 100.00 (0% to 100%)
- Minimum collateral value must be greater than 0
- Each loan product can have only one LTV configuration per mutual fund type
- LTV configuration cannot exist without a valid loan product
- Mutual fund type must be one of the predefined types in the enum
- Cascade deletion when parent loan product is deleted
