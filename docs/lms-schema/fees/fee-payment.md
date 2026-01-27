# Fee Payment

## fee_payment

**Purpose:** Transaction ledger for all fee payments made against loan fees. Tracks each payment instance with payment mode, transaction references, and banking details. This table maintains the complete payment history for fees, supporting reconciliation and audit trails.

**Schema:** lmsSchema

**Table Name:** `fee_payment`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | uuid_generate_v4() | Unique payment identifier |
| loanFeeId | UUID | FK, NOT NULL | - | Reference to loan_fees table |
| paymentAmount | DECIMAL(15,2) | NOT NULL | - | Amount paid in this transaction |
| paymentDate | DATE | NOT NULL | - | Date of payment |
| paymentMode | VARCHAR(50) | NOT NULL | - | Payment method (cash, upi, neft, rtgs, ims, cheque, card, net_banking, etc.) |
| transactionReference | VARCHAR(100) | - | - | Bank or payment gateway reference number |
| utrNumber | VARCHAR(100) | - | - | Unique Transaction Reference (UTR) for NEFT/RTGS/UPI |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_fees (loanFeeId → id)

### Indexes

- `fee_pay_loan_fee` on loanFeeId
- `fee_pay_date` on paymentDate
- `fee_pay_utr` on utrNumber

### Business Logic

**Payment Modes:**
- **cash**: Physical cash payment
- **upi**: UPI payment (GPay, PhonePe, Paytm, etc.)
- **neft**: National Electronic Funds Transfer
- **rtgs**: Real Time Gross Settlement
- **ims**: Immediate Payment Service (IMPS)
- **cheque**: Cheque payment
- **card**: Debit/credit card payment
- **net_banking**: Online banking transfer
- **wallet**: Digital wallet payment
- **demand_draft**: Demand draft payment

**Transaction Reference Types:**

1. **UPI Transactions:**
   - UTR is mandatory for UPI payments
   - 12-character alphanumeric UTR
   - Format: 123456789012
   - Can verify payment status using UTR

2. **NEFT/RTGS/IMPS:**
   - UTR or transaction reference required
   - NEFT UTR: 16 characters
   - RTGS reference: varies by bank
   - IMPS transaction ID: 12 digits

3. **Card Payments:**
   - Transaction reference from payment gateway
   - Last 4 digits of card (stored separately if needed)
   - Authorization code

4. **Cheque Payments:**
   - Transaction reference = cheque number
   - Bank name and branch (stored in reference if needed)
   - Cheque date tracked in paymentDate

**Payment Processing Flow:**

1. **Payment Initiation:**
   - Borrower initiates payment through any mode
   - System generates payment record with amount and mode

2. **Payment Confirmation:**
   - For online payments: Callback from payment gateway
   - For offline payments: Manual entry by staff
   - UTR/transaction reference recorded

3. **Payment Application:**
   - System updates loan_fees.paidAmount
   - loan_fees.outstandingAmount reduced
   - loan_fees.status updated:
     - applied → partially_paid (if partial payment)
     - partially_paid → paid (if completes payment)
     - applied → paid (if full payment in one transaction)

4. **Reconciliation:**
   - Daily reconciliation with bank statements
   - UTR-based matching for electronic transfers
   - Outstanding payment tracking for pending transactions

**Reconciliation Rules:**

1. **UTR Matching:**
   - Unique UTR per payment
   - Prevents duplicate payments using UTR index
   - Enables bank statement reconciliation

2. **Payment Date vs Value Date:**
   - paymentDate = date payment received
   - For cheques: paymentDate = deposit date, not clearance date
   - For electronic: paymentDate = transfer date

3. **Partial Payments:**
   - Multiple fee_payment records can reference same loanFeeId
   - Sum of paymentAmount should match paidAmount in loan_fees
   - Payment order: FIFO (first payment applied first)

**Audit Trail:**
- createdAt records when payment was recorded in system
- Complete payment history maintained for audit
- Transaction references enable bank reconciliation

**Integration Points:**

1. **With Payment Gateway:**
   - Real-time payment processing
   - Webhook callbacks for payment confirmation
   - Transaction reference from gateway

2. **With Accounting System:**
   - Debit: Cash/Bank account
   - Credit: Borrower's account (loan_fees)
   - Payment date determines accounting period

