# Collection Activity

## collection_activity

**Purpose:** Logs all collection interactions with borrowers including calls, visits, messages, and legal actions. Maintains complete audit trail of collection efforts and outcomes.

**Schema:** lmsSchema

**Table Name:** `collection_activity`

### Fields

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random() | Unique activity identifier |
| loanCollectionStatusId | UUID | FK, NOT NULL | - | Reference to collection status |
| activityType | collection_activity_type ENUM | NOT NULL | - | Type of collection activity |
| activityDate | DATE | NOT NULL | - | When activity occurred |
| notes | TEXT | - | - | Activity notes and details |
| outcome | collection_outcome ENUM | - | - | Result of collection activity |
| nextActionDate | DATE | - | - | Next scheduled follow-up |
| assignedTo | VARCHAR(255) | NOT NULL | - | Agent who performed activity |
| createdAt | TIMESTAMP | NOT NULL | NOW() | Activity log timestamp |

### Relationships

**References:**
- loan_collection_status (loanCollectionStatusId → id)

### Indexes

- `coll_act_status` on `loanCollectionStatusId` - Get activity history for a loan
- `coll_act_date` on `activityDate` - Date-based activity queries
- `coll_act_type` on `activityType` - Filter by activity type
- `coll_act_assigned` on `assignedTo` - Agent performance queries

### Business Logic

**Activity Types:**
- `call` - Phone call to borrower
- `visit` - Physical field visit
- `email` - Email communication
- `sms` - SMS/text message
- `whatsapp` - WhatsApp message
- `legal_notice` - Legal notice sent
- `court_filing` - Court case filed
- `other` - Other collection activities

**Activity Outcomes:**
- `promised_to_pay` - Borrower committed to payment date
- `paid` - Payment made during/after interaction
- `refused_to_pay` - Borrower refused payment
- `wrong_number` - Contact details invalid
- `not_reachable` - Unable to contact
- `payment_arrangement` - Restructuring/agreed payment plan
- `legal_action_initiated` - Escalated to legal

**Collection Workflow:**

1. **Early Collection (0-30 DPD):**
   - Activities: SMS, WhatsApp, Email
   - Frequency: Every 3-5 days
   - Goal: Gentle reminders

2. **Intensive Collection (31-60 DPD):**
   - Activities: Calls, SMS
   - Frequency: Every 2-3 days
   - Goal: Understand reasons, negotiate

3. **Escalation (61-90 DPD):**
   - Activities: Calls, Visits
   - Frequency: Daily/alternate days
   - Goal: Strong persuasion, payment arrangements

4. **Legal Recovery (90+ DPD):**
   - Activities: Legal notice, Court filing
   - Frequency: As per legal process
   - Goal: Legal enforcement

**Follow-up Scheduling:**
- `nextActionDate` set based on outcome:
  - `promised_to_pay`: Promise date + 1 day
  - `payment_arrangement`: Next installment due date
  - `not_reachable`: Retry in 2-3 days
  - `refused_to_pay`: Escalate, retry in 5-7 days

**Activity Logging Requirements:**
- `notes` should include:
  - Call: Summary of conversation, borrower responses
  - Visit: Location, person met, observations
  - Messages: Template used, key points
  - Legal: Notice details, case references
- `assignedTo` is mandatory for accountability
- `activityDate` can be backdated for manual entries

**Performance Tracking:**
Activities used to measure:
- Agent productivity (activities per day)
- Success rate (promised_to_pay / total calls)
- Contact rate (reachable / total attempts)
- Conversion rate (paid / promised_to_pay)

**Integration with Collection Status:**
- Updates `lastFollowUpDate` in loan_collection_status
- Sets `nextFollowUpDate` if `nextActionDate` provided
- Outcomes trigger bucket reassignment if applicable

### Common Queries

```sql
-- Get collection history for a loan
SELECT
    ca.activityType,
    ca.activityDate,
    ca.outcome,
    ca.notes,
    ca.assignedTo,
    ca.nextActionDate
FROM collection_activity ca
WHERE ca.loanCollectionStatusId = 'uuid-here'
ORDER BY ca.activityDate DESC, ca.createdAt DESC;

-- Agent performance dashboard
SELECT
    ca.assignedTo,
    COUNT(*) as totalActivities,
    SUM(CASE WHEN ca.activityType = 'call' THEN 1 ELSE 0 END) as calls,
    SUM(CASE WHEN ca.outcome = 'promised_to_pay' THEN 1 ELSE 0 END) as promises,
    SUM(CASE WHEN ca.outcome = 'paid' THEN 1 ELSE 0 END) as payments,
    SUM(CASE WHEN ca.outcome = 'not_reachable' THEN 1 ELSE 0 END) as unreachable
FROM collection_activity ca
WHERE ca.activityDate >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ca.assignedTo
ORDER BY totalActivities DESC;

-- Overdue accounts requiring follow-up today
SELECT
    lcs.loanAccountId,
    la.accountNumber,
    lcs.nextFollowUpDate,
    lcs.dpdDays,
    lcs.totalOverdueAmount
FROM loan_collection_status lcs
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE lcs.nextFollowUpDate = CURRENT_DATE
ORDER BY lcs.dpdDays DESC;

-- Collection outcome analysis
SELECT
    ca.activityType,
    ca.outcome,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY ca.activityType), 2) as percentage
FROM collection_activity ca
WHERE ca.activityDate >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY ca.activityType, ca.outcome
ORDER BY ca.activityType, COUNT(*) DESC;

-- Promise-to-pay tracking
SELECT
    la.accountNumber,
    lcs.dpdDays,
    ca.activityDate as promiseDate,
    ca.notes as promiseNotes,
    ca.nextActionDate as paymentDueDate,
    lcs.totalOverdueAmount
FROM collection_activity ca
JOIN loan_collection_status lcs ON ca.loanCollectionStatusId = lcs.id
JOIN loan_account la ON lcs.loanAccountId = la.id
WHERE ca.outcome = 'promised_to_pay'
  AND ca.nextActionDate >= CURRENT_DATE
ORDER BY ca.nextActionDate;
```

**Related Tables:**
- loan_collection_status - Main collection status record
- collection_bucket - Activity frequency based on bucket
- recovery_proceeding - Legal activities link to proceedings
- loan_account - Borrower contact information
