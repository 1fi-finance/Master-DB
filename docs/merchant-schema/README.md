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

## Database Organization
All merchant tables use the `merchantSchema` schema in PostgreSQL.

---

## Quick Reference

### Core Documentation
- [**Merchants**](./merchants.md) - Merchant entities, stores, KYC, and business metadata
- [**Products**](./products.md) - Product catalog, categories, variants, and bundles
- [**Orders**](./orders.md) - Order processing, items, and lifecycle management
- [**Settlements**](./settlements.md) - Payment settlements, batching, and reconciliation
- [**Analytics**](./analytics.md) - Business metrics, revenue tracking, and reporting
- [**QR Codes**](./qr.md) - QR code generation, tracking, and usage analytics

### Technical Reference
- [**Entity Relationships**](./relationships.md) - Complete relationship mapping and foreign keys
- [**Enum Definitions**](./enums.md) - All enum types and their values
- [**ERD Diagram**](./ERD.md) - Entity Relationship Diagram with visual schema

---

## Table Summary

### Merchant Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `merchants` | Core merchant profiles | Multi-business support, KYC tracking |
| `merchant_stores` | Physical/digital stores | POS integration, location data |
| `merchant_kyc` | KYC documentation | Verification workflow |
| `merchant_business_metadata` | Business details | GST, PAN, bank details |

### Product Catalog
| Table | Description | Key Features |
|-------|-------------|--------------|
| `product_categories` | Category hierarchy | Multi-level nesting |
| `product_tags` | Product tagging system | Flexible categorization |
| `products` | Core product catalog | Variant management, pricing |
| `product_variants` | SKU-level variants | Size, color, attributes |
| `product_bundles` | Product bundles | Dynamic pricing |
| `product_inventory` | Stock management | Multi-store tracking |

### Order Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `orders` | Order records | Multi-channel support |
| `order_items` | Line items | Variant-level detail |
| `order_billing` | Billing breakdown | Taxes, discounts |
| `order_fulfillment` | Fulfillment tracking | Status workflow |
| `order_metadata` | Additional data | Flexible JSONB storage |

### Settlement & Finance
| Table | Description | Key Features |
|-------|-------------|--------------|
| `settlement_batches` | Settlement batches | Daily/weekly batching |
| `settlement_items` | Line-level settlements | Transaction linkage |
| `settlement_adjustments` | Adjustments & refunds | Credit/debit tracking |

### Analytics & Reporting
| Table | Description | Key Features |
|-------|-------------|--------------|
| `daily_merchant_analytics` | Daily metrics | Revenue, orders, GMV |
| `daily_store_analytics` | Store performance | Per-store analytics |
| `daily_product_analytics` | Product metrics | Sales, views, conversion |

### QR Code System
| Table | Description | Key Features |
|-------|-------------|--------------|
| `qr_codes` | QR code registry | Generation, tracking |
| `qr_scans` | Scan analytics | Usage metrics |

---

## Key Features

### Multi-Store Support
- Physical stores with POS integration
- Online stores with e-commerce platforms
- Marketplace channels (Amazon, Flipkart)
- Unified inventory across all channels

### Product Management
- Hierarchical categories with unlimited nesting
- Variant system for size, color, etc.
- Bundle products with custom pricing
- Multi-store inventory tracking
- Tag-based organization

### Order Processing
- Multi-channel order ingestion
- Comprehensive billing with taxes
- Fulfillment status tracking
- Metadata extension via JSONB

### Settlement System
- Automated batch processing
- Transaction-level reconciliation
- Adjustment and refund handling
- Audit trail for all settlements

### Analytics & Reporting
- Daily aggregated metrics
- Merchant, store, and product level
- Revenue and GMV tracking
- Conversion rate analysis

---

## Schema Files

Source files are located at: `src/db/schema/merchant/`

```
merchant/
├── merchants/
│   ├── merchants.ts
│   ├── stores.ts
│   └── kyc.ts
├── products/
│   ├── categories.ts
│   ├── products.ts
│   ├── variants.ts
│   ├── bundles.ts
│   └── inventory.ts
├── orders/
│   ├── orders.ts
│   ├── billing.ts
│   └── fulfillment.ts
├── settlements/
│   ├── settlements.ts
│   └── analytics.ts
└── qr/
    └── qr-codes.ts
```

---

## Documentation Index

### Business Documentation
- [Merchants](./merchants.md) - Complete merchant entity documentation
- [Products](./products.md) - Product catalog and inventory management
- [Orders](./orders.md) - Order processing and fulfillment
- [Settlements](./settlements.md) - Payment settlements and adjustments
- [Analytics](./analytics.md) - Business metrics and reporting
- [QR Codes](./qr.md) - QR code generation and tracking

### Technical Documentation
- [Relationships](./relationships.md) - Entity relationships and foreign keys
- [Enums](./enums.md) - All enum definitions and values
- [ERD](./ERD.md) - Entity Relationship Diagram

---

## Getting Started

1. **For Business Analysts**: Start with [Merchants](./merchants.md) and [Products](./products.md)
2. **For Developers**: Review [Relationships](./relationships.md) and [ERD](./ERD.md)
3. **For Data Teams**: See [Analytics](./analytics.md) for aggregated data structures
4. **For Finance Teams**: Check [Settlements](./settlements.md) for payment flows

---

## Related Documentation
- [Main Database Documentation](../../README.md)
- [Database Schema Overview](../../database-schema.md)
- [Migration Guide](../../migrations.md)
