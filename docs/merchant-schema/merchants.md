# Merchants

## Tables

### merchants

Merchant master table containing basic merchant information.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique merchant identifier |
| name | VARCHAR(255) | NOT NULL | Merchant business name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly identifier |
| description | TEXT | - | Business description |
| isActive | BOOLEAN | DEFAULT false | Merchant active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:** None (primary lookups by ID)

**Relationships:**
- One-to-many with `merchant_kyc` via `id`
- One-to-many with `merchant_stores` via `id`
- One-to-many with `products` via `id`
- One-to-many with `merchant_settlement_config` via `id`

---

### merchant_kyc

Know Your Customer (KYC) information for merchants.

**Primary Key:** `id` (UUID)

**Foreign Key:** `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique KYC record identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| panNumber | VARCHAR(10) | NOT NULL | PAN number for tax ID |
| gstin | VARCHAR(15) | NOT NULL | GST identification number |
| bankAccountNumber | VARCHAR(20) | NOT NULL | Bank account for settlements |
| bankName | VARCHAR(255) | NOT NULL | Bank name |
| bankBranch | VARCHAR(255) | NOT NULL | Bank branch name |
| bankIfsc | VARCHAR(11) | NOT NULL | IFSC code |
| bankAccountHolderName | VARCHAR(255) | NOT NULL | Account holder name |
| bankAccountType | VARCHAR(20) | NOT NULL | Account type (savings/current) |
| upiId | VARCHAR(255) | NOT NULL | UPI ID for payments |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | KYC verification status |
| primaryContactName | VARCHAR(255) | NOT NULL | Primary contact person |
| primaryContactPhone | VARCHAR(15) | NOT NULL | Primary contact phone |
| primaryContactEmail | VARCHAR(255) | NOT NULL | Primary contact email |
| businessPhone | VARCHAR(15) | - | Business phone number |
| businessEmail | VARCHAR(255) | - | Business email |
| address | TEXT | NOT NULL | Business address |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(100) | NOT NULL | State |
| pincode | VARCHAR(10) | NOT NULL | Postal code |
| country | VARCHAR(100) | DEFAULT 'India' | Country |
| commissionRate | DECIMAL(5,2) | DEFAULT 0.00 | Platform commission rate |
| logoUrl | VARCHAR(500) | - | Merchant logo URL |
| businessDescription | TEXT | - | Detailed business description |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- KYC must be verified (`status = 'verified'`) before merchant can process payments
- Bank account details used for settlement payouts
- Commission rate applies to all transactions (unless overridden at store level)

---

### merchant_stores

Physical and virtual stores for multi-location merchants.

**Primary Key:** `id` (UUID)

**Foreign Key:** `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique store identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| storeName | VARCHAR(255) | NOT NULL | Store display name |
| storeCode | VARCHAR(50) | UNIQUE, NOT NULL | Unique store code |
| storeType | VARCHAR(20) | NOT NULL | Store type (online/physical) |
| address | TEXT | - | Store address |
| landmark | VARCHAR(255) | - | Nearby landmark |
| city | VARCHAR(100) | - | City |
| state | VARCHAR(100) | - | State |
| pincode | VARCHAR(10) | - | Postal code |
| country | VARCHAR(100) | DEFAULT 'India' | Country |
| gstin | VARCHAR(15) | NOT NULL | GST identification number |
| bankAccountNumber | VARCHAR(20) | NOT NULL | Bank account for settlements |
| bankName | VARCHAR(255) | NOT NULL | Bank name |
| bankBranch | VARCHAR(255) | NOT NULL | Bank branch name |
| bankIfsc | VARCHAR(11) | NOT NULL | IFSC code |
| bankAccountHolderName | VARCHAR(255) | NOT NULL | Account holder name |
| bankAccountType | VARCHAR(20) | NOT NULL | Account type |
| upiId | VARCHAR(255) | NOT NULL | UPI ID for payments |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Store status |
| latitude | DECIMAL(10,8) | - | Latitude for store locator |
| longitude | DECIMAL(11,8) | - | Longitude for store locator |
| radiusKm | INTEGER | DEFAULT 10 | Search radius for store locator |
| phone | VARCHAR(15) | - | Store phone number |
| email | VARCHAR(255) | - | Store email |
| operatingHours | JSONB | - | Operating hours by day |
| isActive | BOOLEAN | DEFAULT true | Store active status |
| isDefault | BOOLEAN | DEFAULT false | Default online store |
| supportsPickup | BOOLEAN | DEFAULT true | Supports pickup orders |
| supportsBopis | BOOLEAN | DEFAULT true | Buy Online, Pick Up In Store |
| commissionRate | DECIMAL(5,2) | DEFAULT 0.00 | Store-level commission |
| storeManagerName | VARCHAR(255) | - | Store manager name |
| storeManagerPhone | VARCHAR(15) | - | Store manager phone |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `store_merchant_id` on `merchantId`
- `store_code` on `storeCode` (unique)
- `store_type` on `storeType`
- `store_location` on `(latitude, longitude)`
- `store_active` on `isActive`

