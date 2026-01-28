# Merchant Schema Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create comprehensive technical documentation for the merchant database schema at `src/db/schema/merchant` to enable developers to understand the data model, relationships, and business logic without reading source code.

**Architecture:** Generate documentation in Markdown format organized by domain areas (merchants, products, orders, settlements) with entity-relationship diagrams, field descriptions, indexes, and business rules. Documentation will be auto-generated from the TypeScript schema definitions and stored in `docs/merchant-schema/` directory.

**Tech Stack:** TypeScript (Drizzle ORM schemas), Markdown, TypeDoc (optional for API docs)

---

## Task 1: Create Documentation Directory Structure

**Files:**
- Create: `docs/merchant-schema/README.md`
- Create: `docs/merchant-schema/merchants.md`
- Create: `docs/merchant-schema/products.md`
- Create: `docs/merchant-schema/orders.md`
- Create: `docs/merchant-schema/settlements.md`
- Create: `docs/merchant-schema/analytics.md`
- Create: `docs/merchant-schema/qr.md`
- Create: `docs/merchant-schema/relationships.md`
- Create: `docs/merchant-schema/enums.md`

**Step 1: Create main README**

Create `docs/merchant-schema/README.md` with:
```markdown
# Merchant Database Schema Documentation

## Overview
The merchant schema handles all merchant-related data including:
- Merchant profiles and KYC
- Multi-store management (physical, online, marketplace)
- Product catalog with variants and bundles
- Order management across channels
- Settlement and payment processing
- QR code generation and tracking
- EMI plan management
- Analytics and reporting

## Schema Files
- `merchants/` - Merchant profiles, stores, and KYC
- `products/` - Product catalog, categories, variants, bundles
- `orders/` - Orders and order items
- `settlements/` - Settlement processing and analytics
- `qr/` - QR code management

## Database Organization
All merchant tables use the `merchantSchema` schema in PostgreSQL.

## Documentation Index
- [Merchants](./merchants.md) - Merchant entities and stores
- [Products](./products.md) - Product catalog management
- [Orders](./orders.md) - Order processing
- [Settlements](./settlements.md) - Payment settlements
- [Analytics](./analytics.md) - Analytics and metrics
- [QR Codes](./qr.md) - QR code management
- [Relationships](./relationships.md) - Entity relationships
- [Enums](./enums.md) - Enum definitions
```

**Step 2: Commit directory structure**

Run:
```bash
git add docs/merchant-schema/
git commit -m "docs: create merchant schema documentation structure"
```

---

## Task 2: Document Merchant Entities

**Files:**
- Modify: `docs/merchant-schema/merchants.md`

**Step 1: Write merchants documentation**

Create comprehensive documentation for merchants domain in `docs/merchant-schema/merchants.md`:

