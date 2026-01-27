# Repayment Module

## emi_schedule

**Purpose:** Complete repayment schedule for each loan, generated at the time of loan disbursement. Contains all scheduled EMIs with principal/interest breakdown and tracking of payment status.

**Schema:** lmsSchema

**Table Name:** `emi_schedule`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique EMI schedule identifier |
| loanApplicationId | UUID | FK, NOT NULL | - | Reference to loan application |
| loanSanctionId | UUID | FK, NOT NULL | - | Reference to loan sanction |
| installmentNumber | INTEGER | NOT NULL | - | Sequential EMI number (1, 2, 3...) |
| dueDate | DATE | NOT NULL | - | EMI due date |
| principalAmount | DECIMAL(15,2) | NOT NULL | - | Principal component for this EMI |
| interestAmount | DECIMAL(15,2) | NOT NULL | - | Interest component for this EMI |
| totalEmiAmount | DECIMAL(15,2) | NOT NULL | - | Total EMI amount (principal + interest) |
| openingPrincipal | DECIMAL(15,2) | NOT NULL | - | Outstanding principal at start of period |
| closingPrincipal | DECIMAL(15,2) | NOT NULL | - | Outstanding principal after this EMI |
| status | emi_status | NOT NULL | 'scheduled' | Payment status (scheduled, paid, partially_paid, overdue, waived) |
| paidDate | TIMESTAMP | - | - | Actual payment date |
| paidAmount | DECIMAL(15,2) | - | - | Actual amount paid (for partial payments) |
| overdueDays | INTEGER | NOT NULL | 0 | Days past due date |
| latePaymentCharges | DECIMAL(15,2) | NOT NULL | 0.00 | Late fees applied |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_applications (loanApplicationId → id)
- loan_sanction (loanSanctionId → id)

**Referenced By:**
- repayment (emiScheduleId → id) - Links payment to specific EMI

### Indexes

- `emi_loan_app` on loanApplicationId (fetch all EMIs for a loan)
- `emi_due_date` on dueDate (for EMI collection reports)
- `emi_status` on status (filter by payment status)
- `emi_installment` on (loanApplicationId, installmentNumber) - Composite index for specific EMI lookup

### Business Logic

**EMI Status Transitions:**
```
scheduled → paid (full payment received)
scheduled → partially_paid (partial payment received)
scheduled → overdue (due date passed without payment)
partially_paid → paid (remaining amount received)
overdue → paid (late payment received)
any → waived (waived by system/admin)
```

**EMI Calculation (Reducing Balance Method):**
```javascript
// For each EMI:
EMI = P * R * (1+R)^N / [(1+R)^N - 1]

Where:
P = Principal amount
R = Monthly interest rate (annualRate/12/100)
N = Tenure in months

Interest component = Outstanding principal * R
Principal component = EMI - Interest component
Closing principal = Opening principal - Principal component
```

**Overdue Calculation:**
```
overdueDays = CURRENT_DATE - dueDate (when status = overdue)
```

**Late Payment Charges:**
- Applied when EMI is paid after due date
- May be fixed amount or percentage of EMI
- Added to totalEmiAmount for collection

**Schedule Generation:**
- Generated at loan creation/disbursement
- Total records = tenureMonths
- All EMIs created with status = 'scheduled'
- dueDate calculated from loanStartDate (e.g., 5th of each month)

**Payment Allocation:**
- When payment received, matched to overdue EMIs first (FIFO)
- Partial payments update status to 'partially_paid'
- paidAmount tracks actual received amount
- Multiple payments may be needed for one EMI

### Common Queries

