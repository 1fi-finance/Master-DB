# Orders

## Tables

### orders

Master order table containing all order information across all channels and fulfillment types.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `customerId` → `users.id` (No DELETE action specified)
- `merchantId` → `merchants.id` (No DELETE action specified)
- `storeId` → `merchant_stores.id` (No DELETE action specified)
- `pickupStoreId` → `merchant_stores.id` (No DELETE action specified)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique order identifier |
| orderNumber | VARCHAR(50) | UNIQUE, NOT NULL | Human-readable order number |
| customerId | UUID | FK, NOT NULL | Reference to customer user |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| storeId | UUID | FK | Store for order fulfillment (NULL for online-only orders) |
| channel | channel_type ENUM | NOT NULL | Sales channel (online/offline/pos/marketplace/social_media/other) |
| fulfillmentType | fulfillment_type ENUM | NOT NULL, DEFAULT 'delivery' | Fulfillment type (delivery/pickup/store_purchase/reserve_online) |
| status | order_status ENUM | NOT NULL, DEFAULT 'pending' | Order status (pending/processing/confirmed/shipped/delivered/cancelled/returned/refunded/failed) |
| paymentStatus | payment_status ENUM | NOT NULL, DEFAULT 'pending' | Payment status (pending/paid/failed/refunded/partially_refunded/initiated) |
| subtotalAmount | DECIMAL(15,2) | NOT NULL | Subtotal before discounts, tax, and shipping |
| discountAmount | DECIMAL(15,2) | DEFAULT 0.00 | Total discount amount |
| taxAmount | DECIMAL(15,2) | DEFAULT 0.00 | Total tax amount |
| shippingAmount | DECIMAL(15,2) | DEFAULT 0.00 | Shipping/courier charges |
| totalAmount | DECIMAL(15,2) | NOT NULL | Final order total (subtotal - discount + tax + shipping) |
| couponCode | VARCHAR(50) | - | Applied coupon code |
| couponDiscount | DECIMAL(15,2) | DEFAULT 0.00 | Discount from coupon code |
| paymentMethod | VARCHAR(50) | - | Payment method (upi/card/netbanking/wallet/emi/cod) |
| paymentTransactionId | VARCHAR(255) | - | Payment gateway transaction ID |
| paymentGateway | VARCHAR(50) | - | Payment gateway used (razorpay/stripe/paytm) |
| deliveryAddress | JSONB | - | Delivery address as JSON |
| billingAddress | JSONB | - | Billing address as JSON |
| expectedDeliveryDate | TIMESTAMP | - | Expected delivery date |
| deliveredAt | TIMESTAMP | - | Actual delivery timestamp |
| pickupStoreId | UUID | FK | Store for pickup (BOPIS) |
| pickupScheduledAt | TIMESTAMP | - | Scheduled pickup timestamp |
| pickupCompletedAt | TIMESTAMP | - | Actual pickup completion timestamp |
| customerNotes | TEXT | - | Customer-provided notes |
| giftMessage | TEXT | - | Gift message from customer |
| isGift | BOOLEAN | DEFAULT false | Whether order is a gift |
| internalNotes | TEXT | - | Internal merchant notes |
| ipAddress | VARCHAR(45) | - | Customer IP address (for fraud detection) |
| userAgent | TEXT | - | Customer browser/user agent |
| source | VARCHAR(50) | - | Order source (web/mobile_app/pos/marketplace) |
| utmSource | VARCHAR(255) | - | UTM source tracking |
| utmMedium | VARCHAR(255) | - | UTM medium tracking |
| utmCampaign | VARCHAR(255) | - | UTM campaign tracking |
| loanApplicationId | UUID | - | Reference to LOS loan application (if financed) |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Order creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Indexes:**
- `order_number` on `orderNumber`
- `order_customer` on `customerId`
- `order_merchant` on `merchantId`
- `order_store` on `storeId`
- `order_status` on `status`
- `order_payment_status` on `paymentStatus`
- `order_channel` on `channel`
- `order_fulfillment` on `fulfillmentType`
- `order_created` on `createdAt`
- `order_pickup_store` on `pickupStoreId`

**Business Rules:**
- `orderNumber` must be unique and human-readable (e.g., "ORD-2024-001234")
- `channel` values: `online`, `offline`, `pos`, `marketplace`, `social_media`, `other`
- `fulfillmentType` values:
  - `delivery` - Home/office delivery
  - `pickup` - Buy Online, Pickup In Store (BOPIS)
  - `store_purchase` - Direct in-store purchase
  - `reserve_online` - Reserve online, pay and pickup in store