**Business Rules:**
- One store per merchant can be `isDefault = true` (default online store)
- Physical stores require geolocation for store locator
- `operatingHours` format: `{"monday": {"open": "09:00", "close": "21:00"}}`
- Store-level commission overrides merchant-level commission

---

### merchant_settlement_config

Settlement configuration for merchants.

**Primary Key:** `id` (SERIAL)

**Foreign Key:** `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Unique config identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| settlementCycleDays | INTEGER | NOT NULL | Settlement cycle (T+7, T+15, etc.) |
| settlementDayOfMonth | INTEGER | - | Day for monthly settlements (1-30) |
| settlementBankAccount | VARCHAR(35) | NOT NULL | Settlement bank account |
| settlementBankIfsc | VARCHAR(11) | NOT NULL | Settlement bank IFSC |
| settlementBankAccountName | VARCHAR(255) | NOT NULL | Account holder name |
| reservePercentage | INTEGER | DEFAULT 0 | Reserve percentage (always 0%) |
| reserveReleaseDays | INTEGER | - | Reserve release days |
| minimumSettlementAmount | DECIMAL(15,2) | DEFAULT 1000.00 | Minimum settlement threshold |
| autoSettlementEnabled | BOOLEAN | DEFAULT true | Auto-settlement enabled |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `settlement_config_merchant` on `merchantId`

**Business Rules:**
- `settlementCycleDays` determines when orders are settled after delivery
- `settlementDayOfMonth` used for monthly settlement cycles
- Minimum settlement amount must be met for auto-settlement
- Reserve percentage always 0% (100% payout per requirements)

---

### merchant_emi_plans

Global EMI plan templates available to all merchants.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique EMI plan identifier |
| planName | VARCHAR(255) | NOT NULL | Plan display name |
| tenure | INTEGER | NOT NULL | Tenure in months |
| interestRate | DECIMAL(15,2) | NOT NULL | Annual interest rate |
| processingFee | DECIMAL(15,2) | NOT NULL | Processing fee amount |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type (fixed/percentage) |
| minAmount | DECIMAL(15,2) | NOT NULL | Minimum order amount |
| maxAmount | DECIMAL(15,2) | NOT NULL | Maximum order amount |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Plan active status |
| planDescription | TEXT | - | Plan description |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- Global plans available to all merchants by default
- `processingFeeType` determines if fee is fixed or percentage-based
- Order amount must be between `minAmount` and `maxAmount` to qualify

---

### merchant_emi_plans (Merchant-specific)

Merchant-specific EMI plan overrides.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `emiPlanId` → `merchant_emi_plans.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique override identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| emiPlanId | UUID | FK, NOT NULL | Reference to global EMI plan |
| processingFee | DECIMAL(15,2) | NOT NULL | Override processing fee |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type (fixed/percentage) |
| overrideInterestRate | BOOLEAN | NOT NULL, DEFAULT false | Override global interest rate |
| subvention | DECIMAL(15,2) | NOT NULL | Merchant subvention amount |
| subventionType | VARCHAR(20) | NOT NULL, DEFAULT 'percentage' | Subvention type |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Override active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- Allows merchants to customize global EMI plans
- `overrideInterestRate = true` uses merchant-specific rate
- Subvention reduces customer interest cost (merchant bears the cost)

---

### merchant_variant_emi_plans

Variant-specific EMI plan overrides.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `variantId` → `products.id` (ON DELETE CASCADE)
- `emiPlanId` → `merchant_emi_plans.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique variant plan identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| variantId | UUID | FK, NOT NULL | Reference to product variant |
| emiPlanId | UUID | FK, NOT NULL | Reference to global EMI plan |
| processingFee | DECIMAL(15,2) | NOT NULL | Override processing fee |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type (fixed/percentage) |
| overrideInterestRate | BOOLEAN | NOT NULL, DEFAULT false | Override global interest rate |
| subvention | DECIMAL(15,2) | NOT NULL | Merchant subvention amount |
| subventionType | VARCHAR(20) | NOT NULL, DEFAULT 'percentage' | Subvention type |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Variant plan active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- Allows product-specific EMI customization (e.g., zero-interest EMI on select items)
- Most granular EMI configuration (overrides merchant-level overrides)
- Used for promotional EMI offers on specific products
