# Loan Restructuring

## loan_restructuring

**Purpose:** Track loan restructuring requests and approvals for distressed borrowers.

**Schema:** lmsSchema

**Table Name:** `loan_restructuring`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique restructuring identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| restructuringType | VARCHAR(50) | NOT NULL | - | Type of restructuring |
| requestedDate | DATE | NOT NULL | - | Date restructuring requested |
| effectiveDate | DATE | - | - | Date restructuring becomes effective |
| approvedDate | DATE | - | - | Date restructuring approved |
| approvedBy | VARCHAR(255) | - | - | Approver name/ID |
| reason | TEXT | NOT NULL | - | Business justification for restructuring |
| status | VARCHAR(50) | NOT NULL | 'requested' | Current status |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

**Referenced By:**
- restructuring_terms (loanRestructuringId → id)

### Indexes

- `loan_restruct_loan_acc` on loanAccountId
- `loan_restruct_status` on status
- `loan_restruct_req_date` on requestedDate

### Business Logic

**Restructuring Types:**
- `tenure_extension` - Extend loan tenure to reduce EMI
- `interest_rate_reduction` - Lower interest rate
- `moratorium` - Temporary payment holiday
- `rescheduling` - Change payment schedule
- `restructuring_and_rehabilitation` - Comprehensive restructuring
- `one_time_settlement` - Settlement for less than full amount

**Status Workflow:**
```
requested → under_review → approved → implemented
                      ↓
                   rejected
                      ↓
                  cancelled
```

**Approval Process:**
1. Borrower requests restructuring with reason
2. System creates record with status = 'requested'
3. Credit team reviews request
4. Update status to 'under_review'
5. Assess restructuring feasibility
6. Approve or reject with approval details
7. If approved, create restructuring_terms record
8. Update status to 'implemented' on effectiveDate

**Key Rules:**
- One active restructuring per loan at a time
- effectiveDate typically set to next EMI date
- approvedDate and approvedBy required for approval
- Cannot modify restructuring after implementation
- Restructuring affects NPA classification
- Regulatory reporting required for restructured accounts

**Business Impact:**
- Changes EMI amount and schedule
- May extend loan tenure
- Could affect interest rate
- Impacts asset classification
- Requires provisioning adjustments

### Common Queries

```sql
-- Pending restructuring requests
SELECT
    lr.id,
    lr.loanAccountId,
    la.accountNumber,
    lr.restructuringType,
    lr.requestedDate,
    lr.status
FROM loan_restructuring lr
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE lr.status IN ('requested', 'under_review')
ORDER BY lr.requestedDate;

-- Restructuring approval timeline
SELECT
    lr.restructuringType,
    COUNT(*) as count,
    AVG(lr.approvedDate - lr.requestedDate) as avgReviewDays
FROM loan_restructuring lr
WHERE lr.status = 'approved'
  AND lr.requestedDate >= '2026-01-01'
GROUP BY lr.restructuringType;

-- Active restructured loans
SELECT
    la.accountNumber,
    lr.restructuringType,
    lr.effectiveDate,
    lr.approvedBy
FROM loan_restructuring lr
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE lr.status = 'implemented'
  AND lr.effectiveDate <= CURRENT_DATE
ORDER BY lr.effectiveDate DESC;

-- Restructuring by type
SELECT
    restructuringType,
    status,
    COUNT(*) as count
FROM loan_restructuring
WHERE requestedDate >= '2026-01-01'
GROUP BY restructuringType, status
ORDER BY restructuringType, status;

-- Find restructuring requiring approval
SELECT
    lr.*,
    la.principalAmount,
    la.currentOutstanding
FROM loan_restructuring lr
JOIN loan_account la ON la.id = lr.loanAccountId
WHERE lr.status = 'under_review'
  AND lr.requestedDate < CURRENT_DATE - INTERVAL '7 days';
```

### Related Tables

- **loan_account** - Parent loan being restructured
- **restructuring_terms** - Detailed terms of restructuring
- **interest_rate_adjustment** - Rate changes from restructuring
- **interest_rate_history** - Audit trail of rate changes
- **tenure_change** - Tenure modifications
- **loan_repayment** - Modified repayment schedule
