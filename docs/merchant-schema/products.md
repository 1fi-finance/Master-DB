# Products

## Tables

### merchant_categories

Merchant-specific product category trees for organizing products.

**Primary Key:** `id` (UUID)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique category identifier |
| merchantId | UUID | NOT NULL | Reference to merchant |
| name | VARCHAR(255) | NOT NULL | Category display name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly identifier |
| description | TEXT | - | Category description |
| level | INTEGER | NOT NULL, DEFAULT 0 | Depth in category tree (0 = root) |
| path | TEXT | - | Full category path (e.g., "Electronics > Mobile > Smartphones") |
| imageUrl | VARCHAR(500) | - | Category image URL |
| iconUrl | VARCHAR(500) | - | Category icon URL |
| isActive | BOOLEAN | DEFAULT true | Category active status |
| displayOrder | INTEGER | DEFAULT 0 | Display order for sorting |
| metaTitle | VARCHAR(255) | - | SEO meta title |
| metaDescription | TEXT | - | SEO meta description |
| metaKeywords | TEXT | - | SEO meta keywords |
| attributeTemplate | JSONB | - | Template for product attributes in this category |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `category_merchant` on `merchantId`
- `category_slug` on `slug`
- `category_active` on `isActive`
- `category_display_order` on `displayOrder`

**Business Rules:**
- Categories can be nested to multiple levels using the `level` field
- `path` field maintains full category hierarchy for breadcrumb navigation
- `attributeTemplate` defines custom attributes for products in this category
  - Format: `{"attributes": [{"name": "color", "type": "select", "required": true}]}`
- Only `isActive = true` categories are displayed to customers
- `displayOrder` controls sort order (lower values appear first)

---

### products

Master product catalog table containing all merchant products.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `categoryId` → `merchant_categories.id` (No DELETE action specified)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique product identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| categoryId | UUID | FK | Reference to merchant category |
| name | VARCHAR(255) | NOT NULL | Product name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly identifier |
| sku | VARCHAR(100) | NOT NULL | Stock Keeping Unit (unique per merchant) |
| barcode | VARCHAR(50) | - | Product barcode/UPC/EAN |
| productType | VARCHAR(20) | NOT NULL, DEFAULT 'product' | Product type (product/service) |
| shortDescription | VARCHAR(500) | - | Short product description |
| longDescription | TEXT | - | Detailed product description |
| basePrice | DECIMAL(15,2) | NOT NULL | Base selling price |
| compareAtPrice | DECIMAL(15,2) | - | MRP for strike-through pricing |
| costPrice | DECIMAL(15,2) | - | Cost price for margin calculations |
| taxRate | DECIMAL(5,2) | DEFAULT 18.00 | GST tax rate percentage |
| taxIncluded | BOOLEAN | DEFAULT true | Whether base price includes tax |
| trackInventory | BOOLEAN | DEFAULT true | Enable inventory tracking |
| allowBackorder | BOOLEAN | DEFAULT false | Allow backordering when out of stock |
| lowStockThreshold | INTEGER | DEFAULT 10 | Low stock alert threshold |
| isActive | BOOLEAN | DEFAULT true | Product active status |
| isFeatured | BOOLEAN | DEFAULT false | Featured product flag |
| metaTitle | VARCHAR(255) | - | SEO meta title |
| metaDescription | TEXT | - | SEO meta description |
| metaKeywords | TEXT | - | SEO meta keywords |
| primaryImageUrl | VARCHAR(500) | - | Primary product image |
| additionalImages | JSONB | - | Array of additional image URLs |
| attributes | JSONB | - | Merchant-defined product attributes |
| weight | DECIMAL(10,2) | - | Product weight in grams |
| weightUnit | VARCHAR(10) | DEFAULT 'g' | Weight unit |
| length | DECIMAL(10,2) | - | Product length |
| width | DECIMAL(10,2) | - | Product width |
| height | DECIMAL(10,2) | - | Product height |
| dimensionUnit | VARCHAR(10) | DEFAULT 'cm' | Dimension unit |
| specifications | JSONB | - | Product specifications |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

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
- `basePrice` is the selling price (may or may not include tax based on `taxIncluded`)
- `compareAtPrice` shows MRP or original price for discount display
- `taxRate = 18.00` is default GST rate (can be overridden)
- `trackInventory = false` disables stock management for this product
- `allowBackorder = true` allows orders when `stockAvailable = 0`
- `attributes` format: `{"color": "Red", "size": "M", "material": "Cotton"}`
- `specifications` format: `{"brand": "Samsung", "model": "Galaxy S21", "warranty": "1 year"}`
- Weight is stored in grams by default
- Dimensions are stored in centimeters by default

---

### merchant_product_variants

