# Restructuring Terms

## restructuring_terms

**Purpose:** Detailed terms and conditions for loan restructuring, including all changes to loan parameters.

**Schema:** lmsSchema

**Table Name:** `restructuring_terms`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique terms identifier |
| loanRestructuringId | UUID | FK, NOT NULL | - | Reference to loan_restructuring |
| oldTenure | INTEGER | NOT NULL | - | Original tenure in months |
| newTenure | INTEGER | NOT NULL | - | Restructured tenure in months |
| oldInterestRate | DECIMAL(8,4) | NOT NULL | - | Original interest rate |
| newInterestRate | DECIMAL(8,4) | NOT NULL | - | Restructured interest rate |
| oldEmiAmount | DECIMAL(15,2) | NOT NULL | - | Original EMI amount |
| newEmiAmount | DECIMAL(15,2) | NOT NULL | - | Restructured EMI amount |
| moratoriumPeriod | INTEGER | NOT NULL | 0 | Moratorium period in months |
| moratoriumReason | TEXT | - | - | Reason for moratorium |
| restructuringCharges | DECIMAL(15,2) | NOT NULL | 0.00 | Fees for restructuring |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_restructuring (loanRestructuringId → id)

**Referenced By:**
- None

### Indexes

- None (accessed through loan_restructuring)

### Business Logic

**Restructuring Components:**

1. **Tenure Extension:**
   - oldTenure < newTenure
   - Reduces EMI amount
   - Increases total interest paid
   - Spreads repayment over longer period

2. **Interest Rate Reduction:**
   - oldInterestRate > newInterestRate
   - Reduces EMI or total interest
   - May require regulatory approval
   - Affects profitability

3. **EMI Recalculation:**
   ```
   newEmiAmount = f(principalOutstanding, newInterestRate, newTenure)
   ```
   - Uses remaining principal
   - Based on new rate and tenure
   - Rounded to currency precision

4. **Moratorium:**
   - Temporary payment holiday
   - No EMI during moratoriumPeriod
   - Interest continues to accrue
   - Added to outstanding principal

5. **Restructuring Charges:**
   - Processing fee for restructuring
   - Percentage of outstanding principal
   - Can be waived or capitalized
   - Affects cost of restructuring

**Business Rules:**
- One terms record per restructuring
- oldTenure and newTenure must be different
- oldEmiAmount < newEmiAmount possible in some cases
- moratoriumPeriod can be zero (no moratorium)
- restructuringCharges typically 0.5% to 2% of principal
- All terms must be internally consistent
- Cannot have zero or negative values

**Impact Analysis:**
```
Total Interest Before = (oldEmiAmount × remainingEmis) - outstandingPrincipal
Total Interest After = (newEmiAmount × newRemainingEmis) - outstandingPrincipal
Interest Savings = Total Interest Before - Total Interest After
```

**Integration Points:**
- Created by: loan_restructuring approval
- Updates: loan_repayment schedule
- Creates: interest_rate_history entries
- Modifies: loan_account terms
- Affects: NPA classification

### Common Queries

```sql
-- Get restructuring terms for a loan
SELECT
    rt.*,
    lr.restructuringType,
    lr.effectiveDate,
    la.accountNumber
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE lr.loanAccountId = 'uuid-here'
ORDER BY lr.effectiveDate DESC;

-- EMI reduction analysis
SELECT
    la.accountNumber,
    rt.oldEmiAmount,
    rt.newEmiAmount,
    rt.oldEmiAmount - rt.newEmiAmount as emiReduction,
    ((rt.oldEmiAmount - rt.newEmiAmount) / rt.oldEmiAmount) * 100 as reductionPercentage,
    lr.restructuringType
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE lr.status = 'implemented'
ORDER BY emiReduction DESC;

-- Interest rate reduction from restructuring
SELECT
    rt.oldInterestRate,
    rt.newInterestRate,
    rt.oldInterestRate - rt.newInterestRate as rateReduction,
    lr.restructuringType
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
WHERE lr.status = 'implemented'
  AND rt.oldInterestRate > rt.newInterestRate;

-- Tenure extensions
SELECT
    la.accountNumber,
    rt.oldTenure,
    rt.newTenure,
    rt.newTenure - rt.oldTenure as extensionMonths,
    lr.approvedDate
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE rt.newTenure > rt.oldTenure
  AND lr.status = 'implemented'
ORDER BY extensionMonths DESC;

-- Moratorium analysis
SELECT
    lr.restructuringType,
    COUNT(*) as count,
    AVG(rt.moratoriumPeriod) as avgMoratoriumMonths,
    MAX(rt.moratoriumPeriod) as maxMoratoriumMonths
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
WHERE rt.moratoriumPeriod > 0
  AND lr.status = 'implemented'
GROUP BY lr.restructuringType;

-- Calculate restructuring charges collected
SELECT
    SUM(restructuringCharges) as totalCharges,
    AVG(restructuringCharges) as avgCharges,
    COUNT(*) as count
FROM restructuring_terms rt
JOIN loan_restructuring lr ON lr.id = rt.loanRestructuringId
WHERE lr.status = 'implemented'
  AND lr.createdAt >= '2026-01-01';
```

### Related Tables

- **loan_restructuring** - Parent restructuring record
- **loan_account** - Original loan terms
- **interest_rate_adjustment** - Rate changes implemented
- **tenure_change** - If restructuring includes tenure change
- **loan_repayment** - Updated repayment schedule
- **interest_rate_history** - Audit trail of changes
