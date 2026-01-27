# Penalty Calculation

## penalty_calculation

**Purpose:** Tracks penalty charges calculated on overdue EMI payments. Records penalty amounts, overdue days, and waiver details for each EMI installment. Supports automated penalty calculation workflows and manual waiver management for collection purposes.

**Schema:** lmsSchema

**Table Name:** `penalty_calculation`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | uuid_generate_v4() | Unique penalty identifier |
| emiScheduleId | UUID | FK, NOT NULL | - | Reference to emi_schedule table |
| overdueDays | INTEGER | NOT NULL | - | Number of days EMI is overdue |
| penaltyAmount | DECIMAL(15,2) | NOT NULL | - | Calculated penalty amount |
| calculatedDate | DATE | NOT NULL | - | Date penalty was calculated |
| waived | BOOLEAN | NOT NULL | false | Whether penalty has been waived |
| waivedBy | VARCHAR(255) | - | - | User who approved waiver |
| waivedReason | TEXT | - | - | Reason for penalty waiver |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Record creation timestamp |

### Relationships

**References:**
- emi_schedule (emiScheduleId → id)

### Indexes

- `penalty_emi_sched` on emiScheduleId
- `penalty_calc_date` on calculatedDate
- `penalty_waived` on waived

### Business Logic

**Penalty Calculation Methods:**

1. **Fixed Per Day:**
   - Example: ₹100 per day of delay
   - Formula: penaltyAmount = overdueDays × daily_rate

2. **Percentage of EMI:**
   - Example: 2% of EMI amount per month or part thereof
   - Formula: penaltyAmount = (emiAmount × penalty_rate / 100) × months_overdue

3. **Tiered Penalty:**
   - Example:
     - 1-30 days: No penalty
     - 31-60 days: 1% of EMI
     - 61-90 days: 2% of EMI
     - 90+ days: 3% of EMI

4. **Regulatory Caps:**
   - Many jurisdictions cap penalty at maximum percentage
   - Example: Maximum penalty = 2% of EMI amount
   - Application logic must enforce caps

**Calculation Trigger:**

1. **Daily Calculation Job:**
   - Runs daily to calculate penalty on overdue EMIs
   - Checks emi_schedule.status = 'overdue'
   - Calculates overdueDays = CURRENT_DATE - dueDate

2. **Calculation Logic:**
   ```
   overdueDays = CURRENT_DATE - emi_schedule.dueDate
   penaltyAmount = calculatePenalty(emi_schedule.totalEmiAmount, overdueDays)
   ```

3. **Create/Update Record:**
   - If no penalty exists for EMI: Create new record
   - If penalty exists: May update penaltyAmount (if allowed)
   - calculatedDate = CURRENT_DATE

**Penalty Workflow:**

1. **Initial Calculation:**
   - When EMI becomes overdue
   - Penalty calculated for first time
   - waived = false (default)

2. **Daily Updates:**
   - Penalty recalculated daily (or weekly)
   - overdueDays increases
   - penaltyAmount may increase based on rules

3. **Cap Enforcement:**
   - Maximum penalty checked
   - Once cap reached, penaltyAmount stops increasing
   - System should track when cap was reached

4. **Payment Collection:**
   - Penalty collected along with EMI
   - Or collected separately in next cycle
   - Payment recorded in repayment table
   - Penalty status updated in emi_schedule (latePaymentCharges field)

5. **Waiver Process:**
   - Authorized user can waive penalty
   - Set waived = true
   - Provide waivedBy and waivedReason
   - Accounting entry: debit waiver expense, credit borrower

**Waiver Rules:**

1. **Authorization:**
   - Only authorized roles can waive
   - Manager approval needed above certain amount
   - waivedBy tracks approver identity

2. **Waiver Reasons:**
   - Bank error (technical issue, system downtime)
   - Genuine hardship (medical emergency, job loss)
   - First-time waiver policy
   - Goodwill (long-term customer)
   - Settlement/negotiation

3. **Partial Waiver:**
   - Not directly supported in schema
   - Application logic can create adjustment record
   - Or create separate waiver transaction

4. **Audit:**
   - All waivers must have waivedReason
   - Regulatory reporting may be required
   - Internal audit trail maintained

**Integration Points:**

1. **With EMI Schedule:**
   - References overdue EMI
   - Penalty amount may be stored in emi_schedule.latePaymentCharges
   - Payment reduces penalty balance

2. **With Account Statement:**
   - Penalty charges shown in statements
   - Waivers shown as credits
   - Due dates for penalty payment

3. **With Collection:**
   - Collection agents see penalty amount
   - Penalty negotiable during recovery
   - May be waived as part of settlement

4. **With Accounting:**
   - Debit: Borrower's account
   - Credit: Penalty income account
   - Waiver: Debit waiver expense, credit borrower

**Regulatory Compliance:**

