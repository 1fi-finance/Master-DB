# Top-Up Loan

## top_up_loan

**Purpose:** Track top-up loan requests and disbursements on existing loan accounts.

**Schema:** lmsSchema

**Table Name:** `top_up_loan`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique top-up identifier |
| parentLoanAccountId | UUID | FK, NOT NULL | - | Reference to parent loan account |
| topUpAmount | DECIMAL(15,2) | NOT NULL | - | Additional loan amount |
| newTotalLoan | DECIMAL(15,2) | NOT NULL | - | Combined principal amount |
| newTenure | INTEGER | NOT NULL | - | Revised tenure in months |
| newInterestRate | DECIMAL(8,4) | NOT NULL | - | Interest rate for top-up |
| approvedDate | DATE | - | - | Date top-up approved |
| disbursedDate | DATE | - | - | Date top-up amount disbursed |
| status | VARCHAR(50) | NOT NULL | 'pending' | Current status |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (parentLoanAccountId → id)

**Referenced By:**
- None

### Indexes

- `top_up_parent_loan` on parentLoanAccountId
- `top_up_status` on status
- `top_up_app_date` on approvedDate

### Business Logic

**Top-Up Loan Concept:**
- Additional loan amount on existing loan
- Combines with outstanding principal
- May have different interest rate
- New tenure for combined amount
- Single EMI for consolidated loan

**Status Workflow:**
```
pending → approved → disbursed
    ↓
cancelled
```

**Approval Process:**
1. Customer requests top-up amount
2. System assesses eligibility (repayment track record)
3. Check current outstanding and LTV ratio
4. Determine new terms (amount, rate, tenure)
5. Credit approval if eligible
6. Set approvedDate and approvedBy
7. Disburse funds to customer account
8. Update parent loan with new terms
9. Recalculate EMI for total amount

**Eligibility Criteria:**
- Minimum 12 months repayment history
- No payment defaults in last 6 months
- Current LTV within acceptable limits
- Income supports increased EMI
- Credit score meets threshold

**Key Rules:**
- Multiple top-ups allowed on same loan
- newTotalLoan = currentOutstanding + topUpAmount
- newTenure can extend original tenure
- newInterestRate may differ from original rate
- Single consolidated EMI after top-up
- Top-up amount disbursed separately
- Creates new disbursement record
- Updates loan_account principal and terms

**Financial Calculations:**
```
newTotalLoan = principalOutstanding + topUpAmount
newEmi = calculateEMI(newTotalLoan, newInterestRate, newTenure)
topUpEligibility = (currentOutstanding × maxLTV) - currentOutstanding
```

**Integration Points:**
- Reads from: loan_account (current outstanding, terms)
- Creates: loan_disbursement (for top-up amount)
- Updates: loan_account (new principal, tenure, rate)
- Creates: interest_rate_history (if rate changes)
- Updates: loan_repayment schedule

### Common Queries

```sql
-- Pending top-up requests
SELECT
    tl.id,
    tl.parentLoanAccountId,
    la.accountNumber,
    tl.topUpAmount,
    tl.newTotalLoan,
    tl.newTenure,
    tl.newInterestRate,
    tl.createdAt
FROM top_up_loan tl
JOIN loan_account la ON la.id = tl.parentLoanAccountId
WHERE tl.status = 'pending'
ORDER BY tl.createdAt;

-- Approved but not disbursed top-ups
SELECT
    tl.*,
    la.accountNumber,
    la.currentOutstanding
FROM top_up_loan tl
JOIN loan_account la ON la.id = tl.parentLoanAccountId
WHERE tl.status = 'approved'
  AND tl.disbursedDate IS NULL
ORDER BY tl.approvedDate;

-- Top-up disbursement trends
SELECT
    DATE_TRUNC('month', disbursedDate) as month,
    COUNT(*) as count,
    SUM(topUpAmount) as totalTopUpAmount,
    AVG(topUpAmount) as avgTopUpAmount
FROM top_up_loan
WHERE status = 'disbursed'
  AND disbursedDate >= '2026-01-01'
GROUP BY DATE_TRUNC('month', disbursedDate)
ORDER BY month;

-- Top-up success rate
SELECT
    COUNT(*) FILTER (WHERE status = 'disbursed') as disbursed,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    ROUND(
        (COUNT(*) FILTER (WHERE status = 'disbursed')::NUMERIC /
         COUNT(*)::NUMERIC) * 100, 2
    ) as successRate
FROM top_up_loan
WHERE createdAt >= '2026-01-01';

-- Find eligible loans for top-up
SELECT
    la.id,
    la.accountNumber,
    la.currentOutstanding,
    la.tenureMonths,
    la.interestRate,
    (la.currentOutstanding * 0.75) - la.currentOutstanding as potentialTopUp
FROM loan_account la
WHERE la.status = 'active'
  AND la.loanStartDate < CURRENT_DATE - INTERVAL '12 months'
  AND NOT EXISTS (
    SELECT 1 FROM top_up_loan tl
    WHERE tl.parentLoanAccountId = la.id
      AND tl.status IN ('pending', 'approved')
  )
ORDER BY la.currentOutstanding DESC;

-- Top-up impact analysis
SELECT
    tl.topUpAmount,
    tl.newTotalLoan,
    tl.newTenure,
    la.tenureMonths as originalTenure,
    tl.newInterestRate,
    la.interestRate as originalRate,
    tl.disbursedDate
FROM top_up_loan tl
JOIN loan_account la ON la.id = tl.parentLoanAccountId
WHERE tl.status = 'disbursed'
  AND tl.disbursedDate BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY tl.topUpAmount DESC;
```

### Related Tables

- **loan_account** - Parent loan being topped up
- **loan_disbursement** - Top-up amount disbursement
- **interest_rate_history** - Rate changes from top-up
- **loan_repayment** - Revised EMI schedule
- **loan_sanction** - If top-up requires new sanction
- **loan_applications** - Top-up application process
