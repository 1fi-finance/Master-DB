import { pgEnum } from "drizzle-orm/pg-core";

export const loanApplicationStatusEnum = pgEnum("loan_application_status", [
    "draft",
    "submitted",
    "under_review",
    "kyc_pending",
    "credit_pending",
    "approved",
    "rejected",
    "disbursed",
    "cancelled"
]);

export const loanStatusEnum = pgEnum("loan_status", [
    "active",
    "fully_paid",
    "foreclosed",
    "defaulted",
    "closed"
]);

export const emiStatusEnum = pgEnum("emi_status", [
    "scheduled",
    "paid",
    "partially_paid",
    "overdue",
    "waived"
]);

export const documentTypeEnum = pgEnum("document_type", [
    "aadhaar",
    "pan",
    "bank_statement",
    "mutual_fund_statement",
    "income_proof",
    "agreement",
    "kyc"
]);

export const documentStatusEnum = pgEnum("document_status", [
    "pending",
    "uploaded",
    "verified",
    "rejected"
]);

export const mutualFundTypeEnum = pgEnum("mutual_fund_type", [
    "equity",
    "debt",
    "hybrid",
    "etf"
]);

export const approvalStatusEnum = pgEnum("approval_status", [
    "pending",
    "approved",
    "rejected",
    "conditional"
]);

export const userStatusEnum = pgEnum("user_status", [
    "pending",
    "active",
    "suspended",
    "blocked",
    "inactive"
]);

export const disbursementStatusEnum = pgEnum("disbursement_status", [
    "pending",
    "initiated",
    "completed",
    "failed",
    "reversed"
]);

// Interest Accrual Enums
export const accrualStatusEnum = pgEnum("accrual_status", [
    "pending",
    "completed",
    "failed",
    "partial"
]);

// Fees and Charges Enums
export const feeTypeEnum = pgEnum("fee_type", [
    "processing",
    "prepayment",
    "foreclosure",
    "bounce",
    "legal",
    "inspection",
    "other"
]);

export const feeCalculationMethodEnum = pgEnum("fee_calculation_method", [
    "flat_amount",
    "percentage_of_loan",
    "percentage_of_outstanding",
    "percentage_of_emi",
    "tiered"
]);

export const feeStatusEnum = pgEnum("fee_status", [
    "applicable",
    "applied",
    "partially_paid",
    "paid",
    "waived",
    "written_off"
]);

// Collection and Recovery Enums
export const collectionActivityTypeEnum = pgEnum("collection_activity_type", [
    "call",
    "visit",
    "email",
    "sms",
    "whatsapp",
    "legal_notice",
    "court_filing",
    "other"
]);

export const collectionOutcomeEnum = pgEnum("collection_outcome", [
    "promised_to_pay",
    "paid",
    "refused_to_pay",
    "wrong_number",
    "not_reachable",
    "payment_arrangement",
    "legal_action_initiated"
]);

export const proceedingTypeEnum = pgEnum("proceeding_type", [
    "legal_notice",
    "civil_suite",
    "criminal_case",
    "sarfaesi",
    "debt_recovery_tribunal",
    "arbitration"
]);

export const proceedingStageEnum = pgEnum("proceeding_stage", [
    "initiated",
    "under_review",
    "hearing_scheduled",
    "judgment_awaited",
    "judgment_in_favor",
    "judgment_against",
    "settled",
    "closed"
]);


export const JourneyType = pgEnum("journey", [
    "basic",
    "productBased",
    "variantBased"
]);
export const npaCategoryEnum = pgEnum("npa_category", [
    "standard",
    "sub_standard",
    "doubtful_1",
    "doubtful_2",
    "doubtful_3",
    "loss"
]);

// Loan Modifications Enums
export const restructuringTypeEnum = pgEnum("restructuring_type", [
    "tenure_extension",
    "interest_rate_reduction",
    "moratorium",
    "rescheduling",
    "restructuring_and_rehabilitation",
    "one_time_settlement"
]);

export const restructuringStatusEnum = pgEnum("restructuring_status", [
    "requested",
    "under_review",
    "approved",
    "rejected",
    "implemented",
    "cancelled"
]);

export const adjustmentReasonEnum = pgEnum("adjustment_reason", [
    "rate_revision",
    "restructuring",
    "regulatory_change",
    "customer_request",
    "error_correction"
]);

export const merchantStatusEnum = pgEnum("merchant_status", [
    "pending",
    "verified",
    "rejected",
    "suspended",
    "blacklisted"
]);

export const storeTypeEnum = pgEnum("store_type", [
    "physical",
    "online",
    "hybrid",
    "warehouse",
    "pop_up"
]);

export const orderStatusEnum = pgEnum("order_status", [
    "pending",
    "processing",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
    "refunded",
    "failed"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
    "initiated"
]);

export const channelTypeEnum = pgEnum("channel_type", [
    "online",
    "offline",
    "pos",
    "marketplace",
    "social_media",
    "other"
]);

export const fulfillmentTypeEnum = pgEnum("fulfillment_type", [
    "delivery",
    "pickup",
    "store_purchase",
    "reserve_online"
]);

export const settlementStatusEnum = pgEnum("settlement_status", [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled"
]);

export const analyticsPeriodEnum = pgEnum("analytics_period", [
    "hourly",
    "daily",
    "weekly",
    "monthly"
]);

export const gstVerificationStatusEnum = pgEnum("gst_verification_status", [
    "pending",      // Not yet verified
    "verified",     // API returned valid=true, active=true
    "inactive",     // API returned valid=true, active=false
    "invalid",      // API returned valid=false
    "failed",       // API call failed (network/timeout)
    "mismatch"      // Valid but PAN doesn't match merchant PAN
]);
