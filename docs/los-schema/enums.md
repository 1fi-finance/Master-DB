# Enums

This document describes all enum definitions used in the LOS (Loan Origination System) schema.

## LOS-Specific Enums

### loanApplicationStatusEnum
**Definition:** `pgEnum("loan_application_status", [...])`

**Values:**
- `draft` - Loan application started but not yet submitted
- `submitted` - Application submitted for processing
- `under_review` - Loan under manual review by credit officers
- `kyc_pending` - KYC verification required before proceeding
- `credit_pending` - Credit assessment required before decision
- `approved` - Application approved and ready for disbursement
- `rejected` - Application rejected by credit team
- `disbursed` - Loan amount disbursed to borrower
- `cancelled` - Application cancelled by borrower or lender

**Used In:** `los_applications.status`, `los_applications.history`

**Business Rules:**
- Applications can only be moved forward, not backward in status (except for cancellations)
- `draft` applications can be modified by the borrower
- `kyc_pending` and `credit_pending` may require additional documentation
- Disbursement requires successful KYC and credit approval

---

### loanStatusEnum
**Definition:** `pgEnum("loan_status", [...])`

**Values:**
- `active` - Loan is currently being repaid
- `fully_paid` - All EMIs and principal amount paid in full
- `foreclosed` - Loan repaid before maturity date
- `defaulted` - Borrower failed to make payments for 90+ days
- `closed` - Loan account closed (status changed after fully paid or foreclosed)

**Used In:** `loans.status`, `loan_account_management.status`

**Business Rules:**
- `active` loans are subject to regular EMI collection
- `defaulted` loans trigger collection procedures and penalty charges
- `foreclosed` loans may have prepayment penalties depending on terms
- Status transitions are recorded in the loan history table

---

### emiStatusEnum
**Definition:** `pgEnum("emi_status", [...])`

**Values:**
- `scheduled` - EMI is due for payment
- `paid` - EMI successfully paid
- `partially_paid` - EMI partially paid (partial payment received)
- `overdue` - EMI payment past due date
- `waived` - EMI waived by lender (e.g., during moratorium)

**Used In:** `loan_installments.status`, `emi_tracking.status`

**Business Rules:**
- `scheduled` EMIs become overdue if not paid by due date
- `partially_paid` EMIs may attract partial payment penalties
- `waived` EMIs are excluded from overdue calculations
- Each EMI status change is audited for compliance

---

### documentTypeEnum
**Definition:** `pgEnum("document_type", [...])`

**Values:**
- `aadhaar` - Indian national identification document
- `pan` - Permanent Account Number for tax purposes
- `bank_statement` - Bank account statements for income verification
- `mutual_fund_statement` - Investment portfolio statements
- `income_proof` - Salary slips, ITR, or other income documentation
- `agreement` - Loan agreement and contract documents
- `kyc` - Know Your Customer compliance documents

**Used In:** `loan_documents.type`, `document_management.type`

**Business Rules:**
- Each loan application requires mandatory `aadhaar` and `pan` documents
- `income_proof` must be recent (within 3 months)
- `agreement` documents are signed digitally for legal compliance
- All documents are stored with timestamp and hash for audit purposes

---

### documentStatusEnum
**Definition:** `pgEnum("document_status", [...])`

**Values:**
- `pending` - Document uploaded but not yet verified
- `uploaded` - Document successfully uploaded to system
- `verified` - Document verified and approved by verification team
- `rejected` - Document rejected due to quality or compliance issues

**Used In:** `loan_documents.status`, `document_verification.status`

**Business Rules:**
- `uploaded` documents are automatically processed for OCR validation
- `pending` documents trigger verification workflow
- `rejected` documents must be re-uploaded with corrections
- Verification status is tracked with timestamps and verifier details

---

### mutualFundTypeEnum
**Definition:** `pgEnum("mutual_fund_type", [...])`

**Values:**
- `equity` - Equity funds investing in company stocks
- `debt` - Debt funds investing in bonds and fixed income
- `hybrid` - Mixed funds with equity and debt components
- `etf` - Exchange Traded Funds tracking market indices

**Used In:** `investment_mutual_funds.type`, `asset_allocation.type`

**Business Rules:**
- Different fund types have different risk profiles for loan eligibility
- `equity` funds are volatile but provide high returns
- `debt` funds are stable with predictable returns
- `hybrid` and `etf` funds offer balanced risk-return trade-offs

