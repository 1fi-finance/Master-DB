# Recovery Proceedings

## recovery_proceeding

**Purpose:** Tracks legal recovery proceedings initiated for delinquent loans including court cases, SARFAESI actions, and arbitration. Manages the complete lifecycle from filing to recovery.

**Schema:** lmsSchema

**Table Name:** `recovery_proceeding`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random() | Unique proceeding identifier |
| loanAccountId | UUID | FK, NOT NULL | - | Reference to loan account |
| proceedingType | proceeding_type ENUM | NOT NULL | - | Type of legal proceeding |
| stage | proceeding_stage ENUM | NOT NULL | initiated | Current stage of proceeding |
| filingDate | DATE | NOT NULL | - | Date proceeding was filed |
| caseNumber | VARCHAR(100) | - | - | Court/case reference number |
| courtName | VARCHAR(255) | - | - | Court or tribunal name |
| lawyerName | VARCHAR(255) | - | - | Assigned lawyer/firm |
| legalCharges | DECIMAL(15,2) | NOT NULL | 0.00 | Legal fees and expenses |
| expectedRecoveryDate | DATE | - | - | Expected recovery date |
| actualRecoveryDate | DATE | - | - | Actual recovery date |
| recoveryAmount | DECIMAL(15,2) | NOT NULL | 0.00 | Amount actually recovered |
| status | VARCHAR(50) | NOT NULL | active | Proceeding status |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Proceeding creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | NOW() | Last update timestamp |

### Relationships

**References:**
- loan_account (loanAccountId → id)

### Indexes

- `rec_proc_loan_acc` on `loanAccountId` - Get proceedings for a loan
- `rec_proc_type` on `proceedingType` - Filter by proceeding type
- `rec_proc_stage` on `stage` - Filter by stage
- `rec_proc_status` on `status` - Filter by status
- `rec_proc_case_num` on `caseNumber` - Case number lookup

### Business Logic

**Proceeding Types:**
- `legal_notice` - Preliminary legal notice sent
- `civil_suite` - Civil lawsuit filed
- `criminal_case` - Criminal complaint (for fraud/bounce)
- `sarfaesi` - SARFAESI Act proceeding (asset seizure)
- `debt_recovery_tribunal` - DRT filing (for banks)
- `arbitration` - Arbitration proceedings

**Proceeding Stages:**

1. **initiated** - Proceeding filed, case number allocated
2. **under_review** - Under judicial/tribunal review
3. **hearing_scheduled** - Hearing date fixed
4. **judgment_awaited** - Arguments completed, awaiting judgment
5. **judgment_in_favor** - Judgment favoring lender
6. **judgment_against` - Judgment against lender
7. **settled` - Out-of-court settlement
8. **closed` - Proceeding closed (with/without recovery)

**Proceeding Lifecycle:**

```
Initiated → Under Review → Hearing Scheduled → Judgment Awaited
                                                    ↓
                                          Judgment In Favor → Recovery
                                                    ↓
                                                  Closed

