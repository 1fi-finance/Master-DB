# Tenure Change

## tenure_change

**Purpose:** Record tenure modifications for loan accounts with EMI impact calculation.

**Schema:** lmsSchema

**Table Name:** `tenure_change`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique tenure change identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| oldTenureMonths | INTEGER | NOT NULL | - | Original tenure in months |
| newTenureMonths | INTEGER | NOT NULL | - | Modified tenure in months |
| effectiveDate | DATE | NOT NULL | - | Date change becomes effective |
| reason | TEXT | NOT NULL | - | Business justification |
| impactOnEmi | DECIMAL(15,2) | NOT NULL | - | EMI amount change |
| approvedBy | VARCHAR(255) | - | - | Approver name/ID |
| approvedAt | TIMESTAMP | - | - | Approval timestamp |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

**Referenced By:**
- None

### Indexes

- `tenure_change_loan_acc` on loanAccountId
- `tenure_change_eff` on effectiveDate

### Business Logic

**Tenure Change Types:**

1. **Tenure Extension:**
   - newTenureMonths > oldTenureMonths
   - Reduces EMI amount
   - Increases total interest paid
   - Reason: "Customer request - affordability"
   - Common for distressed borrowers

2. **Tenure Reduction:**
   - newTenureMonths < oldTenureMonths
   - Increases EMI amount
   - Reduces total interest paid
   - Reason: "Prepayment / Early closure"
   - Requires affordability check

**EMI Impact Calculation:**
```
impactOnEmi = newEmi - oldEmi

For extension (impactOnEmi < 0):
  newEmi = calculateEmi(outstanding, rate, newTenure)
  impactOnEmi = -abs(oldEmi - newEmi)

For reduction (impactOnEmi > 0):
  newEmi = calculateEmi(outstanding, rate, newTenure)
  impactOnEmi = abs(newEmi - oldEmi)
```

**Common Reasons:**
- "Customer request - EMI reduction"
- "Customer request - Early repayment"
- "Affordability issue - Income reduction"
- "Interest rate reset - Tenure realignment"
- "Regulatory requirement - Compliance"
- "Error correction - Data entry mistake"

**Approval Rules:**
- Extensions: Usually auto-approved within limits
- Reductions: Require customer confirmation
- Beyond threshold: Manager approval required
- Significant changes: Credit committee approval
- Linked to restructuring: Follow restructuring flow

**Key Rules:**
- Cannot extend beyond maximum tenure limit
- Cannot reduce below minimum EMI threshold
- effectiveDate typically next EMI date
- impactOnEmi can be positive or negative
- Updates loan_account.tenureMonths
- Recalculates remaining EMI schedule
- May affect NPA classification
- Creates loan_repayment schedule updates

**Business Impact:**
- Changes monthly cash flow for customer
- Affects total interest income
- May require customer notification
- Updates loan maturity date
- Could affect LTV ratios over time

### Common Queries

```sql
-- Recent tenure changes
SELECT
    tc.id,
    tc.loanAccountId,
    la.accountNumber,
    tc.oldTenureMonths,
    tc.newTenureMonths,
    tc.newTenureMonths - tc.oldTenureMonths as tenureChange,
    tc.impactOnEmi,
    tc.reason,
    tc.effectiveDate
FROM tenure_change tc
JOIN loan_account la ON la.id = tc.loanAccountId
WHERE tc.approvedAt IS NOT NULL
ORDER BY tc.effectiveDate DESC
LIMIT 20;

-- Tenure extensions vs reductions
SELECT
    CASE
        WHEN newTenureMonths > oldTenureMonths THEN 'Extension'
        WHEN newTenureMonths < oldTenureMonths THEN 'Reduction'
        ELSE 'No Change'
    END as changeType,
    COUNT(*) as count,
    AVG(ABS(newTenureMonths - oldTenureMonths)) as avgMonthsChange,
    AVG(ABS(impactOnEmi)) as avgEmiImpact
FROM tenure_change
WHERE approvedAt IS NOT NULL
  AND effectiveDate >= '2026-01-01'
GROUP BY changeType;

-- EMI reduction analysis
SELECT
    la.accountNumber,
    tc.oldTenureMonths,
    tc.newTenureMonths,
    tc.impactOnEmi,
    ROUND(
        (ABS(tc.impactOnEmi) /
         (la.principalAmount / la.tenureMonths)) * 100, 2
    ) as emiReductionPercentage,
    tc.reason,
    tc.effectiveDate
FROM tenure_change tc
JOIN loan_account la ON la.id = tc.loanAccountId
WHERE tc.impactOnEmi < 0
  AND tc.approvedAt IS NOT NULL
ORDER BY ABS(tc.impactOnEmi) DESC;

-- Pending tenure changes
SELECT
    tc.*,
    la.accountNumber,
    la.tenureMonths as currentTenure
FROM tenure_change tc
JOIN loan_account la ON la.id = tc.loanAccountId
WHERE tc.approvedAt IS NULL
  AND tc.effectiveDate > CURRENT_DATE
ORDER BY tc.effectiveDate;

-- Tenure change by reason
SELECT
    reason,
    COUNT(*) as count,
    AVG(ABS(newTenureMonths - oldTenureMonths)) as avgMonthsChanged,
    SUM(CASE WHEN newTenureMonths > oldTenureMonths THEN 1 ELSE 0 END) as extensions,
    SUM(CASE WHEN newTenureMonths < oldTenureMonths THEN 1 ELSE 0 END) as reductions
FROM tenure_change
WHERE approvedAt IS NOT NULL
  AND effectiveDate >= '2026-01-01'
GROUP BY reason
ORDER BY count DESC;

-- Find loans eligible for tenure extension
SELECT
    la.id,
    la.accountNumber,
    la.tenureMonths,
    la.currentOutstanding,
    la.interestRate,
    (la.currentOutstanding / la.tenureMonths) as currentEmi,
    (la.currentOutstanding / (la.tenureMonths + 12)) as potentialEmi
FROM loan_account la
WHERE la.status = 'active'
  AND la.tenureMonths < 60  -- Max tenure 60 months
  AND la.loanStartDate > CURRENT_DATE - INTERVAL '6 months'
ORDER BY la.currentOutstanding DESC;
```

### Related Tables

- **loan_account** - Parent loan account
- **loan_repayment** - Updated EMI schedule
- **interest_accrual** - Uses new tenure for calculations
- **loan_restructuring** - May include tenure changes
- **restructuring_terms** - Detailed restructuring terms
- **interest_rate_history** - If rate also changed
