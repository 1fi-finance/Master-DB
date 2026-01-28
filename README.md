# Project Alpha - Database Schema Documentation

Comprehensive database schema documentation for a financial services platform including Loan Management System (LMS), Loan Origination System (LOS), Merchant Management, and User management.

## 📊 Overview

This project contains production-ready database schema documentation for:
- **LMS (Loan Management System)** - Complete loan lifecycle management
- **LOS (Loan Origination System)** - Loan application and approval workflow
- **Merchant Schema** - E-commerce and merchant management
- **User Schema** - User accounts and authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd alpha-db

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your database credentials
nano .env
```

### Database Setup

```bash
# Run database migrations
npm run db:push

# Or generate migrations
npm run db:generate

# Apply migrations
npm run db:migrate
```

## 📁 Project Structure

```
alpha-db/
├── docs/                          # Comprehensive documentation
│   ├── lms-schema/                # LMS documentation (20+ tables)
│   │   ├── README.md              # LMS overview & navigation
│   │   ├── core/                  # Core loan management docs
│   │   ├── collections/           # Collections & recovery docs
│   │   ├── fees/                  # Fee management docs
│   │   ├── interest/              # Interest accrual docs
│   │   ├── modifications/         # Loan modifications docs
│   │   ├── erds/                  # Entity Relationship Diagrams
│   │   ├── enums.md               # All enum definitions
│   │   └── relationships.md       # Complete relationship mappings
│   ├── merchant-schema/           # Merchant management docs
│   ├── los-schema/                # Loan origination docs
│   └── plans/                     # Implementation plans
├── src/
│   └── db/
│       ├── schema/                # Database schema definitions
│       │   ├── lms/               # LMS tables
│       │   ├── los/               # LOS tables
│       │   ├── merchant/          # Merchant tables
│       │   ├── users/             # User tables
│       │   ├── definitions.ts     # Schema definitions
│       │   ├── index.ts           # Schema exports
│       │   └── enums.ts           # Enum definitions
│       └── migrations/            # Database migrations
├── drizzle/                       # Drizzle ORM configuration
├── scripts/                       # Utility scripts
├── .env.example                   # Environment variables template
├── package.json
└── README.md
```

## 📚 Documentation

### LMS Schema Documentation
**Location:** `docs/lms-schema/`

The LMS schema handles the complete loan lifecycle including:
- Loan account creation and management
- EMI scheduling and repayment tracking
- Collections and delinquency management
- Fee structure and payment tracking
- Interest accrual and rate management
- Loan modifications (restructuring, top-up, rate changes)
- NPA monitoring and provisioning

**Key Statistics:**
- 20+ tables comprehensively documented
- 6 ERD diagrams with visual mappings
- 13 enums with state transitions
- 50+ production-ready SQL queries
- Generated via parallel execution (8 workers, ~2 hours)

**Quick Access:**
- [LMS README](docs/lms-schema/README.md)
- [Core Tables](docs/lms-schema/core/)
- [Collections](docs/lms-schema/collections/)
- [Fees](docs/lms-schema/fees/)
- [Interest](docs/lms-schema/interest/)
- [Modifications](docs/lms-schema/modifications/)
- [ERD Diagrams](docs/lms-schema/erds/)

### Other Schema Documentation
- **Merchant Schema** - E-commerce, products, orders, settlements
- **LOS Schema** - Loan applications, approvals, collateral, documents
- **User Schema** - User accounts, authentication, transactions

## 🛠️ Available Scripts

```bash
# Database Operations
npm run db:push          # Push schema changes to database
npm run db:generate      # Generate new migration
npm run db:migrate       # Apply pending migrations
npm run db:studio        # Open Drizzle Studio

# Documentation
npm run docs:lms:publish # Publish LMS docs to Notion (requires Notion setup)

# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run test             # Run tests
npm run lint             # Run linter
```

## 🗄️ Database Schemas

### LMS Tables

**Core Module (3 tables)**
- `loan_account` - Core loan accounts with principal, LTV, status
- `emi_schedule` - EMI payment schedule with installment tracking
- `repayment` - Payment transactions with multi-mode support

**Disbursement (1 table)**
- `disbursement` - Bank transfers with UTR tracking

**Collections (4 tables)**
- `loan_collection_status` - DPD calculation, bucket assignment
- `collection_bucket` - Risk-based segmentation
- `collection_activity` - Follow-up tracking, agent notes
- `collection_proceeding` - NPA resolution, legal tracking

**Fees (4 tables)**
- `fee_master` - Fee configuration
- `loan_fees` - Per-loan fee assessment
- `fee_payment` - Payment tracking
- `penalty` - Late charges

**Interest (3 tables)**
- `interest_accrual` - Daily calculation
- `interest_accrual_log` - Audit trail
- `interest_rate_history` - Rate changes

**Modifications (5 tables)**
- `loan_restructuring` - Term modifications
- `top_up_loan` - Additional funding
- `interest_rate_adjustment` - Rate changes
- `tenure_change` - EMI restructuring
- `restructuring_terms` - Custom conditions

### LOS Tables
- Loan applications and approvals
- Collateral management
- Document tracking
- KYC verification

### Merchant Tables
- Merchant profiles and stores
- Product catalog with variants
- Order management
- Settlements and analytics
- QR code tracking

## 🔐 Security

**IMPORTANT:** Never commit `.env` file to version control.

- `.env` is listed in `.gitignore`
- Use `.env.example` as a template
- Keep production credentials in secure environment variables
- Rotate database credentials if exposed

## 📝 Environment Variables

See [`.env.example`](.env.example) for all required environment variables.

Required variables:
- `DATABASE_URL` - PostgreSQL connection string

Optional variables:
- `NOTION_API_KEY` - For Notion integration
- `NOTION_PARENT_PAGE_ID` - Notion parent page ID

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📖 Documentation Standards

This project follows comprehensive documentation standards:
- All tables documented with field specifications
- Business logic and formulas explained
- SQL query examples provided
- ERD diagrams for visual reference
- Enum definitions with state transitions
- Relationship mappings between tables

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Update documentation if schema changes
4. Run tests
5. Submit a pull request

## 📄 License

[Specify your license here]

## 👥 Team

- [Your Name] - Lead Developer
- [Team Member] - Database Architect
- [Team Member] - Documentation Specialist

## 🔗 Related Projects

- [Backend API](#)
- [Frontend Application](#)
- [Admin Dashboard](#)

---

**Last Updated:** January 27, 2026

**Documentation Status:** ✅ Complete
**Quality Level:** ⭐⭐⭐⭐⭐ (Production Ready)

For detailed documentation, see the [`docs/`](docs/) directory.