---

### approvalStatusEnum
**Definition:** `pgEnum("approval_status", [...])`

**Values:**
- `pending` - Awaiting approval from designated authority
- `approved` - Approved with no conditions
- `rejected` - Rejected with reason documentation
- `conditional` - Approved with specific conditions to be met

**Used In:** `loan_approvals.status`, `conditional_approvals.conditions`

**Business Rules:**
- `conditional` approvals require fulfillment of specified criteria
- Approval workflow depends on loan amount and risk category
- Approval levels are hierarchical based on delegated authority
- All approvals are documented with approver details and timestamps

---

### disbursementStatusEnum
**Definition:** `pgEnum("disbursement_status", [...])`

**Values:**
- `pending` - Disbursement scheduled but not initiated
- `initiated` - Disbursement process started
- `completed` - Funds successfully disbursed to borrower
- `failed` - Disbursement failed due to technical or banking issues
- `reversed` - Disbursement reversed due to policy violations

**Used In:** `loan_disbursements.status`, `disbursement_tracking.status`

**Business Rules:**
- Disbursement requires successful KYC completion
- `failed` disbursements trigger alert and retry mechanisms
- `reversed` disbursements require investigation and documentation
- All disbursement attempts are logged for audit compliance

---

### feeTypeEnum
**Definition:** `pgEnum("fee_type", [...])`

**Values:**
- `processing` - One-time fee for loan processing
- `prepayment` - Fee for early loan repayment
- `foreclosure` - Fee for closing loan before maturity
- `bounce` - Fee for bounced/dishonored EMI payments
- `legal` - Legal fees associated with loan recovery
- `inspection` - Property or asset inspection fees
- `other` - Miscellaneous fees not categorized above

**Used In:** `loan_fees.type`, `fee_calculations.type`

**Business Rules:**
- Processing fees are collected at loan sanctioning
- Prepayment and foreclosure fees are calculated as percentage of outstanding
- Bounce fees are applied for each failed payment attempt
- All fees are transparently disclosed to borrowers upfront

---

### Non-LOS Enums

These enums are used across multiple schemas but are defined here for completeness:

#### userStatusEnum
**Definition:** `pgEnum("user_status", [...])`

**Values:**
- `pending` - User registration pending verification
- `active` - User account active and operational
- `suspended` - User account temporarily suspended
- `blocked` - User account permanently blocked
- `inactive` - User account inactive due to inactivity

**Used In:** `users.status`, `customer_management.status`

---

#### accrualStatusEnum
**Definition:** `pgEnum("accrual_status", [...])`

**Values:**
- `pending` - Interest accrual scheduled
- `completed` - Interest successfully accrued
- `failed` - Interest accrual failed
- `partial` - Partial interest accrued

**Used In:** `interest_accruals.status`, `accounting_transactions.type`

---

#### feeCalculationMethodEnum
**Definition:** `pgEnum("fee_calculation_method", [...])`

**Values:**
- `flat_amount` - Fixed fee amount
- `percentage_of_loan` - Fee as percentage of loan amount
- `percentage_of_outstanding` - Fee as percentage of outstanding balance
- `percentage_of_emi` - Fee as percentage of EMI amount
- `tiered` - Fee varies based on loan amount ranges

**Used In:** `fee_rules.calculation_method`, `fee_calculations.method`

---

#### feeStatusEnum
**Definition:** `pgEnum("fee_status", [...])`

**Values:**
- `applicable` - Fee is applicable but not yet charged
- `applied` - Fee has been applied to the loan
- `partially_paid` - Fee partially paid by borrower
- `paid` - Fee fully paid
- `waived` - Fee waived by lender
- `written_off` - Fee written off as bad debt

**Used In:** `loan_fees.status`, `fee_reconciliation.status`

---

#### collectionActivityTypeEnum
**Definition:** `pgEnum("collection_activity_type", [...])`

**Values:**
- `call` - Phone call to borrower
- `visit` - Physical visit to borrower location
- `email` - Email communication
- `sms` - SMS communication
- `whatsapp` - WhatsApp communication
- `legal_notice` - Legal notice sent
- `court_filing` - Court case filed
- `other` - Other collection methods

**Used In:** `collection_activities.type`, `collection_workflow.type`

---

#### collectionOutcomeEnum
**Definition:** `pgEnum("collection_outcome", [...])`