```markdown
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
| merchantId | UUID | FK, NOT NULL | Parent merchant |
| storeName | VARCHAR(255) | NOT NULL | Store display name |
| storeCode | VARCHAR(50) | UNIQUE, NOT NULL | Unique store code |
| storeType | ENUM | NOT NULL | Store type (physical, online, marketplace) |
| address | TEXT | - | Physical address (for physical stores) |
| landmark | VARCHAR(255) | - | Near landmark |
| city | VARCHAR(100) | - | City |
| state | VARCHAR(100) | - | State |
| pincode | VARCHAR(10) | - | Postal code |
| country | VARCHAR(100) | DEFAULT 'India' | Country |
| gstin | VARCHAR(15) | NOT NULL | Store GST number |
| bankAccountNumber | VARCHAR(20) | NOT NULL | Store bank account |
| bankName | VARCHAR(255) | NOT NULL | Bank name |
| bankBranch | VARCHAR(255) | NOT NULL | Bank branch |
| bankIfsc | VARCHAR(11) | NOT NULL | IFSC code |
| bankAccountHolderName | VARCHAR(255) | NOT NULL | Account holder |
| bankAccountType | VARCHAR(20) | NOT NULL | Account type |
| upiId | VARCHAR(255) | NOT NULL | Store UPI ID |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Store status |
| latitude | DECIMAL(10,8) | - | Geolocation latitude |
| longitude | DECIMAL(11,8) | - | Geolocation longitude |
| radiusKm | INTEGER | DEFAULT 10 | Store locator search radius |
| phone | VARCHAR(15) | - | Store phone |
| email | VARCHAR(255) | - | Store email |
| operatingHours | JSONB | - | Operating hours by day |
| isActive | BOOLEAN | DEFAULT true | Active status |
| isDefault | BOOLEAN | DEFAULT false | Default online store |
| supportsPickup | BOOLEAN | DEFAULT true | Supports order pickup |
| supportsBopis | BOOLEAN | DEFAULT true | Buy Online, Pick Up In Store |
| commissionRate | DECIMAL(5,2) | DEFAULT 0.00 | Store-level commission |
| storeManagerName | VARCHAR(255) | - | Manager name |
| storeManagerPhone | VARCHAR(15) | - | Manager phone |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

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
| id | SERIAL | PK, NOT NULL | Configuration ID |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| settlementCycleDays | INTEGER | NOT NULL | Settlement cycle (T+7, T+15) |
| settlementDayOfMonth | INTEGER | - | For monthly settlements (1-30) |
| settlementBankAccount | VARCHAR(35) | NOT NULL | Settlement account |
| settlementBankIfsc | VARCHAR(11) | NOT NULL | Settlement IFSC |
| settlementBankAccountName | VARCHAR(255) | NOT NULL | Account holder name |
| reservePercentage | INTEGER | DEFAULT 0 | Reserve percentage (always 0) |
| reserveReleaseDays | INTEGER | - | Reserve release days (unused) |
| minimumSettlementAmount | DECIMAL(15,2) | DEFAULT 1000.00 | Min settlement threshold |
| autoSettlementEnabled | BOOLEAN | DEFAULT true | Auto-settlement flag |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `settlement_config_merchant` on `merchantId`

**Business Rules:**
- Reserve is always 0% (100% payout to merchant)
- Settlements only triggered if amount >= `minimumSettlementAmount`
- Supports both cycle-based (T+N) and date-based (monthly) settlements

---

### merchant_emi_plans

Global EMI plan templates.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Plan ID |
| planName | VARCHAR(255) | NOT NULL | Plan name |
| tenure | INTEGER | NOT NULL | Tenure in months |
| interestRate | DECIMAL(15,2) | NOT NULL | Interest rate |
| processingFee | DECIMAL(15,2) | NOT NULL | Processing fee amount |
| minAmount | DECIMAL(15,2) | NOT NULL | Minimum loan amount |
| maxAmount | DECIMAL(15,2) | NOT NULL | Maximum loan amount |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type (fixed/percentage) |
| planDescription | TEXT | - | Plan description |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

---

### merchant_emi_plans (merchant-specific overrides)

Merchant-specific EMI plan overrides.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `emiPlanId` → `merchant_emi_plans.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Override ID |
| merchantId | UUID | FK, NOT NULL | Merchant reference |
| emiPlanId | UUID | FK, NOT NULL | Base plan reference |
| processingFee | DECIMAL(15,2) | NOT NULL | Override processing fee |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type |
| overrideIntrestRate | BOOLEAN | NOT NULL, DEFAULT false | Override interest rate flag |
| subvention | DECIMAL(15,2) | NOT NULL | Subvention amount |
| subventionType | VARCHAR(20) | NOT NULL, DEFAULT 'percentage' | Subvention type |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

---

### merchant_variant_emi_plans