```sql
-- Get all upcoming EMIs for a loan
SELECT
    installmentNumber,
    dueDate,
    totalEmiAmount,
    principalAmount,
    interestAmount,
    status,
    overdueDays
FROM emi_schedule
WHERE loanApplicationId = 'uuid-here'
ORDER BY installmentNumber;

-- Get overdue EMIs report
SELECT
    es.loanApplicationId,
    la.accountNumber,
    es.installmentNumber,
    es.dueDate,
    es.totalEmiAmount,
    es.latePaymentCharges,
    CURRENT_DATE - es.dueDate as days_overdue
FROM emi_schedule es
JOIN loan_account la ON es.loanApplicationId = la.loanApplicationId
WHERE es.status = 'overdue'
  AND la.status = 'active'
ORDER BY es.dueDate;

-- Get EMI payment history for a loan
SELECT
    installmentNumber,
    dueDate,
    totalEmiAmount,
    status,
    paidDate,
    paidAmount,
    overdueDays,
    latePaymentCharges
FROM emi_schedule
WHERE loanApplicationId = 'uuid-here'
  AND status IN ('paid', 'partially_paid')
ORDER BY installmentNumber;

-- Calculate next 3 months EMI collection forecast
SELECT
    DATE_TRUNC('month', dueDate) as month,
    COUNT(*) as emi_count,
    SUM(totalEmiAmount) as total_collection
FROM emi_schedule es
JOIN loan_account la ON es.loanApplicationId = la.loanApplicationId
WHERE es.status IN ('scheduled', 'partially_paid', 'overdue')
  AND es.dueDate BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '3 months'
  AND la.status = 'active'
GROUP BY DATE_TRUNC('month', dueDate)
ORDER BY month;

-- Check EMI delinquency bucketing
SELECT
    loanApplicationId,
    accountNumber,
    COUNT(*) FILTER (WHERE overdueDays BETWEEN 1 AND 30) as dpd_1_30,
    COUNT(*) FILTER (WHERE overdueDays BETWEEN 31 AND 60) as dpd_31_60,
    COUNT(*) FILTER (WHERE overdueDays BETWEEN 61 AND 90) as dpd_61_90,
    COUNT(*) FILTER (WHERE overdueDays > 90) as dpd_90_plus
FROM emi_schedule es
JOIN loan_account la ON es.loanApplicationId = la.loanApplicationId
WHERE es.status IN ('overdue', 'partially_paid')
GROUP BY loanApplicationId, accountNumber;
```

---

## repayment

**Purpose:** Records actual payment transactions received from borrowers, including payment breakdown into principal, interest, and charges. Tracks payment mode and gateway response.

**Schema:** lmsSchema

**Table Name:** `repayment`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Unique repayment identifier |
| loanApplicationId | UUID | FK, NOT NULL | - | Reference to loan application |
| emiScheduleId | UUID | FK | - | Specific EMI being paid (optional for partial allocation) |
| paymentAmount | DECIMAL(15,2) | NOT NULL | - | Total payment amount received |
| paymentDate | TIMESTAMP | NOT NULL | NOW() | Payment timestamp |
| paymentMode | VARCHAR(50) | NOT NULL | - | Payment mode (UPI, bank_transfer, card, cash, etc.) |
| principalComponent | DECIMAL(15,2) | NOT NULL | - | Amount allocated to principal |
| interestComponent | DECIMAL(15,2) | NOT NULL | - | Amount allocated to interest |
| latePaymentCharges | DECIMAL(15,2) | NOT NULL | 0.00 | Late fees collected |
| transactionReference | VARCHAR(100) | NOT NULL | - | Unique transaction reference |
| utrNumber | VARCHAR(100) | - | - | UTR/transaction ID for bank payments |
| paymentGatewayResponse | JSONB | - | - | Raw gateway response data |
| allocatedToEmiNumbers | VARCHAR(500) | - | - | Comma-separated EMI numbers allocated (e.g., "1,2,3") |
| foreclosurePayment | BOOLEAN | NOT NULL | false | Is this a foreclosure/full payment |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- loan_applications (loanApplicationId → id)
- emi_schedule (emiScheduleId → id)

**Referenced By:**
- None (leaf table)

### Indexes

