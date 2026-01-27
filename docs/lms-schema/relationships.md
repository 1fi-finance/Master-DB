# LMS Table Relationships

This document maps all relationships between LMS tables and their foreign key dependencies, including indexes and query optimization patterns.

## Table of Contents

- [Central Entity](#central-entity-loan_account)
- [Core Data Flows](#core-data-flows)
- [Complete Relationship Diagram](#complete-relationship-diagram)
- [Foreign Key Summary](#foreign-key-summary)
- [Index Summary by Purpose](#index-summary-by-purpose)

---

## Central Entity: loan_account

The `loan_account` table is the central entity of the LMS system. All loan lifecycle operations, from disbursement to repayment to collections, are linked to a loan account.

**Why it's central:**
- Created when loan is disbursed (moved from LOS to LMS)
- References both `loan_applications` and `loan_sanctions` from LOS
- Parent to all child tables: repayment, fees, interest, collections, modifications
- Status drives business logic across the system
- Used for financial reporting and accounting

---

## Core Data Flows

### 1. Loan Origination Flow

```
┌─────────────────┐
│   users         │
│  (customers)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│ loan_products   │─────▶│ loan_applications│
│  (LOS)          │      │       (LOS)       │
└─────────────────┘      └─────────┬────────┘
                                    │
                                    ▼
                           ┌──────────────────┐
                           │ loan_sanctions   │
                           │       (LOS)      │
                           └─────────┬────────┘
                                     │
                                     ▼
                           ┌──────────────────┐
                           │  loan_account    │
                           │      (LMS)       │◀─── Central Entity
                           └─────────┬────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
           ┌─────────────────┐              ┌─────────────────┐
           │ disbursement    │              │  emi_schedule   │
           └─────────────────┘              └─────────────────┘
```

**Flow Description:**
1. User applies for loan product → `loan_applications`
2. Application approved and sanctioned → `loan_sanctions`
3. On disbursement, loan account created → `loan_account`
4. EMI schedule generated → `emi_schedule`
5. Funds transferred → `disbursement`

**Key Foreign Keys:**
- `loan_account.loanApplicationId` → `loan_applications.id`
- `loan_account.loanSanctionId` → `loan_sanctions.id`

---

### 2. Payment & Repayment Flow

```
┌─────────────────┐
│  loan_account   │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  emi_schedule   │  │ loan_collection  │
│  (all EMIs)     │  │     _status      │
└────────┬────────┘  └────────┬─────────┘
         │                    │
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│   repayment     │  │ collection_      │
│  (payments)     │  │   activity       │
└─────────────────┘  └──────────────────┘
         │
         ▼
┌─────────────────┐
│ penalty_        │
│  calculation    │
└─────────────────┘
```

**Flow Description:**
1. `emi_schedule` created with all scheduled installments
2. Customer pays → `repayment` record created
3. `repayment.allocatedToEmiNumbers` links payment to EMIs
4. If overdue, `penalty_calculation` created
5. Collection team tracks via `loan_collection_status` and `collection_activity`

**Key Foreign Keys:**
- `emi_schedule.loanApplicationId` → `loan_applications.id`
- `repayment.emiScheduleId` → `emi_schedule.id`
- `penalty_calculation.emiScheduleId` → `emi_schedule.id`
- `loan_collection_status.loanAccountId` → `loan_account.id`
- `collection_activity.loanCollectionStatusId` → `loan_collection_status.id`

---

### 3. Collections & Recovery Flow

```
┌─────────────────┐
│  loan_account   │
└────────┬────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐  ┌──────────────────┐
│ loan_collection │  │ collection_      │
│    _status      │◀─┤    bucket        │
└────────┬────────┘  └──────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│ collection_     │  │ recovery_        │
│   activity      │  │  proceeding      │
└─────────────────┘  └──────────────────┘
```

**Flow Description:**
1. When EMI overdue, DPD calculated → `loan_collection_status`
2. Account assigned to bucket based on DPD → `collection_bucket`
3. Collection activities logged → `collection_activity`
4. if legal action needed → `recovery_proceeding`
5. NPA classification updated in `loan_collection_status.npaCategory`

**Key Foreign Keys:**
- `loan_collection_status.loanAccountId` → `loan_account.id`
- `loan_collection_status.currentBucket` → `collection_bucket.id`
- `collection_activity.loanCollectionStatusId` → `loan_collection_status.id`
- `recovery_proceeding.loanAccountId` → `loan_account.id`

---

### 4. Fees & Charges Flow

```
┌─────────────────┐
│  loan_account   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│   loan_fees     │─────▶│   fee_master     │
│ (applied fees)  │      │  (fee catalog)   │
└────────┬────────┘      └──────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  fee_payment    │  │    penalty_      │
│  (fee receipts) │  │  calculation      │
└─────────────────┘  └──────────────────┘
```

**Flow Description:**
1. Fee master catalog defines all fee types → `fee_master`
2. When fee applicable to loan → `loan_fees`
3. When customer pays fee → `fee_payment`
4. Late payment charges → `penalty_calculation`

**Key Foreign Keys:**
- `loan_fees.loanAccountId` → `loan_account.id`
- `loan_fees.feeId` → `fee_master.id`
- `fee_payment.loanFeesId` → `loan_fees.id`

---

### 5. Interest Rate Management Flow

```
┌─────────────────┐
│  loan_account   │
└────────┬────────┘
         │
         ├────────────────────┐
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌──────────────────┐
│ interest_       │  │ interest_rate_   │
│   accrual       │  │    history       │
└─────────────────┘  └──────────────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ interest_rate_   │
                    │   adjustment     │
                    └──────────────────┘
```

**Flow Description:**
1. Daily/monthly interest accrual → `interest_accrual`
2. When rate changes → `interest_rate_history`
3. If rate adjustment (restructuring) → `interest_rate_adjustment`

**Key Foreign Keys:**
- `interest_accrual.loanAccountId` → `loan_account.id`
- `interest_rate_history.loanAccountId` → `loan_account.id`
- `interest_rate_adjustment.loanAccountId` → `loan_account.id`

---

### 6. Loan Modifications Flow

```
┌─────────────────┐
│  loan_account   │
└────────┬────────┘
         │
         ├────────────────────────┐
         │           │            │
         ▼           ▼            ▼
┌──────────────┐ ┌────────────┐ ┌──────────────┐
│ loan_        │ │ interest_  │ │ tenure_      │
│ restructuring│ │  rate_     │ │   change     │
└──────────────┘ │ adjustment │ └──────────────┘
                 └────────────┘
         │
         ▼
┌──────────────────┐
│   top_up         │
│  (additional     │
│   disbursement)  │
└──────────────────┘
```

**Flow Description:**
1. Customer requests restructuring → `loan_restructuring`
2. If rate change involved → `interest_rate_adjustment`
3. If tenure change → `tenure_change`
4. If additional funds needed → `top_up`
5. Changes reflected in `loan_account` and `emi_schedule`

**Key Foreign Keys:**
- `loan_restructuring.loanAccountId` → `loan_account.id`
- `interest_rate_adjustment.loanAccountId` → `loan_account.id`
- `tenure_change.loanAccountId` → `loan_account.id`
- `top_up.loanAccountId` → `loan_account.id`

---

## Complete Relationship Diagram

```
                              ┌─────────────────────┐
                              │      users          │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  loan_products      │
                              │  (LOS)              │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │ loan_applications   │
                              │  (LOS)              │
                              └──────────┬──────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  loan_sanctions     │
                              │  (LOS)              │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────▼────────────────────┐
                    │             loan_account                │◀── CENTRAL ENTITY
                    │               (LMS)                     │
                    └────────────────────┬────────────────────┘
                                         │
         ┌───────────────┬───────────────┼───────────────┬───────────────┐
         │               │               │               │               │
         ▼               ▼               ▼               ▼               ▼
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
  │disbursement │ │emi_schedule │ │  interest   │ │   loan_     │ │ loan_       │
  │             │ │             │ │  _accrual   │ │ collection_ │ │  fees       │
  └─────────────┘ └──────┬──────┘ └─────────────┘ │  _status    │ └──────┬──────┘
                         │                         └─────────────┘        │
         ┌───────────────┼───────────────┐                │              │
         │               │               │                │              ▼
         ▼               ▼               ▼                │      ┌─────────────┐
  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │      │ fee_master  │
  │  repayment  │ │    penalty_ │ │ collection_ │        │      └─────────────┘
  │             │ │ calculation │ │   bucket    │        │              │
  └─────────────┘ └─────────────┘ └──────┬──────┘        │              ▼
                                             │             │      ┌─────────────┐
                                             ▼             │      │ fee_payment │
                                    ┌─────────────┐       │      └─────────────┘
                                    │ collection_ │       │
                                    │  activity   │       │
                                    └──────┬──────┘       │
                                           │              │
                                           ▼              ▼
                                  ┌─────────────┐  ┌─────────────┐
                                  │    recovery_│  │    loan_    │
                                  │  proceeding │  │restricturing│
                                  └─────────────┘  └──────┬──────┘
                                                         │
                     ┌───────────────────────────────────┼──────────────────┐
                     │           │           │          │                  │
                     ▼           ▼           ▼          ▼                  ▼
            ┌─────────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────┐
            │ interest_   │ │  tenure_ │ │ top_up  │ │   terms  │ │   rate_     │
            │ rate_       │ │  change  │ │         │ │ _change  │ │ adjustment  │
            │ history     │ └──────────┘ └─────────┘ └──────────┘ └─────────────┘
            └─────────────┘
```

---

## Foreign Key Summary

### LMS to LOS Cross-Module References

| Child Table | Child Schema | Parent Table | Parent Schema | Foreign Key | On Delete |
|-------------|--------------|--------------|---------------|-------------|-----------|
| loan_account | LMS | loan_applications | LOS | loanApplicationId | NO ACTION |
| loan_account | LMS | loan_sanctions | LOS | loanSanctionId | NO ACTION |
| emi_schedule | LMS | loan_applications | LOS | loanApplicationId | NO ACTION |
| emi_schedule | LMS | loan_sanctions | LOS | loanSanctionId | NO ACTION |
| disbursement | LMS | loan_applications | LOS | loanApplicationId | NO ACTION |
| disbursement | LMS | loan_sanctions | LOS | loanSanctionId | NO ACTION |
| repayment | LMS | loan_applications | LOS | loanApplicationId | NO ACTION |

### LMS Internal Relationships

#### Account-Derived Tables (Direct children of loan_account)

| Child Table | Foreign Key | Constraints | Cascade Rules |
|-------------|-------------|-------------|---------------|
| loan_collection_status | loanAccountId | NOT NULL, UNIQUE | NO ACTION |
| loan_fees | loanAccountId | NOT NULL | NO ACTION |
| interest_accrual | loanAccountId | NOT NULL | NO ACTION |
| interest_rate_history | loanAccountId | NOT NULL | NO ACTION |
| interest_rate_adjustment | loanAccountId | NOT NULL | NO ACTION |
| loan_restructuring | loanAccountId | NOT NULL | NO ACTION |
| tenure_change | loanAccountId | NOT NULL | NO ACTION |
| top_up | loanAccountId | NOT NULL | NO ACTION |
| recovery_proceeding | loanAccountId | NOT NULL | NO ACTION |

#### Collection-Derived Tables

| Child Table | Foreign Key | Constraints | Cascade Rules |
|-------------|-------------|-------------|---------------|
| collection_activity | loanCollectionStatusId | NOT NULL | NO ACTION |
| loan_collection_status | currentBucket | Nullable | NO ACTION |
| loan_collection_status | loanAccountId | NOT NULL, UNIQUE | NO ACTION |

#### Fee-Derived Tables

| Child Table | Foreign Key | Constraints | Cascade Rules |
|-------------|-------------|-------------|---------------|
| loan_fees | feeId | NOT NULL | NO ACTION |
| fee_payment | loanFeesId | NOT NULL | NO ACTION |

#### Repayment-Derived Tables

| Child Table | Foreign Key | Constraints | Cascade Rules |
|-------------|-------------|-------------|---------------|
| repayment | emiScheduleId | Nullable | NO ACTION |
| penalty_calculation | emiScheduleId | NOT NULL | NO ACTION |

### Key Relationships Explained

#### 1. loan_account → loan_collection_status (One-to-One)
- **Why UNIQUE:** Each loan account has exactly one collection status record
- **Business Rule:** Created when loan account created
- **Uses:** Tracking DPD, bucket assignment, NPA classification

#### 2. loan_collection_status → collection_activity (One-to-Many)
- **Relationship:** One status can have many activities over time
- **Business Rule:** Every collection activity logged
- **Uses:** Audit trail, collection effectiveness analysis

#### 3. loan_account → loan_fees (One-to-Many)
- **Relationship:** One loan can have multiple fees (processing, legal, etc.)
- **Business Rule:** Fees created as applicable
- **Uses:** Revenue tracking, GL posting

#### 4. loan_account → emi_schedule (via loanApplicationId)
- **Relationship:** Loan account links to EMI schedule through application
- **Business Rule:** Schedule created at account creation
- **Uses:** Repayment tracking, delinquency calculation

#### 5. emi_schedule → repayment (One-to-Many)
- **Relationship:** One EMI can have multiple partial payments
- **Business Rule:** Payments allocated to oldest due EMIs first
- **Uses:** Payment allocation, foreclosure calculation

---

## Index Summary by Purpose

### Account Lookup Indexes

**Purpose:** Fast lookup of loan account by various identifiers

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| loan_account | loan_acc_loan_app | loanApplicationId | Find account by application |
| loan_account | loan_acc_number | accountNumber | Find account by account number |
| loan_account | loan_acc_status | status | Filter accounts by status |
| loan_account | loan_acc_next_emi | nextEmiDueDate | Find EMI due accounts |

**Query Patterns:**
```sql
-- Find account by application
SELECT * FROM loan_account WHERE loanApplicationId = ?;

-- Find account by number
SELECT * FROM loan_account WHERE accountNumber = ?;

-- Find active loans
SELECT * FROM loan_account WHERE status = 'active';

-- Find EMI due today
SELECT * FROM loan_account WHERE nextEmiDueDate = CURRENT_DATE;
```

---

### Repayment Processing Indexes

**Purpose:** Optimize payment allocation and EMI tracking

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| emi_schedule | emi_loan_app | loanApplicationId | Get all EMIs for loan |
| emi_schedule | emi_due_date | dueDate | Find EMIs due on date |
| emi_schedule | emi_status | status | Filter EMIs by status |
| emi_schedule | emi_installment | loanApplicationId, installmentNumber | Find specific EMI |
| repayment | repayment_loan_app | loanApplicationId | Get all payments |
| repayment | repayment_emi | emiScheduleId | Find payments for EMI |
| repayment | repayment_txn | transactionReference | Find payment by transaction |
| repayment | repayment_date | paymentDate | Get payments by date |

**Query Patterns:**
```sql
-- Get EMI schedule for loan
SELECT * FROM emi_schedule
WHERE loanApplicationId = ?
ORDER BY installmentNumber;

-- Find EMIs due today
SELECT * FROM emi_schedule
WHERE dueDate <= CURRENT_DATE AND status IN ('scheduled', 'partially_paid');

-- Find overdue EMIs
SELECT * FROM emi_schedule
WHERE dueDate < CURRENT_DATE AND status != 'paid';

-- Get payment history
SELECT * FROM repayment
WHERE loanApplicationId = ?
ORDER BY paymentDate DESC;
```

---

### Collections Indexes

**Purpose:** Optimize collection workflow and DPD tracking

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| loan_collection_status | loan_coll_status_loan_acc | loanAccountId | Find collection status |
| loan_collection_status | loan_coll_status_bucket | currentBucket | Get accounts in bucket |
| loan_collection_status | loan_coll_status_dpd | dpdDays | Find accounts by DPD range |
| loan_collection_status | loan_coll_status_assigned | assignedTo | Get collector's accounts |
| loan_collection_status | loan_coll_status_npa | npaCategory | Filter by NPA category |
| collection_activity | coll_act_status | loanCollectionStatusId | Get activities for account |
| collection_activity | coll_act_date | activityDate | Find activities by date |
| collection_activity | coll_act_type | activityType | Filter by activity type |
| collection_activity | coll_act_assigned | assignedTo | Get collector's activities |
| collection_bucket | coll_bucket_code | bucketCode | Find bucket by code |
| collection_bucket | coll_bucket_active | isActive | Get active buckets |
| collection_bucket | coll_bucket_dpd | minDpdDays, maxDpdDays | Find bucket for DPD range |

**Query Patterns:**
```sql
-- Find accounts in specific bucket
SELECT lcs.*, la.accountNumber
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.currentBucket = ?;

-- Get delinquent accounts
SELECT lcs.*, la.accountNumber, lcs.dpdDays
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.dpdDays > 0
ORDER BY lcs.dpdDays DESC;

-- Get NPA accounts
SELECT lcs.*, la.accountNumber, lcs.npaCategory
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.npaCategory IS NOT NULL;

-- Get collector's workload
SELECT lcs.*, la.accountNumber
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.assignedTo = ?;

-- Find bucket for DPD
SELECT * FROM collection_bucket
WHERE ? >= minDpdDays AND ? <= maxDpdDays AND isActive = true;
```

---

### Fees & Charges Indexes

**Purpose:** Optimize fee tracking and payment reconciliation

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| loan_fees | loan_fees_loan_acc | loanAccountId | Get all fees for loan |
| loan_fees | loan_fees_fee_id | feeId | Find loans with specific fee |
| loan_fees | loan_fees_status | status | Filter fees by status |
| loan_fees | loan_fees_due_date | dueDate | Find fees due by date |
| fee_master | fee_master_code | feeCode | Find fee by code |
| fee_master | fee_master_type | feeType | Get fees of type |
| fee_master | fee_master_active | isActive | Get active fees |

**Query Patterns:**
```sql
-- Get outstanding fees for loan
SELECT * FROM loan_fees
WHERE loanAccountId = ? AND status IN ('applicable', 'applied', 'partially_paid');

-- Find overdue fees
SELECT * FROM loan_fees
WHERE dueDate < CURRENT_DATE AND status != 'paid';

-- Get fee details
SELECT lf.*, fm.feeName, fm.feeType
FROM loan_fees lf
JOIN fee_master fm ON lf.feeId = fm.id
WHERE lf.loanAccountId = ?;
```

---

### Interest Accrual Indexes

**Purpose:** Optimize daily interest calculation and reconciliation

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| interest_accrual | int_accr_loan_acc | loanAccountId | Get accruals for loan |
| interest_accrual | int_accr_date | accrualDate | Find accruals by date |
| interest_accrual | int_accr_posted | postedToLedger | Find unposted accruals |
| interest_accrual | int_accr_loan_date | loanAccountId, accrualDate | Find specific accrual |
| interest_rate_history | int_rate_hist_loan_acc | loanAccountId | Get rate history |
| interest_rate_history | int_rate_hist_eff_date | effectiveDate | Find rate changes by date |
| interest_rate_history | int_rate_hist_loan_date | loanAccountId, effectiveDate | Find rate on date |

**Query Patterns:**
```sql
-- Get unposted accruals
SELECT * FROM interest_accrual WHERE postedToLedger = false;

-- Get accruals for specific loan
SELECT * FROM interest_accrual
WHERE loanAccountId = ?
ORDER BY accrualDate DESC;

-- Get current interest rate
SELECT * FROM interest_rate_history
WHERE loanAccountId = ? AND effectiveDate <= CURRENT_DATE
ORDER BY effectiveDate DESC
LIMIT 1;
```

---

### Disbursement Indexes

**Purpose:** Optimize disbursement tracking and reconciliation

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| disbursement | disb_loan_app | loanApplicationId | Get disbursements for loan |
| disbursement | disb_utr | utrNumber | Find by UTR |
| disbursement | disb_status | status | Filter by status |
| disbursement | disb_date | disbursementDate | Get disbursements by date |

**Query Patterns:**
```sql
-- Get pending disbursements
SELECT * FROM disbursement WHERE status = 'pending';

-- Find disbursement by UTR
SELECT * FROM disbursement WHERE utrNumber = ?;

-- Get failed disbursements
SELECT * FROM disbursement WHERE status = 'failed';
```

---

### Recovery & Legal Indexes

**Purpose:** Optimize legal proceeding tracking

| Table | Index Name | Columns | Use Case |
|-------|------------|---------|----------|
| recovery_proceeding | rec_proc_loan_acc | loanAccountId | Get proceedings for loan |
| recovery_proceeding | rec_proc_type | proceedingType | Filter by type |
| recovery_proceeding | rec_proc_stage | stage | Filter by stage |
| recovery_proceeding | rec_proc_status | status | Filter by status |
| recovery_proceeding | rec_proc_case_num | caseNumber | Find by case number |

**Query Patterns:**
```sql
-- Get active proceedings
SELECT * FROM recovery_proceeding WHERE status = 'active';

-- Get proceedings by stage
SELECT * FROM recovery_proceeding WHERE stage = 'judgment_awaited';
```

---

### Performance Optimization Indexes

**Purpose:** Optimize complex joins and reporting queries

| Table | Index Name | Columns | Purpose |
|-------|------------|---------|---------|
| loan_account | loan_acc_status | status | Reporting by account status |
| emi_schedule | emi_status | status | Delinquency reporting |
| loan_collection_status | loan_coll_status_dpd | dpdDays | Aging analysis |
| loan_collection_status | loan_coll_status_npa | npaCategory | NPA reporting |
| interest_accrual | int_accr_posted | postedToLedger | GL reconciliation |
| loan_fees | loan_fees_status | status | Fee aging reports |

**Common Reporting Queries:**
```sql
-- Portfolio aging report
SELECT
    dpdDays,
    COUNT(*) as count,
    SUM(totalOverdueAmount) as totalOverdue
FROM loan_collection_status
GROUP BY dpdDays;

-- NPA report
SELECT
    npaCategory,
    COUNT(*) as count,
    SUM(totalOverdueAmount) as totalExposure,
    SUM(provisioningAmount) as totalProvision
FROM loan_collection_status
WHERE npaCategory IS NOT NULL
GROUP BY npaCategory;

-- Collection efficiency
SELECT
    ca.activityType,
    ca.outcome,
    COUNT(*) as count
FROM collection_activity ca
WHERE ca.activityDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ca.activityType, ca.outcome;
```

---

## Query Optimization Guidelines

### 1. Always Use Indexed Columns in WHERE Clauses

```sql
-- GOOD - Uses index
SELECT * FROM loan_account WHERE accountNumber = 'LN001234';

-- AVOID - Function on indexed column
SELECT * FROM loan_account WHERE LOWER(accountNumber) = 'ln001234';
```

### 2. Use Composite Indexes for Multi-Column Queries

```sql
-- GOOD - Uses composite index
SELECT * FROM emi_schedule
WHERE loanApplicationId = ? AND installmentNumber = ?;

-- GOOD - Uses composite index
SELECT * FROM interest_accrual
WHERE loanAccountId = ? AND accrualDate = ?;
```

### 3. Use Covering Indexes for Frequent Queries

```sql
-- All columns in SELECT are in index
SELECT loanApplicationId, installmentNumber, dueDate, status
FROM emi_schedule
WHERE loanApplicationId = ?;
```

### 4. Be Careful with OR Conditions

```sql
-- May not use index efficiently
SELECT * FROM loan_account
WHERE status = 'active' OR nextEmiDueDate = CURRENT_DATE;

-- Better to use UNION
SELECT * FROM loan_account WHERE status = 'active'
UNION
SELECT * FROM loan_account WHERE nextEmiDueDate = CURRENT_DATE;
```

### 5. Use EXPLAIN ANALYZE for Complex Queries

```sql
EXPLAIN ANALYZE
SELECT la.*, lcs.dpdDays, lcs.npaCategory
FROM loan_account la
JOIN loan_collection_status lcs ON la.id = lcs.loanAccountId
WHERE la.status = 'active' AND lcs.dpdDays > 30;
```

---

## Data Integrity Rules

### 1. Cascade Behavior
- Most foreign keys use `NO ACTION` (no cascading deletes)
- Business logic must handle deletions explicitly
- Loans are never deleted, only status-changed to closed

### 2. Required Relationships
- `loan_account` MUST reference both `loan_applications` and `loan_sanctions`
- `emi_schedule` MUST reference both `loan_applications` and `loan_sanctions`
- `loan_collection_status.loanAccountId` is UNIQUE (one-to-one)

### 3. Nullable Relationships
- `repayment.emiScheduleId` can be NULL (foreclosure payments may not map to EMI)
- `loan_collection_status.currentBucket` can be NULL (not yet assigned)
- `loan_collection_status.npaCategory` can be NULL (standard assets)

### 4. Circular References Avoided
- No circular foreign key dependencies
- All relationships form hierarchical trees

---

## References

- **LMS Schema Documentation:** `docs/lms-schema/`
- **LOS Schema Documentation:** `docs/los-schema/`
- **Enum Documentation:** `docs/lms-schema/enums.md`
- **Database Definitions:** `src/db/schema/definitions.ts`
- **Schema Files:** `src/db/schema/lms/**/*.ts`
