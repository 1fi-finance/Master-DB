# Analytics

## Tables

### merchant_analytics_daily

Daily aggregated metrics for merchant analytics with sales, inventory, and customer insights.

**Primary Key:** `id` (INTEGER/SERIAL)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Unique analytics record identifier |
| merchantId | UUID | FK, NOT NULL | Reference to merchant |
| storeId | INTEGER | - | Store ID (NULL = aggregated across all stores) |
| date | TIMESTAMP | NOT NULL | Analytics date |
| period | analytics_period ENUM | NOT NULL, DEFAULT 'daily' | Aggregation period |
| totalOrders | INTEGER | NOT NULL, DEFAULT 0 | Total orders for period |
| totalRevenue | DECIMAL(15,2) | NOT NULL, DEFAULT 0.00 | Total revenue for period |
| averageOrderValue | DECIMAL(15,2) | NOT NULL, DEFAULT 0.00 | Average order value |
| totalItemsSold | INTEGER | NOT NULL, DEFAULT 0 | Total items sold |
| ordersByChannel | JSONB | - | Order breakdown by channel |
| ordersByFulfillment | JSONB | - | Order breakdown by fulfillment type |
| revenueByChannel | JSONB | - | Revenue breakdown by channel |
| totalProducts | INTEGER | DEFAULT 0 | Total active products |
| lowStockProducts | INTEGER | DEFAULT 0 | Products with low stock |
| outOfStockProducts | INTEGER | DEFAULT 0 | Products out of stock |
| inventoryValue | DECIMAL(15,2) | DEFAULT 0.00 | Total inventory value |
| topSellingProducts | JSONB | - | Top selling products list |
| fastMovingProducts | JSONB | - | Fast moving products list |
| slowMovingProducts | JSONB | - | Slow moving products list |
| newCustomers | INTEGER | DEFAULT 0 | New customers acquired |
| returningCustomers | INTEGER | DEFAULT 0 | Returning customers |
| totalCustomers | INTEGER | DEFAULT 0 | Total unique customers |
| customersByCity | JSONB | - | Customer breakdown by city |
| customersByGender | JSONB | - | Customer breakdown by gender |
| trafficSource | JSONB | - | Traffic source breakdown |
| averageFulfillmentTime | DECIMAL(10,2) | - | Average fulfillment time (hours) |
| fulfillmentRate | DECIMAL(5,2) | - | Fulfillment success rate (%) |
| returnRate | DECIMAL(5,2) | - | Return rate (%) |
| cancellationRate | DECIMAL(5,2) | - | Cancellation rate (%) |
| averageProductRating | DECIMAL(3,2) | - | Average product rating (1-5) |
| averageServiceRating | DECIMAL(3,2) | - | Average service rating (1-5) |
| totalReviews | INTEGER | DEFAULT 0 | Total reviews received |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |

**Indexes:**
- `analytics_daily_merchant` on `merchantId`
- `analytics_daily_store` on `storeId`
- `analytics_daily_date` on `date`
- `analytics_daily_period` on `period`
- `analytics_daily_merchant_date` on `merchantId`, `date`

**Business Rules:**
- Analytics records are automatically deleted when merchant is deleted (CASCADE)
- `storeId = NULL` represents merchant-wide aggregated data (all stores combined)
- `period` values: `daily`, `weekly`, `monthly` (default: `daily`)
- `ordersByChannel` JSONB format:
  ```json
  {
    "online": 100,
    "offline": 50,
    "pos": 25,
    "marketplace": 10,
    "social_media": 5
  }
  ```
- `ordersByFulfillment` JSONB format:
  ```json
  {
    "delivery": 80,
    "pickup": 30,
    "store_purchase": 65
  }
  ```
- `revenueByChannel` JSONB format:
  ```json
  {
    "online": "50000.00",
    "offline": "25000.00",
    "pos": "15000.00"
  }
  ```
- `customersByCity` JSONB format (top cities):
  ```json
  {
    "Mumbai": 150,
    "Delhi": 120,
    "Bangalore": 100
  }
  ```
- `customersByGender` JSONB format:
  ```json
  {
    "male": 500,
    "female": 300,
    "other": 50
  }
  ```
- `trafficSource` JSONB format:
  ```json
  {
    "web": 1000,
    "mobile_app": 800,
    "pos": 200
  }
  ```