Alternative paths:
- Any stage → Settled → Closed
- Judgment Against → Closed
- Initiated → Closed (withdrawn)
```

**Legal Recovery Process:**

1. **Pre-Legal (DPD 90-120 days):**
   - Send legal notice
   - proceedingType: `legal_notice`
   - stage: `initiated` → `under_review`

2. **Filing (DPD 120-180 days):**
   - File case based on loan size and type:
     - Small loans: Civil suite
     - Secured loans: SARFAESI
     - Bank loans: DRT
   - Generate caseNumber, record courtName
   - Assign lawyerName

3. **Litigation (180+ days):**
   - Track hearings and stage updates
   - Accumulate legalCharges (lawyer fees, court fees)
   - Multiple stages possible

4. **Resolution:**
   - Judgment in favor: Execute recovery
   - Settlement: Negotiate payment terms
   - Judgment against: Write-off or appeal

**Financial Tracking:**

**Legal Charges:**
- Lawyer fees (initial + per hearing)
- Court filing fees
- Administrative expenses
- Expert witness fees (if applicable)

**Recovery:**
- `recoveryAmount`: Actual amount recovered
- `actualRecoveryDate`: Date recovery received
- `expectedRecoveryDate`: Estimated based on stage/timeline

**Status Values:**
- `active` - Proceeding ongoing
- `pending` - Awaiting next action
- `suspended` - Temporarily paused
- `completed` - Proceeding concluded
- `withdrawn` - Proceeding withdrawn

**Multiple Proceedings:**
- One loan can have multiple proceedings
- Different proceeding types can be simultaneous
- Example: legal_notice → sarfaesi (if notice ineffective)

**Integration with Collection:**
- Legal activities logged in collection_activity
- Proceeding creation linked to activity with `legal_notice` outcome
- Stage changes trigger collection status updates
- Recovery amounts update loan repayment status

### Common Queries

```sql
-- Active proceedings by stage
SELECT
    rp.proceedingType,
    rp.stage,
    COUNT(*) as caseCount,
    SUM(rp.legalCharges) as totalLegalCharges,
    SUM(rp.recoveryAmount) as totalRecovered
FROM recovery_proceeding rp
WHERE rp.status = 'active'
GROUP BY rp.proceedingType, rp.stage
ORDER BY rp.proceedingType, rp.stage;

-- Proceeding details for a loan
SELECT
    rp.id,
    rp.proceedingType,
    rp.stage,
    rp.filingDate,
    rp.caseNumber,
    rp.courtName,
    rp.lawyerName,
    rp.legalCharges,
    rp.recoveryAmount,
    rp.actualRecoveryDate
FROM recovery_proceeding rp
WHERE rp.loanAccountId = 'uuid-here'
ORDER BY rp.filingDate DESC;

-- Recovery analysis
SELECT
    rp.proceedingType,
    COUNT(*) as totalCases,
    SUM(CASE WHEN rp.recoveryAmount > 0 THEN 1 ELSE 0 END) as recoveredCases,
    SUM(rp.legalCharges) as totalLegalCost,
    SUM(rp.recoveryAmount) as totalRecovery,
    ROUND(
        SUM(rp.recoveryAmount - rp.legalCharges) / NULLIF(SUM(rp.legalCharges), 0) * 100,
        2
    ) as roiPercentage
FROM recovery_proceeding rp
WHERE rp.status = 'completed'
GROUP BY rp.proceedingType;

-- Upcoming hearings (active proceedings)
SELECT
    la.accountNumber,
    rp.proceedingType,
    rp.stage,
    rp.caseNumber,
    rp.courtName,
    rp.lawyerName
FROM recovery_proceeding rp
JOIN loan_account la ON rp.loanAccountId = la.id
WHERE rp.status = 'active'
  AND rp.stage IN ('under_review', 'hearing_scheduled')
ORDER BY rp.filingDate;

-- Legal aging report
SELECT
    CASE
        WHEN rp.stage IN ('initiated', 'under_review') THEN '0-6 months'
        WHEN rp.stage = 'hearing_scheduled' THEN '6-12 months'
        WHEN rp.stage = 'judgment_awaited' THEN '1-2 years'
        ELSE '2+ years'
    END as legalAge,
    rp.proceedingType,
    COUNT(*) as caseCount,
    SUM(rp.legalCharges) as totalLegalCharges
FROM recovery_proceeding rp
WHERE rp.status = 'active'
GROUP BY legalAge, rp.proceedingType
ORDER BY legalAge, rp.proceedingType;
```

**Related Tables:**
- loan_account - Loan details and collateral
- collection_activity - Legal activities logged here
- loan_collection_status - Legal stage updates collection status
- loan_collateral - Asset for SARFAESI proceedings
- repayment - Recovery amount recorded here
