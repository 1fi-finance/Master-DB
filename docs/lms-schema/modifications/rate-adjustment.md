# Interest Rate Adjustment

## interest_rate_adjustment

**Purpose:** Record interest rate adjustments for loan accounts with approval workflow.

**Schema:** lmsSchema

**Table Name:** `interest_rate_adjustment`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique adjustment identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| effectiveFrom | DATE | NOT NULL | - | Date adjustment becomes effective |
| previousRate | DECIMAL(8,4) | NOT NULL | - | Interest rate before adjustment |
| newRate | DECIMAL(8,4) | NOT NULL | - | Adjusted interest rate |
| adjustmentReason | VARCHAR(50) | NOT NULL | - | Reason code for adjustment |
| approvedBy | VARCHAR(255) | - | - | Approver name/ID |
| approvedAt | TIMESTAMP | - | - | Approval timestamp |
| linkedToRestructuring | BOOLEAN | NOT NULL | false | Part of restructuring |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

**Referenced By:**
- None

### Indexes

- `int_rate_adj_loan_acc` on loanAccountId
- `int_rate_adj_eff` on effectiveFrom
- `int_rate_adj_restruct` on linkedToRestructuring

### Business Logic

**Adjustment Reasons:**
- `rate_revision` - General rate revision (policy change)
- `restructuring` - Part of loan restructuring
- `regulatory_change` - Regulatory mandate
- `customer_request` - Customer negotiation
- `error_correction` - Fix incorrect rate

**Adjustment Workflow:**
1. Rate adjustment initiated
2. Record created with previousRate and newRate
3. Set effectiveFrom date (current or future)
4. Adjustment reason captured
5. Approval process (if required)
6. On approval, create interest_rate_history entry
7. Update loan_account.interestRate on effectiveFrom
8. Future accruals use new rate

**Approval Rules:**
- Rate increases: Always require approval
- Rate decreases: May auto-approve based on threshold
- Restructuring-linked: Follow restructuring approval
- Error corrections: May require supervisor approval
- Regulatory changes: Auto-approve with documentation

**Key Rules:**
- Only one unapproved adjustment per loan at a time
- effectiveFrom cannot be in the past (for new adjustments)
- previousRate must match current loan_account.interestRate
- linkedToRestructuring true = part of restructuring package
- Cannot adjust rate for closed/defaulted loans
- Creates automatic entry in interest_rate_history

**Rate Change Impact:**
- Recalculates EMI for remaining tenure
- Updates repayment schedule
- Affects future interest accruals
- May require customer notification
- Regulatory reporting for significant changes

### Common Queries

```sql
-- Pending rate adjustments awaiting approval
SELECT
    ira.id,
    ira.loanAccountId,
    la.accountNumber,
    ira.previousRate,
    ira.newRate,
    ira.newRate - ira.previousRate as rateChange,
    ira.adjustmentReason,
    ira.effectiveFrom
FROM interest_rate_adjustment ira
JOIN loan_account la ON la.id = ira.loanAccountId
WHERE ira.approvedAt IS NULL
  AND ira.effectiveFrom > CURRENT_DATE
ORDER BY ira.effectiveFrom;

-- Rate adjustments by reason
SELECT
    adjustmentReason,
    COUNT(*) as adjustments,
    AVG(newRate - previousRate) as avgChange,
    linkedToRestructuring
FROM interest_rate_adjustment
WHERE createdAt >= '2026-01-01'
GROUP BY adjustmentReason, linkedToRestructuring;

-- Recent approved rate adjustments
SELECT
    ira.*,
    la.accountNumber
FROM interest_rate_adjustment ira
JOIN loan_account la ON la.id = ira.loanAccountId
WHERE ira.approvedAt IS NOT NULL
  AND ira.effectiveFrom >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY ira.effectiveFrom DESC;

-- Find rate cuts vs hikes
SELECT
    CASE
        WHEN newRate < previousRate THEN 'Rate Cut'
        WHEN newRate > previousRate THEN 'Rate Hike'
        ELSE 'No Change'
    END as changeType,
    COUNT(*) as count,
    AVG(ABS(newRate - previousRate)) as avgChangeBps
FROM interest_rate_adjustment
WHERE approvedAt IS NOT NULL
  AND effectiveFrom >= '2026-01-01'
GROUP BY changeType;

-- Restructuring-linked rate adjustments
SELECT
    ira.*,
    la.accountNumber,
    lr.restructuringType
FROM interest_rate_adjustment ira
JOIN loan_account la ON la.id = ira.loanAccountId
LEFT JOIN loan_restructuring lr ON lr.loanAccountId = la.id
  AND lr.status = 'implemented'
WHERE ira.linkedToRestructuring = true
  AND ira.approvedAt IS NOT NULL
ORDER BY ira.effectiveFrom DESC;
```

### Related Tables

- **loan_account** - Parent loan account
- **interest_rate_history** - Audit trail created from adjustments
- **loan_restructuring** - Restructuring requiring rate changes
- **restructuring_terms** - Detailed restructuring terms
- **interest_accrual** - Uses adjusted rate for calculations
- **loan_repayment** - Recalculated EMI based on new rate