Variant-specific EMI plans.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `variantId` → `products.id` (ON DELETE CASCADE)
- `emiPlanId` → `merchant_emi_plans.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Variant plan ID |
| merchantId | UUID | FK, NOT NULL | Merchant reference |
| variantId | UUID | FK, NOT NULL | Product variant reference |
| emiPlanId | UUID | FK, NOT NULL | Base plan reference |
| processingFee | DECIMAL(15,2) | NOT NULL | Processing fee |
| processingFeeType | VARCHAR(20) | NOT NULL, DEFAULT 'fixed' | Fee type |
| overrideIntrestRate | BOOLEAN | NOT NULL, DEFAULT false | Override interest flag |
| subvention | DECIMAL(15,2) | NOT NULL | Subvention amount |
| subventionType | VARCHAR(20) | NOT NULL, DEFAULT 'percentage' | Subvention type |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | Active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |
```

**Step 2: Commit merchants documentation**

Run:
```bash
git add docs/merchant-schema/merchants.md
git commit -m "docs: add merchants documentation"
```

---

## Task 3: Document Product Catalog

**Files:**
- Modify: `docs/merchant-schema/products.md`

**Step 1: Write products documentation**

Create comprehensive documentation for products domain in `docs/merchant-schema/products.md`:

```markdown
# Products

## Tables

### merchant_categories

Merchant-specific product category trees.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Category ID |
| merchantId | UUID | NOT NULL | Merchant owner |
| name | VARCHAR(255) | NOT NULL | Category name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly slug |
| description | TEXT | - | Category description |
| level | INTEGER | NOT NULL, DEFAULT 0 | Depth in tree (0=root) |
| path | TEXT | - | Full path: "Electronics > Mobile" |
| imageUrl | VARCHAR(500) | - | Category image |
| iconUrl | VARCHAR(500) | - | Category icon |
| isActive | BOOLEAN | DEFAULT true | Active status |
| displayOrder | INTEGER | DEFAULT 0 | Sort order |
| metaTitle | VARCHAR(255) | - | SEO meta title |
| metaDescription | TEXT | - | SEO meta description |
| metaKeywords | TEXT | - | SEO keywords |
| attributeTemplate | JSONB | - | Attribute schema for products |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `category_merchant` on `merchantId`
- `category_slug` on `slug`
- `category_active` on `isActive`
- `category_display_order` on `displayOrder`

**Business Rules:**
- Categories can be hierarchical (parent-child via `level` and `path`)
- `attributeTemplate` defines required/optional attributes for products in this category
- Format: `{"attributes": [{"name": "color", "type": "select", "required": true}]}`

---

### products

Master product catalog table.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `categoryId` → `merchant_categories.id`

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Product ID |
| merchantId | UUID | FK, NOT NULL | Merchant owner |
| categoryId | UUID | FK | Category reference |
| name | VARCHAR(255) | NOT NULL | Product name |
| slug | VARCHAR(255) | NOT NULL | URL slug |
| sku | VARCHAR(100) | NOT NULL | Stock keeping unit |
| barcode | VARCHAR(50) | - | Barcode/EAN |
| productType | VARCHAR(20) | NOT NULL, DEFAULT 'product' | Product type |
| shortDescription | VARCHAR(500) | - | Short description |
| longDescription | TEXT | - | Full description |
| basePrice | DECIMAL(15,2) | NOT NULL | Selling price |
| compareAtPrice | DECIMAL(15,2) | - | MRP for discount display |
| costPrice | DECIMAL(15,2) | - | Cost for margin calc |
| taxRate | DECIMAL(5,2) | DEFAULT 18.00 | GST % |
| taxIncluded | BOOLEAN | DEFAULT true | Price includes tax |
| trackInventory | BOOLEAN | DEFAULT true | Enable inventory tracking |
| allowBackorder | BOOLEAN | DEFAULT false | Allow backorders |
| lowStockThreshold | INTEGER | DEFAULT 10 | Low stock alert level |
| isActive | BOOLEAN | DEFAULT true | Product active |
| isFeatured | BOOLEAN | DEFAULT false | Featured product |
| metaTitle | VARCHAR(255) | - | SEO title |
| metaDescription | TEXT | - | SEO description |
| metaKeywords | TEXT | - | SEO keywords |
| primaryImageUrl | VARCHAR(500) | - | Main image |
| additionalImages | JSONB | - | Image array |
| attributes | JSONB | - | Product attributes |
| weight | DECIMAL(10,2) | - | Weight in grams |
| weightUnit | VARCHAR(10) | DEFAULT 'g' | Weight unit |
| length | DECIMAL(10,2) | - | Length |
| width | DECIMAL(10,2) | - | Width |
| height | DECIMAL(10,2) | - | Height |
| dimensionUnit | VARCHAR(10) | DEFAULT 'cm' | Dimension unit |
| specifications | JSONB | - | Technical specs |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `product_merchant` on `merchantId`
- `product_category` on `categoryId`
- `product_sku` on `sku`
- `product_slug` on `slug`
- `product_barcode` on `barcode`
- `product_active` on `isActive`
- `product_featured` on `isFeatured`
- `product_created` on `createdAt`

**Business Rules:**
- SKU must be unique per merchant
- `attributes` format: `{"color": "Red", "size": "M", "material": "Cotton"}`
- `specifications` format: `{"brand": "Samsung", "model": "Galaxy S21", "warranty": "1 year"}`
- `additionalImages` format: `["url1.jpg", "url2.jpg"]`

---

### product_variants

Product variants for size, color, etc.

**Primary Key:** `id` (SERIAL)

**Foreign Key:** `productId` → `products.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Variant ID |
| productId | INTEGER | FK, NOT NULL | Parent product |
| variantSku | VARCHAR(100) | NOT NULL | Variant SKU |
| variantName | VARCHAR(255) | NOT NULL | Variant display name |
| barcode | VARCHAR(50) | - | Variant barcode |
| attributes | JSONB | NOT NULL | Variant attributes |
| price | DECIMAL(15,2) | NOT NULL | Variant price |
| compareAtPrice | DECIMAL(15,2) | - | MRP |
| costPrice | DECIMAL(15,2) | - | Variant cost |
| stockAvailable | INTEGER | NOT NULL, DEFAULT 0 | Available stock |
| stockOnOrder | INTEGER | DEFAULT 0 | On order quantity |
| lowStockThreshold | INTEGER | DEFAULT 5 | Low stock alert |
| isActive | BOOLEAN | DEFAULT true | Active status |
| imageUrl | VARCHAR(500) | - | Variant image |
| weight | DECIMAL(10,2) | - | Variant weight |
| weightUnit | VARCHAR(10) | DEFAULT 'g' | Weight unit |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `variant_product` on `productId`
- `variant_sku` on `variantSku`
- `variant_barcode` on `barcode`
- `variant_active` on `isActive`
- `variant_stock` on `stockAvailable`

