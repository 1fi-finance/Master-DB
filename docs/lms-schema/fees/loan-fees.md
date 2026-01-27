# Loan Fees

## loan_fees

**Purpose:** Junction table that applies fee_master definitions to specific loan accounts. Tracks the lifecycle of each fee from applicability through payment, including waivers. This is the operational table where fees are instantiated for actual loans, with tracking of amounts, status, and payment history.

**Schema:** lmsSchema

**Table Name:** `loan_fees`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | uuid_generate_v4() | Unique loan fee identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan_account table |
| feeId | UUID | FK, NOT NULL | - | Reference to fee_master table |
| feeAmount | DECIMAL(15,2) | NOT NULL | - | Original fee amount applied |
| waivedAmount | DECIMAL(15,2) | NOT NULL | 0.00 | Amount waived off |
| paidAmount | DECIMAL(15,2) | NOT NULL | 0.00 | Amount paid so far |
| outstandingAmount | DECIMAL(15,2) | NOT NULL | - | Remaining unpaid balance |
| applicableDate | DATE | NOT NULL | - | Date from which fee is applicable |
| dueDate | DATE | NOT NULL | - | Due date for fee payment |
| status | fee_status_enum | NOT NULL | applicable | Current fee status |
| waivedBy | VARCHAR(255) | - | - | User who approved waiver |
| waivedReason | TEXT | - | - | Reason for fee waiver |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)
- fee_master (feeId → id)

**Referenced By:**
- fee_payment (loanFeeId → id)

### Indexes

- `loan_fees_loan_acc` on loanAccountId
- `loan_fees_fee_id` on feeId
- `loan_fees_status` on status
- `loan_fees_due_date` on dueDate

### Business Logic

**Fee Status Workflow (fee_status_enum):**

1. **applicable**: Fee is applicable but not yet formally charged
   - Initial state when fee record is created
   - No accounting entry made yet
   - Can be deleted or modified

2. **applied**: Fee has been formally charged to borrower
   - Accounting entry created (debit borrower, credit fee income)
   - Now a legally enforceable due
   - Cannot be modified, only waived or paid

3. **partially_paid**: Partial payment received
   - paidAmount < (feeAmount - waivedAmount)
   - outstandingAmount tracks remaining balance
   - Multiple payments allowed via fee_payment table

4. **paid**: Full payment received
   - paidAmount = (feeAmount - waivedAmount)
   - outstandingAmount = 0
   - Final state for paid fees

5. **waived**: Fee completely waived off
   - waivedAmount = feeAmount
   - outstandingAmount = 0
   - Requires waivedBy and waivedReason
   - Accounting entry: debit waiver expense, credit borrower

6. **written_off**: Fee written off as bad debt
   - Usually after prolonged default
   - Accounting entry: debit write-off expense, credit borrower

**Amount Calculation:**
```
feeAmount = Calculated based on fee_master.calculationMethod
outstandingAmount = feeAmount - waivedAmount - paidAmount
```

**Key Business Rules:**

1. **Fee Application:**
   - Fees are auto-created based on loan lifecycle events:
     - Processing fee: At loan disbursement
     - Bounce fee: When EMI payment bounces
     - Prepayment fee: When borrower makes prepayment
     - Foreclosure fee: When loan is foreclosed

2. **Waiver Rules:**
   - Can only be done by authorized personnel (waivedBy)
   - Must provide reason (waivedReason)
   - May require approval based on amount
   - Cannot waive partially paid fees without manager approval
   - Waiver creates accounting entry

3. **Payment Rules:**
   - Partial payments allowed (except for processing fee typically)
   - Payments recorded in fee_payment table
   - paidAmount updated on each payment
   - Status transitions:
     - applicable → applied (on formal charging)
     - applied → partially_paid (on first partial payment)
     - partially_paid → paid (on full payment)
     - applied → paid (on full payment in single transaction)

4. **Due Date Management:**
   - Processing fee: Usually due within 30 days of disbursement
   - Bounce fee: Due immediately along with next EMI
   - Prepayment fee: Due at time of prepayment
   - Foreclosure fee: Due at foreclosure

**Integration Points:**

1. **With EMI Schedule:**
   - Bounce fees created when EMI bounces
   - May be collected with next EMI

2. **With Repayment:**
   - Fee payments may be part of EMI or separate
   - Receipt allocation logic needed

3. **With Account Statement:**
   - All fee transactions appear in borrower statements
   - Due dates tracked for collection follow-up

**Audit Trail:**
- createdAt records when fee was created
- waivedBy tracks waiver approver
- waivedReason provides audit justification
- fee_payment records payment history

### Common Queries

```sql
-- Get all outstanding fees for a loan
SELECT
    lf.id,
    fm.feeName,
    lf.feeAmount,
    lf.waivedAmount,
    lf.paidAmount,
    lf.outstandingAmount,
    lf.dueDate,
    lf.status
FROM loan_fees lf
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.loanAccountId = 'loan-account-uuid'
  AND lf.status IN ('applied', 'partially_paid')
ORDER BY lf.dueDate;

-- Track fee status transitions for audit
SELECT
    lf.id,
    fm.feeCode,
    fm.feeName,
    lf.status,
    lf.feeAmount,
    lf.outstandingAmount,
    lf.dueDate,
    lf.waivedBy,
    lf.waivedReason,
    lf.createdAt
FROM loan_fees lf
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.loanAccountId = 'loan-account-uuid'
ORDER BY lf.createdAt DESC;

-- Get overdue fees for collection
SELECT
    la.accountNumber,
    lf.id AS fee_id,
    fm.feeName,
    lf.outstandingAmount,
    lf.dueDate,
    CURRENT_DATE - lf.dueDate AS overdue_days,
    lf.status
FROM loan_fees lf
JOIN loan_account la ON lf.loanAccountId = la.id
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.status IN ('applied', 'partially_paid')
  AND lf.dueDate < CURRENT_DATE
  AND lf.outstandingAmount > 0
ORDER BY overdue_days DESC, lf.dueDate ASC;

-- Calculate total fees for a loan
SELECT
    fm.feeType,
    COUNT(*) AS fee_count,
    SUM(lf.feeAmount) AS total_fee_amount,
    SUM(lf.waivedAmount) AS total_waived,
    SUM(lf.paidAmount) AS total_paid,
    SUM(lf.outstandingAmount) AS total_outstanding
FROM loan_fees lf
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.loanAccountId = 'loan-account-uuid'
GROUP BY fm.feeType
ORDER BY total_outstanding DESC;

-- Fee aging report
SELECT
    fm.feeType,
    CASE
        WHEN lf.dueDate >= CURRENT_DATE THEN 'Current'
        WHEN lf.dueDate >= CURRENT_DATE - INTERVAL '30 days' THEN '0-30 days'
        WHEN lf.dueDate >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
        WHEN lf.dueDate >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
        ELSE '90+ days'
    END AS aging_bucket,
    COUNT(*) AS fee_count,
    SUM(lf.outstandingAmount) AS outstanding_amount
FROM loan_fees lf
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.status IN ('applied', 'partially_paid')
  AND lf.outstandingAmount > 0
GROUP BY fm.feeType, aging_bucket
ORDER BY fm.feeType, aging_bucket;
```

**Related Tables:**
- fee_master - Fee definitions and calculation methods
- fee_payment - Payment transactions against each fee
- loan_account - Loan account that fees are charged to
- emi_schedule - EMI schedule for bounce fee calculation
