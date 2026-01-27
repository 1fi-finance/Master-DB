# Collection Status

## loan_collection_status

**Purpose:** Tracks the collection status of each loan account including DPD, bucket assignment, overdue amounts, NPA classification, and collection agent assignment.

**Schema:** lmsSchema

**Table Name:** `loan_collection_status`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random() | Unique collection status identifier |
| loanAccountId | UUID | FK, UNIQUE, NOT NULL | - | Reference to loan account |
| currentBucket | UUID | FK | - | Current collection bucket reference |
| dpdDays | INTEGER | NOT NULL | 0 | Days past due (DPD) |
| lastPaymentDate | DATE | - | - | Last payment received date |
| totalOverdueAmount | DECIMAL(15,2) | NOT NULL | 0.00 | Total overdue amount |
| principalOverdue | DECIMAL(15,2) | NOT NULL | 0.00 | Overdue principal amount |
| interestOverdue | DECIMAL(15,2) | NOT NULL | 0.00 | Overdue interest amount |
| feeOverdue | DECIMAL(15,2) | NOT NULL | 0.00 | Overdue fee amount |
| npaDate | DATE | - | - | Date when loan became NPA |
| npaCategory | npa_category ENUM | - | - | NPA classification category |
| provisioningAmount | DECIMAL(15,2) | NOT NULL | 0.00 | Calculated provisioning amount |
| assignedTo | VARCHAR(255) | - | - | Collection agent/user assigned |
| assignedDate | DATE | - | - | Assignment date |
| lastFollowUpDate | DATE | - | - | Last collection follow-up date |
| nextFollowUpDate | DATE | - | - | Next scheduled follow-up date |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)
- collection_bucket (currentBucket → id)

**Referenced By:**
- collection_activity (loanCollectionStatusId → id)

### Indexes

- `loan_coll_status_loan_acc` on `loanAccountId` - Fast loan account lookup
- `loan_coll_status_bucket` on `currentBucket` - Filter by bucket
- `loan_coll_status_dpd` on `dpdDays` - DPD-based queries
- `loan_coll_status_assigned` on `assignedTo` - Agent workload queries
- `loan_coll_status_npa` on `npaCategory` - NPA classification queries

### Business Logic

**DPD Calculation:**
```
DPD = Current Date - Last Payment Due Date
- dpdDays = 0: Current (no overdue)
- dpdDays > 0: Delinquent
```

**Overdue Calculation:**
```
totalOverdueAmount = principalOverdue + interestOverdue + feeOverdue
```
Components:
- principalOverdue: Unpaid principal installments
- interestOverdue: Accrued but unpaid interest
- feeOverdue: Unpaid penalties and charges

**Bucket Assignment:**
- Automatically assigned based on dpdDays
- currentBucket = bucket where `minDpdDays <= dpdDays <= maxDpdDays`
- Triggered by scheduled job (typically daily)

**NPA Classification:**
- **NPA Trigger:** Loan becomes NPA when DPD >= 90 days
- **npaDate:** Set when loan first crosses NPA threshold
- **npaCategory:**
  - `standard`: DPD < 90 days (performing asset)
  - `sub_standard`: DPD 90-179 days
  - `doubtful_1`: DPD 180-365 days (first year)
  - `doubtful_2`: DPD 1-2 years (second year)
  - `doubtful_3`: DPD 2-3 years (third year)
  - `loss`: DPD > 3 years or unrecoverable

**Provisioning Calculation:**
```
provisioningAmount = totalOverdueAmount × bucket.provisioningPercentage / 100
```
Updated when bucket changes or overdue amounts change

**Collection Agent Assignment:**
- assignedTo: Agent ID or username
- assignedDate: When agent was assigned
- One-to-many: One agent handles multiple loans
- Round-robin or workload-based assignment

**Follow-up Management:**
- lastFollowUpDate: Tracks recent collection activity
- nextFollowUpDate: Scheduled follow-up (based on bucket strategy)
- Escalation if nextFollowUpDate missed

**State Transitions:**
1. **Current** → **Delinquent:** When payment missed (DPD > 0)
2. **Delinquent** → **NPA:** When DPD >= 90 days
3. **NPA Upgrade:** Annually if remains delinquent
4. **Recovery:** Reset to current on full payment

**Update Triggers:**
- dpdDays: Updated daily by scheduled job
- currentBucket: Recalculated when dpdDays changes
- overdue amounts: Updated on payment posting
- provisioningAmount: Recalculated on bucket change
- npaCategory: Updated based on aging

### Common Queries

```sql
-- Get delinquent loans by bucket
SELECT
    la.accountNumber,
    lcs.dpdDays,
    cb.bucketName,
    lcs.totalOverdueAmount,
    lcs.assignedTo
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
JOIN collection_bucket cb ON lcs.currentBucket = cb.id
WHERE lcs.dpdDays > 0
ORDER BY lcs.dpdDays DESC;

-- Get NPA loans with classification
SELECT
    la.accountNumber,
    lcs.npaCategory,
    lcs.npaDate,
    lcs.dpdDays,
    lcs.totalOverdueAmount,
    lcs.provisioningAmount
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.npaCategory IS NOT NULL
ORDER BY lcs.npaDate DESC;

-- Agent workload query
SELECT
    lcs.assignedTo,
    COUNT(*) as totalAccounts,
    SUM(lcs.totalOverdueAmount) as totalOverdue,
    AVG(lcs.dpdDays) as avgDpd
FROM loan_collection_status lcs
WHERE lcs.assignedTo IS NOT NULL
GROUP BY lcs.assignedTo
ORDER BY totalOverdue DESC;

-- Overdue aging report
SELECT
    CASE
        WHEN dpdDays = 0 THEN 'Current'
        WHEN dpdDays <= 30 THEN '1-30 Days'
        WHEN dpdDays <= 60 THEN '31-60 Days'
        WHEN dpdDays <= 90 THEN '61-90 Days'
        WHEN dpdDays <= 180 THEN '91-180 Days'
        ELSE '180+ Days'
    END as agingBucket,
    COUNT(*) as accountCount,
    SUM(totalOverdueAmount) as totalOverdue
FROM loan_collection_status
GROUP BY agingBucket
ORDER BY MIN(dpdDays);
```

**Related Tables:**
- collection_bucket - DPD bucket definitions
- collection_activity - Collection interaction history
- loan_account - Loan account details
- recovery_proceeding - Legal proceedings for严重 delinquency
- repayment_history - Payment records for DPD calculation
