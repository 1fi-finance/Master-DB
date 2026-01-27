# Rate History

## interest_rate_history

**Purpose:** Complete audit trail of interest rate changes for loan accounts.

**Schema:** lmsSchema

**Table Name:** `interest_rate_history`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique history record identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| effectiveDate | DATE | NOT NULL | - | Date when rate change becomes effective |
| oldRate | DECIMAL(8,4) | NOT NULL | - | Previous interest rate (percentage) |
| newRate | DECIMAL(8,4) | NOT NULL | - | New interest rate (percentage) |
| reason | TEXT | NOT NULL | - | Explanation for rate change |
| changedBy | VARCHAR(255) | NOT NULL | - | User/system who made the change |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

**Referenced By:**
- None

### Indexes

- `int_rate_hist_loan_acc` on loanAccountId
- `int_rate_hist_eff_date` on effectiveDate
- `int_rate_hist_loan_date` on (loanAccountId, effectiveDate)

### Business Logic

**Rate Change Workflow:**
1. Rate change initiated (manual, restructuring, regulatory)
2. System records oldRate and newRate
3. Sets effectiveDate (usually current or future date)
4. Captures reason and changedBy
5. Updates loan_account.interestRate on effectiveDate
6. Future accruals use new rate

**Common Rate Change Reasons:**
- "Restructuring - Interest Rate Reduction"
- "Regulatory Change - RBI Rate Revision"
- "Customer Request - Rate Reset"
- "Error Correction - Data Entry Mistake"
- "Portfolio Review - Risk-Based Pricing"

**Key Rules:**
- Immutable audit trail (no updates/deletes)
- effectiveDate can be future-dated
- oldRate and newRate must be different
- changedBy records system or user who initiated change
- Used by interest accrual for rate calculation
- Maintains complete rate change history for loan lifecycle

**Integration Points:**
- Created by: interest_rate_adjustment (automatic entry)
- Created by: loan_restructuring (when rate changes)
- Read by: interest_accrual (determine applicable rate)
- Read by: regulatory_reports (rate compliance)

### Common Queries

```sql
-- Get current rate for a loan
SELECT
    newRate as currentRate,
    effectiveDate
FROM interest_rate_history
WHERE loanAccountId = 'uuid-here'
  AND effectiveDate <= CURRENT_DATE
ORDER BY effectiveDate DESC
LIMIT 1;

-- Rate change timeline for a loan
SELECT
    effectiveDate,
    oldRate,
    newRate,
    newRate - oldRate as rateChange,
    reason,
    changedBy
FROM interest_rate_history
WHERE loanAccountId = 'uuid-here'
ORDER BY effectiveDate DESC;

-- Find all rate changes in a period
SELECT
    irh.*,
    la.accountNumber
FROM interest_rate_history irh
JOIN loan_account la ON la.id = irh.loanAccountId
WHERE irh.effectiveDate BETWEEN '2026-01-01' AND '2026-01-31'
ORDER BY irh.effectiveDate DESC;

-- Calculate rate applicable for specific date
SELECT newRate
FROM interest_rate_history
WHERE loanAccountId = 'uuid-here'
  AND effectiveDate <= '2026-01-15'
ORDER BY effectiveDate DESC
LIMIT 1;

-- Rate reduction analysis
SELECT
    COUNT(*) as rateReductions,
    AVG(oldRate - newRate) as avgReduction,
    MIN(oldRate - newRate) as minReduction,
    MAX(oldRate - newRate) as maxReduction
FROM interest_rate_history
WHERE newRate < oldRate
  AND effectiveDate >= '2026-01-01';
```

### Related Tables

- **loan_account** - Parent table (current rate stored here)
- **interest_accrual** - Uses history to determine applicable rate
- **interest_rate_adjustment** - Creates rate history entries
- **restructuring_terms** - May include rate changes
- **loan_restructuring** - Business context for rate changes
