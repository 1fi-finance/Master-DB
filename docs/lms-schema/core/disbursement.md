# Disbursement

## disbursement

**Purpose:** Tracks loan disbursement transactions from lender to borrower bank account. Records the complete disbursement lifecycle from initiation to completion, including bank details and transaction references.

**Schema:** lmsSchema

**Table Name:** `disbursement`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique disbursement identifier |
| loanApplicationId | UUID | FK, NOT NULL | - | Reference to loan application |
| loanSanctionId | UUID | FK, NOT NULL | - | Reference to loan sanction |
| disbursementAmount | DECIMAL(15,2) | NOT NULL | - | Amount being disbursed |
| disbursementDate | TIMESTAMP | NOT NULL | NOW() | Disbursement initiation date |
| status | disbursement_status | NOT NULL | 'pending' | Disbursement status (pending, initiated, completed, failed, reversed) |
| beneficiaryAccountNumber | VARCHAR(50) | NOT NULL | - | Beneficiary bank account number |
| beneficiaryIfsc | VARCHAR(20) | NOT NULL | - | Beneficiary IFSC code |
| beneficiaryName | VARCHAR(255) | NOT NULL | - | Beneficiary account holder name |
| bankName | VARCHAR(255) | NOT NULL | - | Beneficiary bank name |
| utrNumber | VARCHAR(100) | - | - | UTR (Unique Transaction Reference) from bank |
| transactionReference | VARCHAR(100) | - | - | Internal transaction reference |
| paymentGatewayReference | VARCHAR(100) | - | - | Payment gateway transaction ID |
| initiatedAt | TIMESTAMP | - | - | Disbursement initiation timestamp |
| completedAt | TIMESTAMP | - | - | Disbursement completion timestamp |
| failureReason | TEXT | - | - | Failure reason if status = 'failed' |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_applications (loanApplicationId → id)
- loan_sanction (loanSanctionId → id)

**Referenced By:**
- None (leaf table)

### Indexes

- `disb_loan_app` on loanApplicationId (fetch disbursements for a loan)
- `disb_utr` on utrNumber (UTR-based reconciliation)
- `disb_status` on status (filter by disbursement status)
- `disb_date` on disbursementDate (date-based reports)

### Business Logic

**Disbursement Status States:**
```
pending → initiated → completed (successful flow)
pending → initiated → failed (failed flow)
completed → reversed (reversal in case of errors)
```

**Status Definitions:**
- `pending` - Disbursement request created, not yet sent to bank/gateway
- `initiated` - Disbursement sent to bank/gateway, awaiting confirmation
- `completed` - Amount successfully credited to beneficiary account
- `failed` - Disbursement failed (bank error, invalid account, etc.)
- `reversed` - Completed disbursement reversed back to lender

**Bank Account Validation:**
```
1. Validate account number format (numeric, length check)
2. Validate IFSC code format (11 characters, 4th char is 'O')
3. Verify IFSC exists in bank IFSC master
4. Account name match (if available from bank API)
```

**Disbursement Flow:**
```
1. Loan sanctioned → Create disbursement record (status: pending)
2. Validate beneficiary details
3. Initiate disbursement via payment gateway (status: initiated)
4. Receive callback from gateway:
   - Success: Update status = 'completed', set completedAt, utrNumber
   - Failure: Update status = 'failed', set failureReason
5. On completion: Create loan_account record
```

**Beneficiary Details:**
- Typically fetched from loan_application KYC documents
- Must match verified bank details from KYC
- Used for both disbursement and repayment (same account)

**Transaction References:**
- `transactionReference` - Internal system reference (e.g., "DISB-2024-001")
- `utrNumber` - Bank UTR from NEFT/RTGS/IMPS (mandatory for reconciliation)
- `paymentGatewayReference` - Gateway transaction ID (e.g., Razorpay payout ID)

**Partial Disbursements:**
- Some loans may have multiple disbursements (tranche-based)
- Each disbursement is a separate record
- Total disbursed = SUM of all completed disbursements for loan

**Reconciliation:**
```
Daily reconciliation process:
1. Fetch disbursements with status = 'initiated' > 24 hours
2. Check with gateway/bank using transactionReference
3. Update status based on response
4. Alert on stuck transactions
```

**Failure Handling:**
Common failure reasons:
- Invalid account number
- Account closed/frozen
- IFSC mismatch
- Insufficient funds in lender account
- Bank server downtime
- Transaction timeout

On failure:
1. Update failureReason with details
2. Alert operations team
3. May require re-initiation with corrected details

### Common Queries

```sql
-- Get disbursement details for a loan
SELECT
    d.disbursementAmount,
    d.disbursementDate,
    d.status,
    d.beneficiaryName,
    d.bankName,
    d.beneficiaryAccountNumber,
    d.beneficiaryIfsc,
    d.utrNumber,
    d.transactionReference,
    d.initiatedAt,
    d.completedAt
FROM disbursement d
WHERE d.loanApplicationId = 'uuid-here'
ORDER BY d.disbursementDate DESC;

-- Daily disbursement report
SELECT
    DATE(disbursementDate) as disb_date,
    status,
    COUNT(*) as count,
    SUM(disbursementAmount) as total_amount
FROM disbursement
WHERE DATE(disbursementDate) = CURRENT_DATE
GROUP BY DATE(disbursementDate), status
ORDER BY disb_date, status;

-- Pending disbursements (not initiated)
SELECT
    id,
    loanApplicationId,
    disbursementAmount,
    beneficiaryAccountNumber,
    beneficiaryIfsc,
    bankName,
    createdAt
FROM disbursement
WHERE status = 'pending'
ORDER BY createdAt;

-- Stuck disbursements (initiated > 2 hours ago, not completed)
SELECT
    id,
    loanApplicationId,
    disbursementAmount,
    transactionReference,
    initiatedAt,
    CURRENT_TIMESTAMP - initiatedAt as stuck_duration
FROM disbursement
WHERE status = 'initiated'
  AND initiatedAt < CURRENT_TIMESTAMP - INTERVAL '2 hours'
ORDER BY initiatedAt;

-- Failed disbursements analysis
SELECT
    DATE(disbursementDate) as failure_date,
    bankName,
    failureReason,
    COUNT(*) as failure_count,
    SUM(disbursementAmount) as total_failed_amount
FROM disbursement
WHERE status = 'failed'
  AND disbursementDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(disbursementDate), bankName, failureReason
ORDER BY failure_date DESC, failure_count DESC;

-- Disbursement success rate by bank
SELECT
    bankName,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'failed') as failed,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE status = 'completed') /
        NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'failed')), 0),
        2
    ) as success_rate_pct
FROM disbursement
WHERE disbursementDate >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY bankName
ORDER BY success_rate_pct DESC;

-- Reconcile disbursements with UTR
SELECT
    d.id,
    d.loanApplicationId,
    d.disbursementAmount,
    d.transactionReference,
    d.utrNumber,
    d.paymentGatewayReference,
    d.status,
    d.initiatedAt,
    d.completedAt
FROM disbursement d
WHERE d.utrNumber IS NOT NULL
  AND d.status IN ('initiated', 'completed')
  AND d.disbursementDate >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY d.disbursementDate DESC;
```

**Related Tables:**
- loan_applications - Application and borrower details
- loan_sanction - Sanctioned amount and terms
- loan_account - Created after successful disbursement
- bank_account_master - Bank and branch details (if available)
