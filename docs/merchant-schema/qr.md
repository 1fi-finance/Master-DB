# QR Codes

## Tables

### qrTable

QR code management for merchants with support for different journey types and product-specific QRs.

**Primary Key:** `id` (INTEGER/SERIAL)

**Foreign Keys:**
- `merchantId` → `merchants.id` (ON DELETE CASCADE)
- `productId` → `products.id` (ON DELETE CASCADE)
- `variantId` → `products.id` (ON DELETE CASCADE)

**Columns:**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PK, NOT NULL | Unique QR code identifier |
| merchantId | UUID | FK, NOT NULL | Merchant who owns this QR code |
| qrCode | VARCHAR(255) | NOT NULL | QR code identifier/string |
| journeyType | journey ENUM | DEFAULT 'basic' | Type of QR journey |
| amount | DECIMAL(15,2) | - | Predefined amount for QR |
| productId | UUID | FK | Related product (for product-based QR) |
| variantId | UUID | FK | Related product variant (for variant-based QR) |
| qrCodeData | TEXT | - | Additional QR code data/JSON |
| isActive | BOOLEAN | NOT NULL, DEFAULT true | QR code active status |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW | QR code creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, DEFAULT NOW | Last update timestamp |

**Business Rules:**
- QR codes are automatically deleted when merchant is deleted (CASCADE)
- QR codes are automatically deleted when linked product is deleted (CASCADE)
- `journeyType` values:
  - `basic` - Generic QR code for merchant (no product association)
  - `productBased` - QR code linked to a specific product
  - `variantBased` - QR code linked to a specific product variant
- `qrCode` contains the actual QR code string/identifier
  - This is typically the data encoded in the QR image
  - Example format: "QR-MERCHANT-UUID-TIMESTAMP"
- `amount` allows pre-defined payment amounts for the QR code
  - NULL or 0 = Customer enters amount (generic QR)
  - Specific value = Fixed amount QR (e.g., ₹500, ₹1000)
- `productId` is required when `journeyType = productBased`
- `variantId` is required when `journeyType = variantBased`
  - Note: `variantId` also references `products.id` (assuming variants are stored in same table)
- `qrCodeData` can store additional information as TEXT or JSON:
  ```json
  {
    "label": "Store Counter 1",
    "location": "Mumbai Store",
    "description": "QR code for front counter payments"
  }
  ```
- `isActive` controls QR code visibility and usability
  - `true` - QR code is active and can be scanned
  - `false` - QR code is disabled (temporarily or permanently)
- QR codes can be deactivated without deletion (soft delete via `isActive`)
- Use cases:
  - **Basic QR**: General store payment QR (displayed at checkout, counter)
  - **Product QR**: Product-specific payment QR (on product shelves, catalogues)
  - **Variant QR**: Variant-specific payment QR (size/color specific)
- Multiple QR codes can exist per merchant
  - Same merchant can have QR codes at different locations
  - Same merchant can have QR codes for different products
