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