**Business Rules:**
- `attributes` format: `{"color": "Red", "size": "Large"}`
- Variant price can differ from base product price
- Inventory tracked at variant level when variants exist

---

### product_bundles

Product + service bundles.

**Primary Key:** `id` (SERIAL)

**Foreign Key:** `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Bundle ID |
| merchantId | UUID | FK, NOT NULL | Merchant owner |
| name | VARCHAR(255) | NOT NULL | Bundle name |
| slug | VARCHAR(255) | NOT NULL | URL slug |
| sku | VARCHAR(100) | NOT NULL | Bundle SKU |
| description | TEXT | - | Bundle description |
| bundlePrice | DECIMAL(15,2) | NOT NULL | Bundle selling price |
| compareAtPrice | DECIMAL(15,2) | - | Sum of component prices |
| discountAmount | DECIMAL(15,2) | - | Fixed discount |
| discountPercentage | DECIMAL(5,2) | - | Percentage discount |
| components | JSONB | NOT NULL | Bundle components |
| isActive | BOOLEAN | DEFAULT true | Active status |
| isAvailable | BOOLEAN | DEFAULT true | Available for sale |
| primaryImageUrl | VARCHAR(500) | - | Bundle image |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `bundle_merchant` on `merchantId`
- `bundle_sku` on `sku`
- `bundle_slug` on `slug`
- `bundle_active` on `isActive`

**Business Rules:**
- `components` format: `[{"type": "product", "id": 123, "quantity": 1}, {"type": "variant", "id": 456, "quantity": 2}]`
- `isAvailable` automatically set to false if any component is out of stock

---

### product_channel_pricing

Omnichannel pricing support.

**Primary Key:** `id` (SERIAL)

**Foreign Keys:**
- `productId` → `products.id` (ON DELETE CASCADE)
- `productVariantId` → `product_variants.id` (ON DELETE CASCADE)
- `bundleId` → `product_bundles.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Pricing ID |
| productId | INTEGER | FK | Product reference |
| productVariantId | INTEGER | FK | Variant reference |
| bundleId | INTEGER | FK | Bundle reference |
| channel | VARCHAR(20) | NOT NULL | Channel (online/offline/pos) |
| pricingType | VARCHAR(20) | NOT NULL, DEFAULT 'standard' | Pricing type |
| price | DECIMAL(15,2) | NOT NULL | Channel price |
| compareAtPrice | DECIMAL(15,2) | - | MRP |
| effectiveFrom | TIMESTAMP | NOT NULL, DEFAULT NOW | Valid from |
| effectiveTo | TIMESTAMP | - | Valid until |
| storeId | UUID | - | Store-specific pricing |
| isActive | BOOLEAN | DEFAULT true | Active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update |

