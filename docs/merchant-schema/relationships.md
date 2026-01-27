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

### ON DELETE CASCADE Relationships

The following relationships use CASCADE deletion, meaning deleting the parent record will automatically delete all related child records:

1. **Merchants Cascade:**
   - Deleting `merchants` → deletes `merchant_kyc`
   - Deleting `merchants` → deletes `merchant_stores`
   - Deleting `merchants` → deletes `merchant_settlement_config`
   - Deleting `merchants` → deletes `products`
   - Deleting `merchants` → deletes `product_bundles`
   - Deleting `merchants` → deletes `qrTable`

2. **Products Cascade:**
   - Deleting `products` → deletes `product_variants`
   - Deleting `products` → deletes `product_channel_pricing`
   - Deleting `product_variants` → deletes `product_channel_pricing`
   - Deleting `product_bundles` → deletes `product_channel_pricing`

3. **Orders Cascade:**
   - Deleting `orders` → deletes `order_items`

4. **Settlements Cascade:**
   - Deleting `settlements` → deletes `settlement_orders`

5. **Stores Cascade:**
   - Deleting `merchant_stores` → cascades to related orders (storeId can be null)

### No Cascade Relationships

These relationships use NO ACTION or RESTRICT:
- `orders` → `users` (Cannot delete user with orders)
- `orders` → `merchants` (Cannot delete merchant with orders - use soft delete)
- `settlement_orders` → `orders` (Order history preserved)
- `merchant_categories` → `products` (Categories can be deleted without affecting products)
- `products` → `merchant_categories` (categoryId is nullable)

## Key Performance Indexes

### Orders Domain (High Frequency)
Critical indexes for order performance:

1. **orders table:**
   - `order_number` - Unique order number lookups
   - `order_customer` - Customer order history queries
   - `order_merchant` - Merchant order listing
   - `order_status` - Status-based filtering
   - `order_payment_status` - Payment status queries
   - `order_channel` - Channel-based analytics
   - `order_fulfillment` - Fulfillment type filtering
   - `order_created` - Date range queries
   - `order_pickup_store` - BOPIS queries

2. **order_items table:**
   - `order_item_order` - Order detail queries
   - `order_item_product` - Product sales analytics
   - `order_item_variant` - Variant sales analytics
   - `order_item_bundle` - Bundle sales analytics

### Products Domain (High Read)
Critical indexes for product catalog performance:

1. **products table:**
   - `product_merchant` - Merchant product listing
   - `product_category` - Category browsing
   - `product_sku` - SKU lookups
   - `product_slug` - URL-based product access
   - `product_barcode` - Barcode scanning
   - `product_active` - Active product filtering
   - `product_featured` - Featured product queries
   - `product_created` - New product listings

2. **product_variants table:**
   - `variant_product` - Product variant listing
   - `variant_sku` - Variant SKU lookups
   - `variant_barcode` - Variant barcode scanning
   - `variant_active` - Active variant filtering
   - `variant_stock` - Low stock queries

3. **merchant_categories table:**
   - `category_merchant` - Merchant category listing
   - `category_slug` - URL-based category access
   - `category_active` - Active category filtering
   - `category_display_order` - Category sorting

4. **product_channel_pricing table:**
   - `channel_price_product` - Product pricing queries
   - `channel_price_variant` - Variant pricing queries
   - `channel_price_channel` - Channel-based pricing
   - `channel_price_store` - Store-specific pricing
   - `channel_price_active` - Active pricing filtering
   - `channel_price_dates` - Date-based pricing queries

### Settlements Domain (Financial Accuracy)
Critical indexes for settlement processing:

1. **settlements table:**
   - `settlement_number` - Settlement number lookups
   - `settlement_merchant` - Merchant settlement history
   - `settlement_period` - Period-based queries
   - `settlement_status` - Status-based filtering
   - `settlement_utr` - UTR-based queries
   - `settlement_completed` - Completion date queries
   - `settlement_created` - Creation date queries

2. **settlement_orders table:**
   - `settlement_order_settlement` - Settlement detail queries
   - `settlement_order_order` - Order settlement status
   - `settlement_order_date` - Settlement date queries
   - `settlement_order_delivered` - Delivery-based queries

### Analytics Domain (Reporting)
Critical indexes for analytics and reporting:

1. **merchant_analytics_daily table:**
   - `analytics_daily_merchant` - Merchant analytics
   - `analytics_daily_store` - Store analytics
   - `analytics_daily_date` - Date range queries
   - `analytics_daily_period` - Period-based queries
   - `analytics_daily_merchant_date` - Composite merchant+date queries

2. **merchant_analytics_raw table:**
   - `analytics_raw_merchant` - Merchant event filtering
   - `analytics_raw_store` - Store event filtering
   - `analytics_raw_type` - Event type queries
   - `analytics_raw_customer` - Customer journey tracking
   - `analytics_raw_product` - Product event tracking
   - `analytics_raw_order` - Order event tracking
   - `analytics_raw_occurred` - Event time queries
   - `analytics_raw_session` - Session-based queries
   - `analytics_raw_merchant_event` - Composite merchant+event queries

### Merchants Domain (Setup)
1. **merchant_stores table:**
   - `store_merchant_id` - Merchant store listing
   - `store_code` - Unique store code lookups
   - `store_type` - Store type filtering
   - `store_location` - Geolocation-based queries (store locator)
   - `store_active` - Active store filtering

2. **merchant_settlement_config table:**
   - `settlement_config_merchant` - Merchant settlement config queries

## Cross-Domain Relationships

### users ↔ merchants
- **Relationship:** Many-to-Many through orders
- **Description:** Customers can place orders with multiple merchants
- **Cascade:** None (users are independent)
- **Query Pattern:** Get customer's order history across merchants

### products ↔ orders
- **Relationship:** One-to-Many through order_items
- **Description:** Products appear in multiple orders
- **Cascade:** None (preserve product history)
- **Query Pattern:** Get product sales performance, order frequency

### stores ↔ orders
- **Relationship:** One-to-Many
- **Description:** Store fulfills orders (for BOPIS, in-store pickup)
- **Cascade:** None (preserve order history)
- **Query Pattern:** Get store sales performance, fulfillment analytics

### orders ↔ settlements
- **Relationship:** Many-to-One through settlement_orders
- **Description:** Multiple orders settle in one settlement batch
- **Cascade:** None (preserve financial audit trail)
- **Query Pattern:** Get order settlement status, settlement breakdown

## Data Integrity Rules

1. **Merchant Deletion:**
   - Soft delete recommended (set `isActive = false`)
   - Hard delete cascades to all merchant data
   - Cannot delete if orders exist with `status NOT IN ('cancelled', 'refunded')`

2. **Product Deletion:**
   - Soft delete recommended (set `isActive = false`)
   - Hard delete cascades to variants and pricing
   - Cannot delete if referenced in active orders

3. **Order Deletion:**
   - Generally prohibited (preserve audit trail)
   - Use status-based filtering instead
   - Hard delete cascades to order_items

4. **Settlement Deletion:**
   - Prohibited if status is 'completed'
   - Can delete 'pending' or 'failed' settlements
   - Hard delete cascades to settlement_orders

5. **Category Deletion:**
   - Safe to delete (no cascade to products)
   - Products have nullable categoryId
   - Consider setting products.categoryId to NULL before deletion
