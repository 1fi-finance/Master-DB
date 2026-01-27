# LMS Database Schema Documentation

## Overview
The Loan Management System (LMS) schema handles the complete loan lifecycle including:
- Loan account creation and management
- EMI scheduling and repayment tracking
- Disbursement and fund transfer
- Collections and delinquency management
- Fee structure and payment tracking
- Interest accrual and rate management
- Loan modifications (restructuring, top-up, rate changes)
- NPA monitoring and provisioning

## Database Organization
All LMS tables use the `lmsSchema` schema in PostgreSQL.

---

## Quick Reference

### Core Documentation
- [**Loan Account**](./account.md) - Core loan account management and tracking
- [**Disbursement**](./disbursement.md) - Loan disbursement and fund transfer
- [**Repayment**](./repayment.md) - EMI schedule and payment processing
- [**Collections**](./collections.md) - Collections workflow and delinquency management
- [**Fees**](./fees.md) - Fee structure, calculation, and payment tracking
- [**Interest**](./interest.md) - Interest accrual and rate management
- [**Modifications**](./modifications.md) - Loan modifications and restructuring

### Technical Reference
- [**Entity Relationships**](./relationships.md) - Complete relationship mapping and foreign keys
- [**Enum Definitions**](./enums.md) - All enum types and their values
- [**ERD Diagram**](./ERD.md) - Entity Relationship Diagram with visual schema

---

## Table Summary

### Core Loan Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `loan_account` | Core loan accounts | Principal tracking, LTV calculation, status management |
| `emi_schedule` | EMI payment schedule | Installment tracking, overdue management |
| `repayment` | Payment transactions Multi-mode payment, allocation |  |

### Disbursement
| Table | Description | Key Features |
|-------|-------------|--------------|
| `disbursement` | Loan disbursement tracking | Bank transfer, UTR tracking, status workflow |

### Collections Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `loan_collection_status` | Collection status tracking | DPD calculation, bucket assignment |
| `collection_bucket` | Collection bucket definitions | Risk-based segmentation |
| `collection_activity` | Collection activities log | Follow-up tracking, agent notes |
| `collection_proceeding` | Legal proceedings | NPA resolution, legal tracking |

### Fee Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `fee_master` | Fee configuration | Flexible fee types, calculation methods |
| `loan_fees` | Loan-specific fees | Per-loan fee assessment |
| `fee_payment` | Fee payment tracking | Payment allocation, reconciliation |
| `penalty` | Penalty charges | Late payment, bounce charges |

### Interest Management
| Table | Description | Key Features |
|-------|-------------|--------------|
| `interest_accrual` | Daily interest accrual | Period-based calculation, ledger posting |
| `interest_accrual_log` | Accrual audit trail | Complete history, reconciliation |
| `interest_rate_history` | Rate change tracking | Historical rate modifications |

### Loan Modifications
| Table | Description | Key Features |
|-------|-------------|--------------|
| `restructuring` | Loan restructuring | Term modifications, relief measures |
| `top_up_loan` | Top-up loans | Additional funding, blended rates |
| `rate_adjustment` | Interest rate changes | Floating rate adjustments |
| `tenure_change` | Tenure modifications | EMI restructuring |
| `loan_terms` | Custom loan terms | Special conditions, overrides |

---

## Key Features

### Comprehensive Loan Lifecycle
- Complete journey from sanction to closure
- Automated EMI schedule generation
- Real-time outstanding tracking
- Multi-payment mode support

### Collections Management
- Automated DPD calculation
- Risk-based bucket assignment
- Agent workflow management
- Legal proceeding tracking
- NPA monitoring and provisioning

### Flexible Fee Structure
- Configurable fee types and calculation methods
- One-time and recurring fees
- Penalty and late fee management
- GL head mapping for accounting

### Interest Management
- Daily interest accrual
- Support for multiple rate types (fixed, floating)
- Historical rate tracking
- Ledger integration

### Loan Modifications
- Restructuring with term changes
- Top-up loans with blended pricing
- Interest rate adjustments
- Tenure extensions
- Custom terms and conditions

### Disbursement Management
- Multi-mode disbursement (IMPS, NEFT, RTGS)
- Bank account validation
- UTR tracking
- Status workflow and audit trail

---

## Schema Files

Source files are located at: `src/db/schema/lms/`

```
lms/
├── account.ts                    # Loan account
├── disbursement.ts               # Disbursement tracking
├── repayment.ts                  # EMI schedule and repayments
├── collections/
│   ├── status.ts                 # Collection status
│   ├── bucket.ts                 # Collection buckets
│   ├── activity.ts               # Collection activities
│   ├── proceeding.ts             # Legal proceedings
│   └── index.ts                  # Collections exports
├── fees/
│   ├── fee-master.ts             # Fee configuration
│   ├── loan-fees.ts              # Loan fees
│   ├── fee-payment.ts            # Fee payments
│   ├── penalty.ts                # Penalties
│   └── index.ts                  # Fees exports
├── interest/
│   ├── accrual.ts                # Interest accrual
│   ├── accrual-log.ts            # Accrual log
│   ├── rate-history.ts           # Rate history
│   └── index.ts                  # Interest exports
└── modifications/
    ├── restructuring.ts          # Loan restructuring
    ├── top-up.ts                 # Top-up loans
    ├── rate-adjustment.ts        # Rate adjustments
    ├── tenure-change.ts          # Tenure changes
    ├── terms.ts                  # Custom terms
    └── index.ts                  # Modifications exports
```

---

## Documentation Index

### Business Documentation
- [Loan Account](./account.md) - Core loan entity and lifecycle
- [Disbursement](./disbursement.md) - Fund transfer and tracking
- [Repayment](./repayment.md) - EMI processing and allocation
- [Collections](./collections.md) - Collections workflow and NPA management
- [Fees](./fees.md) - Fee structure and payment processing
- [Interest](./interest.md) - Interest calculation and accrual
- [Modifications](./modifications.md) - Loan modifications and restructuring

### Technical Documentation
- [Relationships](./relationships.md) - Entity relationships and foreign keys
- [Enums](./enums.md) - All enum definitions and values
- [ERD](./ERD.md) - Entity Relationship Diagram

---

## Getting Started

### For Business Analysts
1. Start with [Loan Account](./account.md) to understand the core loan entity
2. Review [Repayment](./repayment.md) for EMI schedule structure
3. Explore [Collections](./collections.md) for delinquency management
4. Check [Fees](./fees.md) for fee configuration options

### For Developers
1. Review [Relationships](./relationships.md) for entity connections
2. Study [ERD](./ERD.md) for visual schema overview
3. Examine [Enums](./enums.md) for all possible values
4. Reference [Interest](./interest.md) for accrual logic

### For Collections Teams
1. Read [Collections](./collections.md) for workflow overview
2. Understand bucket-based risk segmentation
3. Learn about NPA provisioning requirements
4. Review activity logging and agent assignment

### For Finance Teams
1. Check [Disbursement](./disbursement.md) for fund transfer process
2. Review [Fees](./fees.md) for fee GL mapping
3. Study [Interest](./interest.md) for accrual posting
4. Understand [Modifications](./modifications.md) for restructuring impact

---

## Related Documentation
- [Main Database Documentation](../../README.md)
- [Database Schema Overview](../../database-schema.md)
- [Merchant Schema](../merchant-schema/README.md)
- [LOS Schema](../los-schema/README.md)
- [Migration Guide](../../migrations.md)