Product variants for size, color, and other attribute combinations.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `variantId` → `products.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique variant identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| variantId | UUID | FK, NOT NULL | Reference to product |
| variantSku | UUID | - | Variant-specific SKU identifier |
| variantName | VARCHAR(255) | - | Variant display name (e.g., "Red - Large") |
| variantAttributes | JSONB | - | Variant attributes combination |
| basePrice | DECIMAL(15,2) | - | Variant base price |
| sellingPrice | DECIMAL(15,2) | - | Variant selling price |
| isActive | BOOLEAN | DEFAULT true | Variant active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- Each variant represents a unique combination of product attributes
- `variantAttributes` format: `{"color": "Red", "size": "Large"}`
- Variant pricing can differ from base product price
- `basePrice` and `sellingPrice` allow for flexible pricing strategies
- Variants are deleted when merchant or parent product is deleted (CASCADE)
- Only `isActive = true` variants are displayed to customers

---

### product_bundles

Product and service bundles for combo offerings.

**Primary Key:** `id` (SERIAL)

**Foreign Key:** `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Unique bundle identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| name | VARCHAR(255) | NOT NULL | Bundle display name |
| slug | VARCHAR(255) | NOT NULL | URL-friendly identifier |
| sku | VARCHAR(100) | NOT NULL | Bundle SKU |
| description | TEXT | - | Bundle description |
| bundlePrice | DECIMAL(15,2) | NOT NULL | Bundle selling price |
| compareAtPrice | DECIMAL(15,2) | - | Sum of individual component prices |
| discountAmount | DECIMAL(15,2) | - | Fixed discount amount |
| discountPercentage | DECIMAL(5,2) | - | Discount percentage |
| components | JSONB | NOT NULL | Bundle components (products/variants) |
| isActive | BOOLEAN | DEFAULT true | Bundle active status |
| isAvailable | BOOLEAN | DEFAULT true | Available for purchase (based on stock) |
| primaryImageUrl | VARCHAR(500) | - | Bundle image |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `bundle_merchant` on `merchantId`
- `bundle_sku` on `sku`
- `bundle_slug` on `slug`
- `bundle_active` on `isActive`

**Business Rules:**
- `components` JSONB array format:
  ```json
  [
    {"type": "product", "id": 123, "quantity": 1},
    {"type": "variant", "id": 456, "quantity": 2}
  ]
  ```
- `compareAtPrice` should equal sum of all component prices
- `bundlePrice < compareAtPrice` indicates bundle discount
- `discountAmount` = `compareAtPrice - bundlePrice`
- `discountPercentage` = `(discountAmount / compareAtPrice) * 100`
- `isAvailable` should be `false` if any component is out of stock
- Bundles are deleted when merchant is deleted (CASCADE)
- Bundle SKU must be unique per merchant

---

### product_channel_pricing

Omnichannel pricing support for different sales channels.

**Primary Key:** `id` (SERIAL)

**Foreign Keys:**
- `productId` → `products.id` (ON DELETE CASCADE)
- `productVariantId` → `product_variants.id` (ON DELETE CASCADE)
- `bundleId` → `product_bundles.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Unique pricing identifier |
| productId | INTEGER | FK | Reference to product |
| productVariantId | INTEGER | FK | Reference to product variant |
| bundleId | INTEGER | FK | Reference to product bundle |
| channel | VARCHAR(20) | NOT NULL | Sales channel (online/offline/pos) |
| pricingType | VARCHAR(20) | NOT NULL, DEFAULT 'standard' | Pricing type (standard/promotional) |
| price | DECIMAL(15,2) | NOT NULL | Channel-specific price |
| compareAtPrice | DECIMAL(15,2) | - | Channel MRP for pricing |
| effectiveFrom | TIMESTAMP | NOT NULL, DEFAULT NOW | Pricing start date |
| effectiveTo | TIMESTAMP | - | Pricing end date (NULL = indefinite) |
| storeId | UUID | - | Store-specific pricing (optional) |
| isActive | BOOLEAN | DEFAULT true | Pricing active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `channel_price_product` on `productId`
- `channel_price_variant` on `productVariantId`
- `channel_price_bundle` on `bundleId`
- `channel_price_channel` on `channel`
- `channel_price_store` on `storeId`
- `channel_price_active` on `isActive`
- `channel_price_dates` on `(effectiveFrom, effectiveTo)`

**Business Rules:**
- Exactly one of `productId`, `productVariantId`, or `bundleId` must be set
- `channel` values: `online`, `offline`, `pos`
- `pricingType` values: `standard`, `promotional`, `clearance`
- Channel pricing overrides base product/variant/bundle pricing
- `effectiveFrom <= NOW() AND (effectiveTo IS NULL OR effectiveTo >= NOW())` determines active pricing
- Multiple pricing records can exist for same product (different date ranges)
- `storeId` allows store-specific pricing within offline channel
- Pricing records are deleted when parent product/variant/bundle is deleted (CASCADE)
- If `isActive = false`, pricing is ignored even if within date range