1. **Transparency:**
   - Penalty rates must be disclosed in loan agreement
   - Calculation method must be transparent
   - Borrower must receive penalty details

2. **Fair Practice:**
   - Penalty rates must be reasonable
   - Cannot exceed regulatory caps
   - Waiver policy must be documented

3. **Reporting:**
   - Penalty income reported separately
   - Waiver amounts disclosed
   - Overdue categories tracked

### Common Queries

```sql
-- Get all pending penalties for a loan
SELECT
    pc.id,
    es.installmentNumber,
    es.dueDate AS emi_due_date,
    es.totalEmiAmount,
    pc.overdueDays,
    pc.penaltyAmount,
    pc.calculatedDate,
    pc.waived
FROM penalty_calculation pc
JOIN emi_schedule es ON pc.emiScheduleId = es.id
JOIN loan_account la ON es.loanApplicationId = la.loanApplicationId
WHERE la.id = 'loan-account-uuid'
  AND pc.waived = false
  AND es.status IN ('overdue', 'partially_paid')
ORDER BY es.dueDate;

-- Daily penalty calculation report
SELECT
    pc.calculatedDate,
    COUNT(*) AS penalty_count,
    SUM(pc.penaltyAmount) AS total_penalty,
    AVG(pc.overdueDays) AS avg_overdue_days,
    SUM(CASE WHEN pc.waived THEN 1 ELSE 0 END) AS waived_count
FROM penalty_calculation pc
WHERE pc.calculatedDate = CURRENT_DATE
GROUP BY pc.calculatedDate;

-- Penalty aging by overdue days
SELECT
    CASE
        WHEN pc.overdueDays <= 30 THEN '0-30 days'
        WHEN pc.overdueDays <= 60 THEN '31-60 days'
        WHEN pc.overdueDays <= 90 THEN '61-90 days'
        ELSE '90+ days'
    END AS aging_bucket,
    COUNT(*) AS penalty_count,
    SUM(pc.penaltyAmount) AS total_penalty_amount
FROM penalty_calculation pc
WHERE pc.waived = false
GROUP BY aging_bucket
ORDER BY MIN(pc.overdueDays);

-- Get penalties eligible for waiver (bank error cases)
SELECT
    pc.id,
    la.accountNumber,
    es.installmentNumber,
    es.totalEmiAmount,
    pc.overdueDays,
    pc.penaltyAmount,
    pc.calculatedDate,
    es.dueDate
FROM penalty_calculation pc
JOIN emi_schedule es ON pc.emiScheduleId = es.id
JOIN loan_account la ON es.loanApplicationId = la.loanApplicationId
WHERE pc.waived = false
  AND pc.overdueDays <= 5  -- Recent delays, potential bank issues
ORDER BY pc.calculatedDate DESC;

-- Penalty waiver audit report
SELECT
    pc.calculatedDate,
    pc.waivedBy,
    COUNT(*) AS waiver_count,
    SUM(pc.penaltyAmount) AS total_waived_amount,
    pc.waivedReason
FROM penalty_calculation pc
WHERE pc.waived = true
  AND pc.calculatedDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pc.calculatedDate, pc.waivedBy, pc.waivedReason
ORDER BY pc.calculatedDate DESC, total_waived_amount DESC;

-- Penalty collection by EMI
SELECT
    es.installmentNumber,
    es.totalEmiAmount AS emi_amount,
    pc.penaltyAmount,
    es.latePaymentCharges AS penalty_paid,
    pc.waived,
    pc.overdueDays,
    CASE
        WHEN pc.waived THEN 'Waived'
        WHEN es.latePaymentCharges >= pc.penaltyAmount THEN 'Fully Paid'
        WHEN es.latePaymentCharges > 0 THEN 'Partially Paid'
        ELSE 'Pending'
    END AS penalty_status
FROM penalty_calculation pc
JOIN emi_schedule es ON pc.emiScheduleId = es.id
WHERE es.loanApplicationId = 'loan-application-uuid'
ORDER BY es.installmentNumber;

-- Calculate penalty income for the month
SELECT
    DATE_TRUNC('month', pc.calculatedDate) AS month,
    COUNT(*) AS penalty_count,
    SUM(pc.penaltyAmount) AS total_penalty_calculated,
    SUM(CASE WHEN pc.waived THEN pc.penaltyAmount ELSE 0 END) AS total_waived,
    SUM(CASE WHEN NOT pc.waived THEN pc.penaltyAmount ELSE 0 END) AS net_penalty
FROM penalty_calculation pc
WHERE pc.calculatedDate >= DATE_TRUNC('year', CURRENT_DATE)
GROUP BY DATE_TRUNC('month', pc.calculatedDate)
ORDER BY month DESC;
```

**Related Tables:**
- emi_schedule - EMI installment being penalized
- loan_account - Loan account for which penalty is calculated
- repayment - Payment transactions including penalty collection
- fee_master - May define penalty fee structure (if configured as fee)
