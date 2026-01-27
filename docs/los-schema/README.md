# LOS Database Schema Documentation

## Overview
The LOS (Loan Origination System) schema handles the complete loan application lifecycle from application creation to sanction.

## Domains
- **Applications**: Loan application tracking and status management
- **Products**: Loan product definitions and configuration
- **Sanctions**: Loan sanction terms and agreement generation
- **Documents**: KYC and supporting document management
- **Approval**: Multi-level approval workflow
- **Collateral**: Mutual fund collateral management with RTA integration

## Database Organization
All LOS tables use the `los` PostgreSQL schema.

## Documentation Index
- [Applications](./applications.md) - Loan applications and lifecycle
- [Products](./products.md) - Loan products and LTV configuration
- [Sanctions](./sanctions.md) - Loan sanctions and agreements
- [Documents](./documents.md) - Document management and verification
- [Approval](./approval.md) - Approval workflow
- [Collateral](./collateral.md) - Mutual fund collateral
- [Relationships](./relationships.md) - Entity relationships
- [Enums](./enums.md) - Enum definitions