- `repayment_loan_app` on loanApplicationId (payment history for a loan)
- `repayment_emi` on emiScheduleId (payments for specific EMI)
- `repayment_txn` on transactionReference (transaction lookup)
- `repayment_date` on paymentDate (date-based reports)

### Business Logic

**Payment Allocation Logic:**
```
1. Payment received for loan_account
2. Check overdue EMIs first (FIFO - oldest first)
3. Allocate to overdue EMIs until payment exhausted
4. If no overdue, allocate to next scheduled EMI
5. Update emi_schedule.status:
   - paid → if full amount received
   - partially_paid → if partial amount received
6. Reduce loan_account.currentOutstanding
7. Update loan_account.nextEmiDueDate
```

**Payment Breakdown Calculation:**
```
For normal EMI payment:
- principalComponent = EMI's principal component
- interestComponent = EMI's interest component + any overdue interest
- latePaymentCharges = Applicable late fees

For partial payment:
- Proportionally split between principal and interest
- Prioritize interest component first
```

**Foreclosure Payment:**
```
foreclosurePayment = true indicates:
- Full outstanding principal + accrued interest
- Prepayment charges may apply
- Closes the loan account
- Updates all remaining EMIs to 'paid' or 'waived'
```

**Transaction Reference:**
- Must be unique across all payments
- Generated by payment gateway or system
- Used for reconciliation and refunds

**Payment Gateway Response:**
```json
{
  "gateway": "razorpay",
  "status": "captured",
  "method": "upi",
  "bank": "HDFC",
  "wallet": "",
  "vpa": "customer@upi",
  "email": "customer@email.com",
  "contact": "9876543210"
}
```

**Payment Modes:**
- UPI (unified payments interface)
- bank_transfer (NEFT, RTGS, IMPS)
- debit_card
- credit_card
- net_banking
- cash (branch collection)
- cheque
- wallet (Paytm, PhonePe, etc.)

### Common Queries

```sql
-- Get payment history for a loan
SELECT
    paymentDate,
    paymentAmount,
    paymentMode,
    principalComponent,
    interestComponent,
    latePaymentCharges,
    transactionReference,
    foreclosurePayment
FROM repayment
WHERE loanApplicationId = 'uuid-here'
ORDER BY paymentDate DESC;

-- Daily collection report
SELECT
    DATE(paymentDate) as collection_date,
    paymentMode,
    COUNT(*) as transaction_count,
    SUM(paymentAmount) as total_collected,
    SUM(principalComponent) as total_principal,
    SUM(interestComponent) as total_interest
FROM repayment
WHERE DATE(paymentDate) = CURRENT_DATE
GROUP BY DATE(paymentDate), paymentMode
ORDER BY total_collected DESC;

-- Get unreconciled payments (without UTR)
SELECT
    id,
    paymentAmount,
    paymentDate,
    paymentMode,
    transactionReference
FROM repayment
WHERE utrNumber IS NULL
  AND paymentMode IN ('bank_transfer', 'upi')
ORDER BY paymentDate DESC;

-- Foreclosure payments analysis
SELECT
    r.paymentDate,
    r.paymentAmount,
    la.accountNumber,
    la.interestRate,
    r.paymentAmount - la.currentOutstanding as excess_paid
FROM repayment r
JOIN loan_account la ON r.loanApplicationId = la.loanApplicationId
WHERE r.foreclosurePayment = true
ORDER BY r.paymentDate DESC;

-- Payment reconciliation with gateway
SELECT
    paymentDate,
    paymentAmount,
    paymentMode,
    transactionReference,
    utrNumber,
    paymentGatewayResponse->>'status' as gateway_status
FROM repayment
WHERE paymentDate >= CURRENT_DATE - INTERVAL '7 days'
  AND paymentMode = 'upi'
ORDER BY paymentDate DESC;
```

**Related Tables:**
- loan_account - Outstanding updated after payment allocation
- emi_schedule - Status updated when payment is allocated
- loan_applications - Borrower payment history
- fee_payment - Related fee payments (bounce charges, etc.)
