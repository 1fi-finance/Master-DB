# Loan Account

## loan_account

**Purpose:** Core loan account table representing the active loan lifecycle for disbursed loans. Each record represents a unique loan account with its current outstanding, interest rate, and status.

**Schema:** lmsSchema

**Table Name:** `loan_account`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique loan account identifier |
| loanApplicationId | UUID | FK, UNIQUE, NOT NULL | - | Reference to loan application (one account per application) |
| loanSanctionId | UUID | FK, NOT NULL | - | Reference to loan sanction |
| accountNumber | VARCHAR(50) | UNIQUE, NOT NULL | - | Human-readable loan account number |
| principalAmount | DECIMAL(15,2) | NOT NULL | - | Original sanctioned principal amount |
| currentOutstanding | DECIMAL(15,2) | NOT NULL | - | Current principal outstanding (updated after payments) |
| interestRate | DECIMAL(8,4) | NOT NULL | - | Annual interest rate (e.g., 12.5% = 12.5000) |
| tenureMonths | INTEGER | NOT NULL | - | Loan tenure in months |
| loanStartDate | TIMESTAMP | NOT NULL | - | Loan start/disbursement date |
| loanEndDate | TIMESTAMP | NOT NULL | - | Loan maturity date |
| nextEmiDueDate | DATE | - | - | Next EMI due date (updated after each payment) |
| status | loan_status | NOT NULL | 'active' | Current loan status (active, fully_paid, foreclosed, defaulted, closed) |
| totalCollateralValue | DECIMAL(15,2) | NOT NULL | - | Total value of all collateral |
| currentLtv | DECIMAL(5,2) | NOT NULL | - | Current Loan-to-Value ratio (outstanding/collateral * 100) |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_applications (loanApplicationId → id)
- loan_sanction (loanSanctionId → id)

**Referenced By:**
- emi_schedule (loanApplicationId → id)
- repayment (loanApplicationId → id)
- disbursement (loanApplicationId → id)
- interest_accrual (loanApplicationId → id)
- fee_payment (loanApplicationId → id)
- collection_activity (loanApplicationId → id)

### Indexes

- `loan_acc_loan_app` on loanApplicationId (for application lookups)
- `loan_acc_number` on accountNumber (for account number searches)
- `loan_acc_status` on status (for filtering by loan status)
- `loan_acc_next_emi` on nextEmiDueDate (for EMI collection/due reports)

### Business Logic

**Loan Status States:**
- `active` - Loan is active and repayments are being collected
- `fully_paid` - All EMIs paid successfully
- `foreclosed` - Loan closed early by customer payment
- `defaulted` - Loan marked as default (NPA)
- `closed` - Loan closed (write-off, settlement, etc.)

**LTV Calculation:**
```
currentLtv = (currentOutstanding / totalCollateralValue) * 100
```

**Outstanding Updates:**
- Decremented when repayments are received (principal component)
- Recalculated after EMI schedule allocation
- May include accrued interest in some cases

**Next EMI Due Date:**
- Initially set based on loanStartDate + 1 month
- Updated after each successful payment to next installment date
- Used for collection reminders and overdue tracking

**Account Creation:**
- Created when loan is disbursed (not at sanction time)
- One-to-one relationship with loan_application
- accountNumber must be unique across all loans

### Common Queries

```sql
-- Get all active loans with upcoming EMI due in next 7 days
SELECT
    la.id,
    la.accountNumber,
    la.currentOutstanding,
    la.nextEmiDueDate,
    la.interestRate,
    lap.firstName,
    lap.lastName
FROM loan_account la
JOIN loan_applications lap ON la.loanApplicationId = lap.id
WHERE la.status = 'active'
  AND la.nextEmiDueDate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
ORDER BY la.nextEmiDueDate;

-- Calculate portfolio summary
SELECT
    status,
    COUNT(*) as loan_count,
    SUM(principalAmount) as total_principal_sanctioned,
    SUM(currentOutstanding) as total_outstanding,
    AVG(currentLtv) as avg_ltv
FROM loan_account
GROUP BY status;

-- Get overdue loans (next EMI date passed)
SELECT
    la.accountNumber,
    la.currentOutstanding,
    la.nextEmiDueDate,
    CURRENT_DATE - la.nextEmiDueDate as days_overdue,
    la.interestRate
FROM loan_account la
WHERE la.status = 'active'
  AND la.nextEmiDueDate < CURRENT_DATE
ORDER BY days_overdue DESC;

-- High LTV alert (LTV > 80%)
SELECT
    la.accountNumber,
    la.currentOutstanding,
    la.totalCollateralValue,
    la.currentLtv,
    lap.firstName,
    lap.lastName
FROM loan_account la
JOIN loan_applications lap ON la.loanApplicationId = lap.id
WHERE la.currentLtv > 80
  AND la.status = 'active';
```

**Related Tables:**
- loan_applications - Application details and borrower information
- loan_sanction - Sanctioned terms and conditions
- emi_schedule - Complete repayment schedule for this loan
- repayment - Actual payment transactions
- disbursement - Disbursement details linked to this account
- interest_accrual - Daily/monthly interest accrual records