- `topSellingProducts` JSONB format:
  ```json
  [
    {
      "productId": "uuid",
      "productName": "Product Name",
      "quantitySold": 100,
      "revenue": "50000.00"
    }
  ]
  ```
- `averageOrderValue = totalRevenue / totalOrders`
- `fulfillmentRate` = (Successful orders / Total orders) × 100
- `returnRate` = (Returned orders / Total orders) × 100
- `cancellationRate` = (Cancelled orders / Total orders) × 100
- Ratings use 2-decimal precision (e.g., 4.75 out of 5.00)
- One record per merchant per store per day (or aggregated for all stores)
- Data is typically aggregated daily from raw events

---

### merchant_analytics_raw

Detailed event-level analytics data for tracking all customer interactions and events.

**Primary Key:** `id` (UUID)

**Foreign Keys:**
- None defined (no explicit FKs in schema)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique event identifier |
| merchantId | UUID | NOT NULL | Merchant who owns this event |
| storeId | UUID | - | Store context (if applicable) |
| eventType | VARCHAR(50) | NOT NULL | Type of event |
| eventName | VARCHAR(100) | NOT NULL | Event name/description |
| customerId | UUID | - | Customer who triggered event |
| sessionId | VARCHAR(255) | - | Session ID for web sessions |
| productId | UUID | - | Related product (if applicable) |
| productVariantId | UUID | - | Related product variant |
| categoryId | UUID | - | Related category |
| orderId | UUID | - | Related order |
| eventProperties | JSONB | - | Flexible event-specific data |
| channel | VARCHAR(20) | - | Sales channel |
| source | VARCHAR(50) | - | Traffic source |
| deviceType | VARCHAR(50) | - | Device type |
| userAgent | TEXT | - | Browser/user agent |
| ipAddress | VARCHAR(45) | - | Client IP address |
| utmSource | VARCHAR(255) | - | UTM source parameter |
| utmMedium | VARCHAR(255) | - | UTM medium parameter |
| utmCampaign | VARCHAR(255) | - | UTM campaign parameter |
| utmTerm | VARCHAR(255) | - | UTM term parameter |
| utmContent | VARCHAR(255) | - | UTM content parameter |
| city | VARCHAR(100) | - | Customer city |
| state | VARCHAR(100) | - | Customer state |
| country | VARCHAR(100) | DEFAULT 'India' | Customer country |
| occurredAt | TIMESTAMP | NOT NULL | Event occurrence timestamp |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Record creation timestamp |

**Indexes:**
- `analytics_raw_merchant` on `merchantId`
- `analytics_raw_store` on `storeId`
- `analytics_raw_type` on `eventType`
- `analytics_raw_customer` on `customerId`
- `analytics_raw_product` on `productId`
- `analytics_raw_order` on `orderId`
- `analytics_raw_occurred` on `occurredAt`
- `analytics_raw_session` on `sessionId`
- `analytics_raw_merchant_event` on `merchantId`, `eventType`

**Business Rules:**
- Raw events are never automatically deleted (no CASCADE on merchant)
  - This preserves historical analytics even if merchant is deleted
- `eventType` values: `page_view`, `add_to_cart`, `purchase`, `search`, `product_view`, `checkout`, etc.
- `channel` values: `online`, `offline`, `pos`
- `source` values: `web`, `mobile_app`, `pos`
- `deviceType` values: `desktop`, `mobile`, `tablet`, `pos`
- `eventProperties` JSONB provides flexible schema for event-specific data:
  ```json
  {
    "searchQuery": "laptop",
    "resultsCount": 25,
    "filtersApplied": ["price", "brand"]
  }
  ```
- UTM parameters track marketing campaign attribution
  - `utmSource`: Google, Facebook, Email, etc.
  - `utmMedium`: cpc, banner, email, etc.
  - `utmCampaign`: Summer Sale, Diwali Offer, etc.
  - `utmTerm`: Keywords for paid search
  - `utmContent`: Specific content variant (A/B testing)
- `sessionId` links multiple events to a single browsing session
- `occurredAt` is the actual event time (may differ from `createdAt`)
- `ipAddress` supports IPv6 (up to 45 characters)
- Geolocation fields (`city`, `state`, `country`) derived from IP address
- Events are typically aggregated daily into `merchant_analytics_daily`
- Raw events are retained for detailed analysis and debugging
- High-volume table requiring appropriate retention policies