- `status` workflow: `pending` → `processing` → `confirmed` → `shipped` → `delivered`
  - Alternative paths: `cancelled`, `returned`, `refunded`, `failed`
- `paymentStatus` values: `pending`, `paid`, `failed`, `refunded`, `partially_refunded`, `initiated`
- `totalAmount = subtotalAmount - discountAmount - couponDiscount + taxAmount + shippingAmount`
- `deliveryAddress` JSONB format:
  ```json
  {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postalCode": "400001",
    "country": "India",
    "phone": "+919876543210"
  }
  ```
- `billingAddress` uses same JSONB structure as `deliveryAddress`
- `storeId` is NULL for pure online orders without physical store involvement
- `pickupStoreId` is only used when `fulfillmentType = pickup` or `reserve_online`
- `loanApplicationId` links to LOS (Loan Origination System) for EMI/financed orders
- UTM parameters (`utmSource`, `utmMedium`, `utmCampaign`) track marketing campaigns
- `ipAddress` supports IPv6 (up to 45 characters)
- `isGift = true` allows gift message and hides prices in packing slip

---

### order_items

Line items for orders with product details and pricing snapshots.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- `orderId` → `orders.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique line item identifier |
| orderId | UUID | FK, NOT NULL | Reference to parent order |
| productId | UUID | NOT NULL | Reference to product |
| productVariantId | UUID | - | Reference to product variant (if applicable) |
| bundleId | UUID | - | Reference to product bundle (if applicable) |
| productName | VARCHAR(255) | NOT NULL | Product name (snapshot at order time) |
| productSku | VARCHAR(100) | NOT NULL | Product SKU (snapshot at order time) |
| variantName | VARCHAR(255) | - | Variant name (e.g., "Red - Large") |
| variantSku | VARCHAR(100) | - | Variant SKU |
| quantity | INTEGER | NOT NULL | Quantity ordered |
| unitPrice | DECIMAL(15,2) | NOT NULL | Price per unit |
| totalPrice | DECIMAL(15,2) | NOT NULL | Total before discount (unitPrice × quantity) |
| discountAmount | DECIMAL(15,2) | DEFAULT 0.00 | Discount applied to this item |
| taxAmount | DECIMAL(15,2) | DEFAULT 0.00 | Tax amount for this item |
| finalPrice | DECIMAL(15,2) | NOT NULL | Final price (totalPrice - discountAmount + taxAmount) |
| attributes | JSONB | - | Product attributes snapshot (e.g., color, size) |
| serviceAddOns | JSONB | - | Service add-ons (installation, repair, etc.) |
| fulfillmentStatus | VARCHAR(50) | DEFAULT 'pending' | Item fulfillment status |
| shippedAt | TIMESTAMP | - | Shipping timestamp |
| deliveredAt | TIMESTAMP | - | Delivery timestamp |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Line item creation timestamp |

**Indexes:**
- `order_item_order` on `orderId`
- `order_item_product` on `productId`
- `order_item_variant` on `productVariantId`
- `order_item_bundle` on `bundleId`
- `order_item_fulfillment` on `fulfillmentStatus`

**Business Rules:**
- Line items are automatically deleted when parent order is deleted (CASCADE)
- Exactly one of `productId`, `productVariantId`, or `bundleId` should be set
  - `productId` - Simple product without variants
  - `productVariantId` - Specific variant (e.g., "Red - Large")
  - `bundleId` - Product bundle combo
- Product fields (`productName`, `productSku`) are snapshots captured at order time
  - This preserves historical data even if product is later modified or deleted
- `totalPrice = unitPrice × quantity`
- `finalPrice = totalPrice - discountAmount + taxAmount`
- `attributes` JSONB format:
  ```json
  {
    "color": "Red",
    "size": "Large",
    "material": "Cotton",
    "weight": "500g"
  }
  ```
- `serviceAddOns` JSONB format:
  ```json
  [
    {
      "service": "installation",
      "price": 500.00,
      "provider": "merchant"
    },
    {
      "service": "extended_warranty",
      "price": 999.00,
      "duration": "2 years"
    }
  ]
  ```
- `fulfillmentStatus` values: `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- Individual items can have different fulfillment statuses within the same order
  - Example: Order has 3 items, 2 are delivered, 1 is still shipping
- `shippedAt` and `deliveredAt` are set when fulfillment status changes
