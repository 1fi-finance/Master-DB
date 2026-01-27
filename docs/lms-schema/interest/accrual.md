# Interest Accrual

## interest_accrual

**Purpose:** Daily interest accrual calculation and tracking for loan accounts.

**Schema:** lmsSchema

**Table Name:** `interest_accrual`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique accrual record identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| accrualDate | DATE | NOT NULL | - | Date for which interest is accrued |
| principalOutstanding | DECIMAL(15,2) | NOT NULL | - | Principal balance on accrual date |
| interestRate | DECIMAL(8,4) | NOT NULL | - | Applicable interest rate (in percentage) |
| daysInPeriod | INTEGER | NOT NULL | - | Number of days in accrual period |
| accruedInterest | DECIMAL(15,2) | NOT NULL | - | Calculated interest amount |
| postedToLedger | BOOLEAN | NOT NULL | false | Whether accrual is posted to ledger |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

**Referenced By:**
- None

### Indexes

- `int_accr_loan_acc` on loanAccountId
- `int_accr_date` on accrualDate
- `int_accr_posted` on postedToLedger
- `int_accr_loan_date` on (loanAccountId, accrualDate)

### Business Logic

**Interest Accrual Formula:**
```
accruedInterest = (principalOutstanding × interestRate × daysInPeriod) / (100 × 365)
```

**Daily Accrual Process:**
1. Run daily batch job for all active loans
2. Calculate interest based on outstanding principal
3. Create accrual record with postedToLedger = false
4. Post to ledger and update postedToLedger = true
5. Update loan outstanding balance

**Key Rules:**
- One accrual record per loan per day
- Accrual uses the interest rate as of accrualDate
- postedToLedger prevents duplicate postings
- Compound interest calculated on previous unpaid accruals
- For leap years, use 366 instead of 365

**Integration Points:**
- Reads from: loan_account (principalOutstanding, interestRate)
- Updates: loan_repayment (applies payments to accrued interest)
- Creates: ledger entries for interest income

### Common Queries

```sql
-- Get unposted accruals for ledger posting
SELECT
    ia.id,
    ia.loanAccountId,
    la.accountNumber,
    ia.accrualDate,
    ia.accruedInterest
FROM interest_accrual ia
JOIN loan_account la ON la.id = ia.loanAccountId
WHERE ia.postedToLedger = false
ORDER BY ia.accrualDate;

-- Calculate total accrued interest for a loan
SELECT
    loanAccountId,
    SUM(accruedInterest) as totalAccruedInterest,
    COUNT(*) as accrualDays
FROM interest_accrual
WHERE loanAccountId = 'uuid-here'
  AND postedToLedger = true
GROUP BY loanAccountId;

-- Find accruals for specific date range
SELECT
    ia.*,
    la.accountNumber
FROM interest_accrual ia
JOIN loan_account la ON la.id = ia.loanAccountId
WHERE ia.accrualDate BETWEEN '2026-01-01' AND '2026-01-31'
  AND ia.postedToLedger = true
ORDER BY ia.accrualDate, la.accountNumber;

-- Interest rate change impact analysis
SELECT
    DATE_TRUNC('month', accrualDate) as month,
    interestRate,
    SUM(accruedInterest) as totalInterest,
    AVG(principalOutstanding) as avgOutstanding
FROM interest_accrual
WHERE loanAccountId = 'uuid-here'
GROUP BY DATE_TRUNC('month', accrualDate), interestRate
ORDER BY month;
```

### Related Tables

- **loan_account** - Parent table for loan details
- **interest_rate_history** - Rate changes affecting accruals
- **interest_rate_adjustment** - Manual rate adjustments
- **loan_repayment** - Payments against accrued interest
- **restructuring_terms** - Restructuring changes to accrual calculation