**Values:**
- `promised_to_pay` - Borrower promised payment
- `paid` - Payment received
- `refused_to_pay` - Borrower refused payment
- `wrong_number` - Contact details incorrect
- `not_reachable` - Borrower not reachable
- `payment_arrangement` - Payment arrangement made
- `legal_action_initiated` - Legal action started

**Used In:** `collection_results.outcome`, `collection_effectiveness.type`

---

#### proceedingTypeEnum
**Definition:** `pgEnum("proceeding_type", [...])`

**Values:**
- `legal_notice` - Legal notice sent
- `civil_suite` - Civil lawsuit filed
- `criminal_case` - Criminal case filed
- `sarfaesi` - SARFAESI proceedings initiated
- `debt_recovery_tribunal` - Debt Recovery Tribunal case
- `arbitration` - Arbitration proceedings

**Used In:** `legal_proceedings.type`, `recovery_actions.type`

---

#### proceedingStageEnum
**Definition:** `pgEnum("proceeding_stage", [...])`

**Values:**
- `initiated` - Proceedings started
- `under_review` - Under judicial review
- `hearing_scheduled` - Hearing date set
- `judgment_awaited` - Waiting for judgment
- `judgment_in_favor` - Judgment in favor of lender
- `judgment_against` - Judgment against lender
- `settled` - Proceedings settled
- `closed` - Proceedings closed

**Used In:** `legal_proceedings.stage`, `case_management.status`

---

#### npaCategoryEnum
**Definition:** `pgEnum("npa_category", [...])`

**Values:**
- `standard` - Standard asset (no overdue)
- `sub_standard` - Sub-standard asset (90+ days overdue)
- `doubtful_1` - Doubtful asset (180+ days overdue)
- `doubtful_2` - Doubtful asset (270+ days overdue)
- `doubtful_3` - Doubtful asset (360+ days overdue)
- `loss` - Loss asset (beyond recovery)

**Used In:** `loan_classification.npa_category`, `risk_assessment.category`

---

#### restructuringTypeEnum
**Definition:** `pgEnum("restructuring_type", [...])`

**Values:**
- `tenure_extension` - Extend loan tenure
- `interest_rate_reduction` - Reduce interest rate
- `moratorium` - Payment holiday period
- `rescheduling` - Reschedule payment dates
- `restructuring_and_rehabilitation` - Comprehensive restructuring
- `one_time_settlement` - One-time settlement offer

**Used In:** `loan_restructuring.type`, `modification_requests.type`

---

#### restructuringStatusEnum
**Definition:** `pgEnum("restructuring_status", [...])`

**Values:**
- `requested` - Restructuring requested
- `under_review` - Under review by committee
- `approved` - Restructuring approved
- `rejected` - Restructuring rejected
- `implemented` - Restructuring implemented
- `cancelled` - Restructuring cancelled

**Used In:** `loan_restructuring.status`, `restructuring_workflow.status`

---

#### adjustmentReasonEnum
**Definition:** `pgEnum("adjustment_reason", [...])`

**Values:**
- `rate_revision` - Interest rate revision
- `restructuring` - Loan restructuring
- `regulatory_change` - Regulatory changes
- `customer_request` - Customer request
- `error_correction` - Error correction

**Used In:** `loan_adjustments.reason`, `fee_adjustments.reason`

---

#### paymentStatusEnum
**Definition:** `pgEnum("payment_status", [...])`

**Values:**
- `pending` - Payment initiated but not completed
- `paid` - Payment successfully completed
- `failed` - Payment failed
- `refunded` - Payment refunded
- `partially_refunded` - Partial refund processed
- `initiated` - Payment process started

**Used In:** `payments.status`, `settlement_transactions.status`

---

#### settlementStatusEnum
**Definition:** `pgEnum("settlement_status", [...])`

**Values:**
- `pending` - Settlement processing
- `processing` - Under settlement processing
- `completed` - Settlement completed successfully
- `failed` - Settlement failed
- `cancelled` - Settlement cancelled

**Used In:** `merchant_settlements.status`, `reconciliation_transactions.status`

---

#### analyticsPeriodEnum
**Definition:** `pgEnum("analytics_period", [...])`

**Values:**
- `hourly` - Hourly analytics
- `daily` - Daily analytics
- `weekly` - Weekly analytics
- `monthly` - Monthly analytics

**Used In:** `analytics_data.period`, `reporting_schedules.period`
