# LMS Enumerations

This document details all LMS-specific enumerations used throughout the Loan Management System schema.

## Table of Contents

- [Account Status Enums](#account-status-enums)
- [Payment & Repayment Enums](#payment--repayment-enums)
- [Disbursement Enums](#disbursement-enums)
- [Collections & Recovery Enums](#collections--recovery-enums)
- [Fees & Charges Enums](#fees--charges-enums)
- [Interest & Modifications Enums](#interest--modifications-enums)

---

## Account Status Enums

### loanStatusEnum

**Used in:** `loan_account.status`

**Possible Values:**
- `active` - Loan is currently active and being repaid
- `fully_paid` - Loan has been completely repaid
- `foreclosed` - Loan was closed early through foreclosure process
- `defaulted` - Loan is in default status
- `closed` - Loan account is closed (general closure)

**Default:** `active`

**Database Constraints:** NOT NULL

**State Transitions:**
```
active → (fully_paid | foreclosed | defaulted | closed)
defaulted → (foreclosed | closed)
```

**Business Notes:**
- Once a loan moves to `fully_paid`, `foreclosed`, or `closed`, it cannot return to `active`
- `defaulted` status is typically triggered when DPD exceeds defined thresholds (e.g., 90+ days)
- `foreclosed` implies early payoff, possibly with foreclosure fees
- NPA classification is tracked separately in `loan_collection_status.npaCategory`

---

## Payment & Repayment Enums

### emiStatusEnum

**Used in:** `emi_schedule.status`

**Possible Values:**
- `scheduled` - EMI is scheduled and not yet due
- `paid` - EMI has been fully paid
- `partially_paid` - Partial payment received against this EMI
- `overdue` - EMI payment date has passed without full payment
- `waived` - EMI has been waived off (requires authorization)

**Default:** `scheduled`

**Database Constraints:** NOT NULL

**State Transitions:**
```
scheduled → (paid | partially_paid | overdue | waived)
partially_paid → (paid | overdue)
overdue → (paid | partially_paid | waived)
```

**Business Notes:**
- `overdue` is automatically triggered when due date passes and status is not `paid`
- `partially_paid` indicates some payment received but not full amount
- `waived` status requires manager-level approval and audit trail
- Penalty charges apply when transitioning to `overdue`

---

## Disbursement Enums

### disbursementStatusEnum

**Used in:** `disbursement.status`

**Possible Values:**
- `pending` - Disbursement is pending initiation
- `initiated` - Disbursement has been initiated with payment gateway/bank
- `completed` - Disbursement successfully completed
- `failed` - Disbursement failed (requires retry or cancellation)
- `reversed` - Disbursement was reversed after completion

**Default:** `pending`

**Database Constraints:** NOT NULL

**State Transitions:**
```
pending → (initiated | failed)
initiated → (completed | failed)
completed → (reversed)
```

**Business Notes:**
- `initiated` means funds transferred to payment gateway or bank initiated
- `completed` requires UTR/transaction reference confirmation
- `reversed` can happen due to bank errors, account issues, or fraud detection
- `failed` transitions require `failureReason` to be populated
- Auto-retry mechanism may attempt `failed` → `initiated` based on retry policy

---

## Collections & Recovery Enums

### collectionActivityTypeEnum

**Used in:** `collection_activity.activityType`

**Possible Values:**
- `call` - Phone call made to customer
- `visit` - Physical visit to customer's location
- `email` - Email communication sent
- `sms` - SMS message sent
- `whatsapp` - WhatsApp message sent
- `legal_notice` - Legal notice issued
- `court_filing` - Court case filing initiated
- `other` - Other type of collection activity

**Database Constraints:** NOT NULL

**Business Notes:**
- Activity type determines follow-up frequency and strategy
- `legal_notice` and `court_filing` trigger formal recovery proceedings
- Multi-channel approach documented through multiple activity records
- Escalation typically follows: call → sms → whatsapp → visit → legal

### collectionOutcomeEnum

**Used in:** `collection_activity.outcome`

**Possible Values:**
- `promised_to_pay` - Customer committed to pay by specific date
- `paid` - Payment received during/after activity
- `refused_to_pay` - Customer refused to pay
- `wrong_number` - Contact number is invalid
- `not_reachable` - Could not contact customer
- `payment_arrangement` - Payment plan agreed upon
- `legal_action_initiated` - Legal proceedings started

**Business Notes:**
- `promised_to_pay` requires `nextActionDate` to be set
- `payment_arrangement` should link to restructuring records if applicable
- `legal_action_initiated` should create `recovery_proceeding` record
- Outcome analytics used to optimize collection strategy

### proceedingTypeEnum

**Used in:** `recovery_proceeding.proceedingType`

**Possible Values:**
- `legal_notice` - Legal notice under Section 13(2) of SARFAESI Act
- `civil_suite` - Civil suit filed for recovery
- `criminal_case` - Criminal case for fraud/breach of trust
- `sarfaesi` - SARFAESI Act proceedings for secured asset recovery
- `debt_recovery_tribunal` - DRT filing for debt recovery
- `arbitration` - Arbitration proceedings as per loan agreement

**Database Constraints:** NOT NULL

**Business Notes:**
- `sarfaesi` is fastest for secured loans (can take possession in 4 months)
- `debt_recovery_tribunal` typically takes 1-2 years
- `civil_suite` is traditional approach (3-5 years)
- Choice depends on loan security type, amount, and jurisdiction
- Legal charges tracked separately and capitalized to loan account

### proceedingStageEnum

**Used in:** `recovery_proceeding.stage`

**Possible Values:**
- `initiated` - Proceedings initiated
- `under_review` - Under review by court/tribunal
- `hearing_scheduled` - Hearing date scheduled
- `judgment_awaited` - Arguments completed, judgment reserved
- `judgment_in_favor` - Judgment in favor of lender
- `judgment_against` - Judgment against lender
- `settled` - Case settled out of court
- `closed` - Proceedings closed

**Default:** `initiated`

**Database Constraints:** NOT NULL

**State Transitions:**
```
initiated → (under_review | hearing_scheduled | settled | closed)
under_review → (hearing_scheduled | settled)
hearing_scheduled → (judgment_awaited | settled)
judgment_awaited → (judgment_in_favor | judgment_against | settled)
judgment_in_favor → (closed)
judgment_against → (closed)
```

**Business Notes:**
- Stage progression drives provisioning and write-off decisions
- `settled` may involve compromise and one-time settlement
- Recovery probability estimates updated at each stage
- Legal costs accrued throughout proceedings

### npaCategoryEnum

**Used in:** `loan_collection_status.npaCategory`

**Possible Values:**
- `standard` - Performing asset (DPD 0-30 days)
- `sub_standard` - Sub-standard asset (DPD 31-90 days)
- `doubtful_1` - Doubtful asset, Category 1 (DPD 91-180 days)
- `doubtful_2` - Doubtful asset, Category 2 (DPD 181-365 days)
- `doubtful_3` - Doubtful asset, Category 3 (1+ years in doubtful)
- `loss` - Loss asset (considered uncollectible)

**Database Constraints:** Nullable (NULL for standard accounts)

**NPA Provisioning Requirements:**

| NPA Category | Provisioning % | DPD Range | Description |
|--------------|----------------|-----------|-------------|
| `standard` | 0.4% - 5% | 0-30 days | Standard asset, general provision |
| `sub_standard` | 15% | 31-90 days | Asset potentially weak |
| `doubtful_1` | 25% | 91-180 days | Doubtful for 1 year |
| `doubtful_2` | 40% | 181-365 days | Doubtful for 1-2 years |
| `doubtful_3` | 100% | 365+ days | Doubtful for 2+ years |
| `loss` | 100% | Identified as loss | Uncollectible |

**State Transitions:**
```
standard → (sub_standard)
sub_standard → (doubtful_1 | standard)
doubtful_1 → (doubtful_2 | sub_standard)
doubtful_2 → (doubtful_3 | doubtful_1)
doubtful_3 → (loss | doubtful_2)
```

**Business Notes:**
- NPA classification impacts profitability and regulatory capital
- Provisioning directly affects P&L statement
- Upgrade from NPA requires clean repayment record
- RBI guidelines mandate classification criteria
- `loss` category typically leads to write-off after all recovery efforts

---

## Fees & Charges Enums

### feeTypeEnum

**Used in:** `fee_master.feeType`

**Possible Values:**
- `processing` - Loan processing fee (one-time, at disbursement)
- `prepayment` - Prepayment/foreclosure fee (for early closure)
- `foreclosure` - Foreclosure charges (when loan closed early)
- `bounce` - Cheque/ECS bounce charges
- `legal` - Legal and recovery charges
- `inspection` - Site inspection or valuation charges
- `other` - Other miscellaneous fees

**Database Constraints:** NOT NULL

**Business Notes:**
- `processing` fee typically 1-3% of loan amount
- `prepayment` and `foreclosure` fees depend on prepayment penalty terms
- `bounce` charges per instance of payment failure
- `legal` fees capitalized to loan account in default scenarios
- `inspection` fees for property/asset verification

### feeCalculationMethodEnum

**Used in:** `fee_master.calculationMethod`

**Possible Values:**
- `flat_amount` - Fixed amount regardless of loan size
- `percentage_of_loan` - Percentage of sanctioned/loan amount
- `percentage_of_outstanding` - Percentage of current outstanding principal
- `percentage_of_emi` - Percentage of EMI amount
- `tiered` - Slab-based calculation (e.g., 1% up to 1L, 0.5% above)

**Database Constraints:** NOT NULL

**Business Notes:**
- `flat_amount` often used for administrative charges
- `percentage_of_loan` common for processing fees
- `percentage_of_outstanding` used for prepayment charges
- `tiered` provides progressive/regressive pricing
- Rate/value stored in `fee_master.rate` or `fee_master.fixedAmount`

### feeStatusEnum

**Used in:** `loan_fees.status`

**Possible Values:**
- `applicable` - Fee applied to account, pending payment
- `applied` - Fee has been applied to the account
- `partially_paid` - Partial payment received
- `paid` - Fully paid
- `waived` - Waived off (requires authorization)
- `written_off` - Written off as unrecoverable

**Default:** `applicable`

**Database Constraints:** NOT NULL

**State Transitions:**
```
applicable → (applied | waived)
applied → (partially_paid | paid | waived | written_off)
partially_paid → (paid | written_off)
```

**Business Notes:**
- `waived` requires manager approval and audit trail
- `written_off` used for unrecoverable fees after NPA declaration
- GL posting happens at each status transition
- `paid` fees update `loan_fees.paidAmount` and zero out outstanding

---

## Interest & Modifications Enums

### restructuringTypeEnum

**Used in:** `loan_restructuring.restructuringType`

**Possible Values:**
- `tenure_extension` - Extending loan tenure to reduce EMI burden
- `interest_rate_reduction` - Reducing interest rate temporarily or permanently
- `moratorium` - Payment holiday/deferment period
- `rescheduling` - Changing EMI schedule/dates
- `restructuring_and_rehabilitation` - Comprehensive restructuring package
- `one_time_settlement` - One-time settlement for less than outstanding

**Database Constraints:** NOT NULL

**Business Notes:**
- `tenure_extension` maintains EMI amount but extends repayment period
- `interest_rate_reduction` can be temporary or permanent
- `moratorium` defers payments for specific period (3-6 months typical)
- `restructuring_and_rehabilitation` combines multiple approaches
- `one_time_settlement` requires significant write-off approval
- Restructured accounts classified as NPA per RBI norms (unless for COVID)

### restructuringStatusEnum

**Used in:** `loan_restructuring.status`

**Possible Values:**
- `requested` - Restructuring requested by borrower
- `under_review` - Under review by lending team
- `approved` - Restructuring proposal approved
- `rejected` - Restructuring request rejected
- `implemented` - Restructuring changes applied to loan account
- `cancelled` - Approved restructuring cancelled before implementation

**Default:** `requested`

**Database Constraints:** NOT NULL

**State Transitions:**
```
requested → (under_review | rejected)
under_review → (approved | rejected)
approved → (implemented | cancelled)
implemented → (requested)  # For further restructuring
```

**Business Notes:**
- `approved` requires credit committee approval
- `implemented` triggers account recalculation and schedule regeneration
- `cancelled` may happen if borrower doesn't agree to terms
- Each restructuring must be reported to credit bureaus
- Post-restructuring performance monitored closely for 24 months

### adjustmentReasonEnum

**Used in:** `interest_rate_adjustment.adjustmentReason`

**Possible Values:**
- `rate_revision` - General interest rate revision (policy change)
- `restructuring` - Rate change as part of restructuring
- `regulatory_change` - Regulatory mandate (e.g., RBI rate cap)
- `customer_request` - Customer requested rate change (with valid reason)
- `error_correction` - Correction of earlier error

**Database Constraints:** NOT NULL

**Business Notes:**
- `rate_revision` applies to entire loan portfolio or segments
- `restructuring` linked to `loan_restructuring` record
- `regulatory_change` requires compliance documentation
- `customer_request` rare, requires special circumstances
- `error_correction` requires audit trail and approval

### accrualStatusEnum

**Used in:** Interest accrual processing (internal field)

**Possible Values:**
- `pending` - Accrual calculation pending
- `completed` - Accrual successfully calculated and posted
- `failed` - Accrual calculation failed
- `partial` - Partial accrual completed

**Business Notes:**
- Used in interest accrual batch jobs
- Status tracked for audit and reconciliation
- `failed` accruals trigger alerts and retry

---

## Cross-Module Enums

### loanApplicationStatusEnum

**Used in:** `loan_applications.status`

**Note:** This enum bridges LOS and LMS systems.

**Possible Values:**
- `draft` - Application in draft
- `submitted` - Application submitted for review
- `under_review` - Under credit review
- `kyc_pending` - KYC documents pending
- `credit_pending` - Credit assessment pending
- `approved` - Application approved
- `rejected` - Application rejected
- `disbursed` - Loan disbursed (moves to LMS)
- `cancelled` - Application cancelled

**Database Constraints:** NOT NULL, Default: `draft`

---

## Usage Notes

### State Management Best Practices

1. **Always validate state transitions** at application level
2. **Maintain audit trails** for status changes requiring approval
3. **Use database constraints** (NOT NULL, DEFAULT) to enforce data quality
4. **Document business rules** for each enum value
5. **Consider reporting requirements** when adding new enum values

### NPA Classification Importance

NPA classification is critical for:
- Regulatory compliance (RBI guidelines)
- Financial reporting and provisioning
- Capital adequacy calculation
- Asset quality reporting

Always ensure:
- DPD calculated accurately
- NPA dates recorded correctly
- Provisioning calculated per regulatory norms
- Downgrades/upgrades documented with reasons

### Collections Strategy Alignment

Collection enums must align with:
- Internal collection policy
- Recovery timeline requirements
- Legal proceeding requirements
- Customer communication preferences
- Regulatory requirements for fair practices

---

## References

- **LMS Schema Documentation:** `docs/lms-schema/`
- **LOS Schema Documentation:** `docs/los-schema/`
- **Database Definitions:** `src/db/schema/definitions.ts`
- **Enum Definitions:** `src/db/schema/enums.ts`