**Indexes:**
- `channel_price_product` on `productId`
- `channel_price_variant` on `productVariantId`
- `channel_price_bundle` on `bundleId`
- `channel_price_channel` on `channel`
- `channel_price_store` on `storeId`
- `channel_price_active` on `isActive`
- `channel_price_dates` on `(effectiveFrom, effectiveTo)`

**Business Rules:**
- Only one of `productId`, `productVariantId`, or `bundleId` should be set
- Supports store-specific pricing for physical stores
- Supports time-based pricing (sales, promotions)
```

**Step 2: Commit products documentation**

Run:
```bash
git add docs/merchant-schema/products.md
git commit -m "docs: add products documentation"
```

---

## Task 4: Document Orders

**Files:**
- Modify: `docs/merchant-schema/orders.md`

**Step 1: Write orders documentation**

Create documentation for orders domain in `docs/merchant-schema/orders.md` including `orders` and `order_items` tables with all columns, indexes, and business rules.

**Step 2: Commit orders documentation**

Run:
```bash
git add docs/merchant-schema/orders.md
git commit -m "docs: add orders documentation"
```

---

## Task 5: Document Settlements

**Files:**
- Modify: `docs/merchant-schema/settlements.md`

**Step 1: Write settlements documentation**

Create documentation for settlements domain in `docs/merchant-schema/settlements.md` including `settlements` and `settlement_orders` tables.

**Step 2: Commit settlements documentation**

Run:
```bash
git add docs/merchant-schema/settlements.md
git commit -m "docs: add settlements documentation"
```

---

## Task 6: Document Analytics

**Files:**
- Modify: `docs/merchant-schema/analytics.md`

**Step 1: Write analytics documentation**

Create documentation for analytics domain in `docs/merchant-schema/analytics.md` including `merchant_analytics_daily` and `merchant_analytics_raw` tables.

**Step 2: Commit analytics documentation**

Run:
```bash
git add docs/merchant-schema/analytics.md
git commit -m "docs: add analytics documentation"
```

---

## Task 7: Document QR Codes

**Files:**
- Modify: `docs/merchant-schema/qr.md`

**Step 1: Write QR documentation**

Create documentation for QR codes in `docs/merchant-schema/qr.md` including `qrTable` table.

**Step 2: Commit QR documentation**

Run:
```bash
git add docs/merchant-schema/qr.md
git commit -m "docs: add QR codes documentation"
```

---

## Task 8: Create Entity Relationships Diagram

**Files:**
- Modify: `docs/merchant-schema/relationships.md`

**Step 1: Write relationships documentation**

Create `docs/merchant-schema/relationships.md` with:

```markdown
# Entity Relationships