3. **With Collections:**
   - Collection agents update payment details
   - Receipt generation
   - Payment confirmation sent to borrower

**Business Rules:**

1. **Payment Validation:**
   - paymentAmount cannot exceed outstandingAmount in loan_fees
   - paymentDate cannot be future dated
   - UTR should be unique across all payments

2. **Payment Reversal:**
   - If payment bounces: create negative payment record
   - Update loan_fees.paidAmount
   - Restore loan_fees.outstandingAmount
   - Mark reason in transactionReference

3. **Receipt Generation:**
   - Unique receipt number generated (application logic)
   - Links to fee_payment.id
   - Sent to borrower via SMS/email

### Common Queries

```sql
-- Get payment history for a specific fee
SELECT
    fp.id,
    fp.paymentAmount,
    fp.paymentDate,
    fp.paymentMode,
    fp.transactionReference,
    fp.utrNumber,
    fp.createdAt AS recorded_at
FROM fee_payment fp
WHERE fp.loanFeeId = 'loan-fee-uuid'
ORDER BY fp.paymentDate DESC, fp.createdAt DESC;

-- Reconcile daily payments
SELECT
    fp.paymentDate,
    fp.paymentMode,
    COUNT(*) AS transaction_count,
    SUM(fp.paymentAmount) AS total_amount
FROM fee_payment fp
WHERE fp.paymentDate = CURRENT_DATE
GROUP BY fp.paymentDate, fp.paymentMode
ORDER BY total_amount DESC;

-- Track pending UTR reconciliation
SELECT
    fp.id,
    lf.loanAccountId,
    fm.feeName,
    fp.paymentAmount,
    fp.paymentDate,
    fp.utrNumber,
    fp.transactionReference
FROM fee_payment fp
JOIN loan_fees lf ON fp.loanFeeId = lf.id
JOIN fee_master fm ON lf.feeId = fm.id
WHERE fp.utrNumber IS NOT NULL
  AND fp.paymentDate >= CURRENT_DATE - INTERVAL '7 days'
  AND NOT reconciled  -- Assuming application tracks reconciliation status
ORDER BY fp.paymentDate DESC;

-- Find duplicate payments by UTR
SELECT
    utrNumber,
    COUNT(*) AS duplicate_count,
    STRING_AGG(id::TEXT, ', ') AS payment_ids,
    SUM(paymentAmount) AS total_duplicate_amount
FROM fee_payment
WHERE utrNumber IS NOT NULL
GROUP BY utrNumber
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Payment mode analysis for fees
SELECT
    fp.paymentMode,
    COUNT(*) AS payment_count,
    SUM(fp.paymentAmount) AS total_collected,
    AVG(fp.paymentAmount) AS avg_payment_amount
FROM fee_payment fp
JOIN loan_fees lf ON fp.loanFeeId = lf.id
WHERE fp.paymentDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fp.paymentMode
ORDER BY total_collected DESC;

-- Get fee collection report by date
SELECT
    fp.paymentDate,
    fm.feeType,
    COUNT(*) AS payment_count,
    SUM(fp.paymentAmount) AS total_collected
FROM fee_payment fp
JOIN loan_fees lf ON fp.loanFeeId = lf.id
JOIN fee_master fm ON lf.feeId = fm.id
WHERE fp.paymentDate BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY fp.paymentDate, fm.feeType
ORDER BY fp.paymentDate, total_collected DESC;

-- Reconcile bank statement UTRs
SELECT
    fp.utrNumber,
    fp.paymentAmount,
    fp.paymentDate,
    la.accountNumber,
    fm.feeName,
    fp.transactionReference
FROM fee_payment fp
JOIN loan_fees lf ON fp.loanFeeId = lf.id
JOIN loan_account la ON lf.loanAccountId = la.id
JOIN fee_master fm ON lf.feeId = fm.id
WHERE fp.utrNumber IN ('utr1', 'utr2', 'utr3')  -- Bank statement UTRs
ORDER BY fp.paymentDate;
```

**Related Tables:**
- loan_fees - Fee being paid
- loan_account - Loan account for which fee is collected
- fee_master - Fee type definition
- repayment - May have combined EMI + fee payments