## Relationship Map

### Merchants Domain
```
merchants (1) ----< (1) merchant_kyc
     |
     +----< (1) merchant_settlement_config
     |
     +----< (N) merchant_stores
     |
     +----< (N) merchant_emi_plans
     |
     +----< (N) merchant_variant_emi_plans
```

### Products Domain
```
merchants (1) ----< (N) products
                      |
                      +----< (N) product_variants
                      |
                      +----< (N) product_bundles
                      |
                      +----< (N) product_channel_pricing

merchant_categories (N) ----< (N) products
```

### Orders Domain
```
merchants (1) ----< (N) orders
                      |
                      +----< (N) order_items

users (1) ----< (N) orders

products (1) ----< (N) order_items
product_variants (1) ----< (N) order_items
product_bundles (1) ----< (N) order_items

merchant_stores (1) ----< (N) orders
```

### Settlements Domain
```
merchants (1) ----< (N) settlements
                      |
                      +----< (N) settlement_orders
                           |
                           +---- (1) orders
```

### Analytics Domain
```
merchants (1) ----< (N) merchant_analytics_daily
merchants (1) ----< (N) merchant_analytics_raw
merchant_stores (1) ----< (N) merchant_analytics_daily
merchant_stores (1) ----< (N) merchant_analytics_raw
```

### QR Domain
```
merchants (1) ----< (N) qrTable
products (1) ----< (N) qrTable
product_variants (1) ----< (N) qrTable
```

## Cascade Rules

**ON DELETE CASCADE:**
- Deleting merchant → deletes all dependent records (KYC, stores, products, orders, settlements)
- Deleting product → deletes variants, bundles, pricing
- Deleting order → deletes order items
- Deleting settlement → deletes settlement order records

## Key Indexes

### Performance Critical Indexes
1. Orders: `order_number`, `customer`, `status`, `created_at`
2. Products: `sku`, `slug`, `merchant`, `active`
3. Settlements: `settlement_number`, `merchant`, `period`, `status`
4. Analytics: `merchant`, `date`, `period`
```

**Step 2: Commit relationships documentation**

Run:
```bash
git add docs/merchant-schema/relationships.md
git commit -m "docs: add entity relationships documentation"
```

---

## Task 9: Document Enums

**Files:**
- Modify: `docs/merchant-schema/enums.md`

**Step 1: Write enums documentation**

Create `docs/merchant-schema/enums.md` with all enum definitions referenced in merchant schemas.

**Step 2: Commit enums documentation**

Run:
```bash
git add docs/merchant-schema/enums.md
git commit -m "docs: add enums documentation"
```

---

## Task 10: Create ERD Diagram

**Files:**
- Create: `docs/merchant-schema/ERD.md` (Mermaid diagram)

**Step 1: Create Mermaid ERD**

Create `docs/merchant-schema/ERD.md` with Mermaid ERD diagram showing all tables and relationships.

**Step 2: Commit ERD diagram**

Run:
```bash
git add docs/merchant-schema/ERD.md
git commit -m "docs: add entity relationship diagram"
```

---

## Task 11: Update Main README

**Files:**
- Modify: `docs/merchant-schema/README.md`

**Step 1: Add quick reference section**

Update README with quick reference section linking to all documentation.

**Step 2: Commit README update**

Run:
```bash
git add docs/merchant-schema/README.md
git commit -m "docs: update merchant schema README with quick reference"
```

---

## Task 12: Final Review

**Step 1: Review all documentation**

Run:
```bash
ls -la docs/merchant-schema/
```

Expected output: All markdown files created

**Step 2: Verify completeness**

Check that:
- [ ] All tables are documented
- [ ] All columns are listed
- [ ] All indexes are documented
- [ ] All relationships are mapped
- [ ] Business rules are explained
- [ ] Enums are documented

**Step 3: Final commit**

Run:
```bash
git add docs/merchant-schema/
git commit -m "docs: complete merchant schema documentation"
```
