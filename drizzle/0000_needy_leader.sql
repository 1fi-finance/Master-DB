CREATE SCHEMA "lms";
--> statement-breakpoint
CREATE SCHEMA "los";
--> statement-breakpoint
CREATE SCHEMA "merchant";
--> statement-breakpoint
CREATE SCHEMA "shared";
--> statement-breakpoint
CREATE SCHEMA "users";
--> statement-breakpoint
CREATE TYPE "public"."journey" AS ENUM('basic', 'productBased', 'variantBased');--> statement-breakpoint
CREATE TYPE "public"."accrual_status" AS ENUM('pending', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."adjustment_reason" AS ENUM('rate_revision', 'restructuring', 'regulatory_change', 'customer_request', 'error_correction');--> statement-breakpoint
CREATE TYPE "public"."analytics_period" AS ENUM('hourly', 'daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'conditional');--> statement-breakpoint
CREATE TYPE "public"."channel_type" AS ENUM('online', 'offline', 'pos', 'marketplace', 'social_media', 'other');--> statement-breakpoint
CREATE TYPE "public"."collection_activity_type" AS ENUM('call', 'visit', 'email', 'sms', 'whatsapp', 'legal_notice', 'court_filing', 'other');--> statement-breakpoint
CREATE TYPE "public"."collection_outcome" AS ENUM('promised_to_pay', 'paid', 'refused_to_pay', 'wrong_number', 'not_reachable', 'payment_arrangement', 'legal_action_initiated');--> statement-breakpoint
CREATE TYPE "public"."disbursement_status" AS ENUM('pending', 'initiated', 'completed', 'failed', 'reversed');--> statement-breakpoint
CREATE TYPE "public"."document_status" AS ENUM('pending', 'uploaded', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('aadhaar', 'pan', 'bank_statement', 'mutual_fund_statement', 'income_proof', 'agreement', 'kyc');--> statement-breakpoint
CREATE TYPE "public"."emi_status" AS ENUM('scheduled', 'paid', 'partially_paid', 'overdue', 'waived');--> statement-breakpoint
CREATE TYPE "public"."fee_calculation_method" AS ENUM('flat_amount', 'percentage_of_loan', 'percentage_of_outstanding', 'percentage_of_emi', 'tiered');--> statement-breakpoint
CREATE TYPE "public"."fee_status" AS ENUM('applicable', 'applied', 'partially_paid', 'paid', 'waived', 'written_off');--> statement-breakpoint
CREATE TYPE "public"."fee_type" AS ENUM('processing', 'prepayment', 'foreclosure', 'bounce', 'legal', 'inspection', 'other');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_type" AS ENUM('delivery', 'pickup', 'store_purchase', 'reserve_online');--> statement-breakpoint
CREATE TYPE "public"."loan_application_status" AS ENUM('draft', 'submitted', 'under_review', 'kyc_pending', 'credit_pending', 'approved', 'rejected', 'disbursed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."loan_status" AS ENUM('active', 'fully_paid', 'foreclosed', 'defaulted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."merchant_status" AS ENUM('pending', 'verified', 'rejected', 'suspended', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."mutual_fund_type" AS ENUM('equity', 'debt', 'hybrid', 'etf');--> statement-breakpoint
CREATE TYPE "public"."npa_category" AS ENUM('standard', 'sub_standard', 'doubtful_1', 'doubtful_2', 'doubtful_3', 'loss');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded', 'partially_refunded', 'initiated');--> statement-breakpoint
CREATE TYPE "public"."proceeding_stage" AS ENUM('initiated', 'under_review', 'hearing_scheduled', 'judgment_awaited', 'judgment_in_favor', 'judgment_against', 'settled', 'closed');--> statement-breakpoint
CREATE TYPE "public"."proceeding_type" AS ENUM('legal_notice', 'civil_suite', 'criminal_case', 'sarfaesi', 'debt_recovery_tribunal', 'arbitration');--> statement-breakpoint
CREATE TYPE "public"."restructuring_status" AS ENUM('requested', 'under_review', 'approved', 'rejected', 'implemented', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."restructuring_type" AS ENUM('tenure_extension', 'interest_rate_reduction', 'moratorium', 'rescheduling', 'restructuring_and_rehabilitation', 'one_time_settlement');--> statement-breakpoint
CREATE TYPE "public"."settlement_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."store_type" AS ENUM('physical', 'online', 'hybrid', 'warehouse', 'pop_up');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended', 'blocked', 'inactive');--> statement-breakpoint
CREATE TABLE "los"."loan_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" text,
	"minLoanAmount" numeric(15, 2) NOT NULL,
	"maxLoanAmount" numeric(15, 2) NOT NULL,
	"minTenureMonths" integer NOT NULL,
	"maxTenureMonths" integer NOT NULL,
	"baseInterestRate" numeric(8, 4) NOT NULL,
	"processingFeePercent" numeric(8, 4) NOT NULL,
	"prepaymentFeePercent" numeric(8, 4) DEFAULT '0' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_products_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "los"."ltv_config" (
	"id" uuid PRIMARY KEY NOT NULL,
	"loanProductId" uuid NOT NULL,
	"mutualFundType" "mutual_fund_type" NOT NULL,
	"ltvRatio" numeric(5, 2) NOT NULL,
	"minCollateralValue" numeric(15, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"fullName" varchar(255) NOT NULL,
	"age" integer NOT NULL,
	"pan" varchar(35),
	"pekrn" varchar(15),
	"mobile" varchar(13),
	"email" varchar(255),
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"mobileVerified" boolean DEFAULT false NOT NULL,
	"panVerified" boolean DEFAULT false NOT NULL,
	"pekrnVerified" boolean DEFAULT false NOT NULL,
	"kycVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."cas_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"casData" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "los"."kyc_verification" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"aadhaarNumber" varchar(12),
	"care_of" varchar(255),
	"panNumber" varchar(10),
	"fullName" varchar(255),
	"gender" varchar(10),
	"image" varchar(255),
	"dateOfBirth" date,
	"address" jsonb,
	"isVerified" boolean DEFAULT false NOT NULL,
	"verificationDate" timestamp,
	"verificationRemarks" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"cfPaymentId" varchar(100),
	"orderId" varchar(100) NOT NULL,
	"entity" varchar(50) DEFAULT 'payment',
	"paymentAmount" numeric(15, 2) NOT NULL,
	"paymentCurrency" varchar(10) DEFAULT 'INR',
	"paymentStatus" varchar(50) NOT NULL,
	"paymentMessage" text,
	"paymentTime" timestamp,
	"paymentCompletionTime" timestamp,
	"paymentGroup" varchar(50),
	"paymentMethod" jsonb,
	"authorization" jsonb,
	"authId" varchar(100),
	"paymentGatewayDetails" jsonb,
	"bankReference" varchar(100),
	"errorDetails" jsonb,
	"isCaptured" varchar(50) DEFAULT 'false',
	"rawResponse" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_cfPaymentId_unique" UNIQUE("cfPaymentId")
);
--> statement-breakpoint
CREATE TABLE "users"."autopay" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"subscriptionId" varchar(100) NOT NULL,
	"cfSubscriptionId" varchar(100),
	"subscriptionSessionId" varchar(255),
	"subscriptionStatus" varchar(50) DEFAULT 'INITIALIZED' NOT NULL,
	"planName" varchar(255),
	"planType" varchar(50),
	"expiryTime" timestamp,
	"nextScheduleDate" timestamp,
	"subscriptionFirstChargeTime" timestamp,
	"authorizationDetails" jsonb,
	"customerDetails" jsonb,
	"planDetails" jsonb,
	"subscriptionMeta" jsonb,
	"subscriptionNote" text,
	"subscriptionTags" jsonb,
	"subscriptionPaymentSplits" jsonb,
	"maxAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "autopay_subscriptionId_unique" UNIQUE("subscriptionId")
);
--> statement-breakpoint
CREATE TABLE "los"."loan_applications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"loanProductId" uuid NOT NULL,
	"applicationNumber" varchar(50) NOT NULL,
	"status" "loan_application_status" DEFAULT 'draft' NOT NULL,
	"requestedLoanAmount" numeric(15, 2) NOT NULL,
	"requestedTenureMonths" integer NOT NULL,
	"emiType" varchar(20) NOT NULL,
	"approvedLoanAmount" numeric(15, 2),
	"approvedTenureMonths" integer,
	"approvedInterestRate" numeric(8, 4),
	"approvedEmiAmount" numeric(15, 2),
	"rejectionReason" text,
	"submittedAt" timestamp,
	"approvedAt" timestamp,
	"reviewedBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_applications_applicationNumber_unique" UNIQUE("applicationNumber")
);
--> statement-breakpoint
CREATE TABLE "los"."mutual_fund_collateral" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"fundName" varchar(255) NOT NULL,
	"fundHouse" varchar(255) NOT NULL,
	"schemeCode" varchar(50) NOT NULL,
	"folioNumber" varchar(50) NOT NULL,
	"mutualFundType" "mutual_fund_type" NOT NULL,
	"unitsPledged" numeric(18, 4) NOT NULL,
	"navAtPledge" numeric(12, 4) NOT NULL,
	"collateralValue" numeric(15, 2) NOT NULL,
	"ltvApplied" numeric(5, 2) NOT NULL,
	"rtaVerified" boolean DEFAULT false NOT NULL,
	"rtaVerificationDate" timestamp,
	"pledgeReferenceNumber" varchar(100),
	"validateId" varchar(100),
	"isin" varchar(50),
	"rtaName" varchar(50),
	"amc" varchar(100),
	"lienRefNo" varchar(100),
	"lienStatus" varchar(50),
	"lienRemarks" text,
	"clientId" varchar(100),
	"lenderCode" varchar(100),
	"apiResponse" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "los"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"documentType" "document_type" NOT NULL,
	"documentUrl" varchar(500) NOT NULL,
	"fileName" varchar(255) NOT NULL,
	"fileSize" integer,
	"status" "document_status" DEFAULT 'pending' NOT NULL,
	"verificationRemarks" text,
	"verifiedBy" uuid,
	"verifiedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "los"."loan_sanction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"sanctionLetterNumber" varchar(100) NOT NULL,
	"sanctionedAmount" numeric(15, 2) NOT NULL,
	"sanctionedInterestRate" numeric(8, 4) NOT NULL,
	"sanctionedTenureMonths" integer NOT NULL,
	"sanctionDate" timestamp DEFAULT now() NOT NULL,
	"validUntil" timestamp NOT NULL,
	"emiType" varchar(20) NOT NULL,
	"emiAmount" numeric(15, 2),
	"totalInterestPayable" numeric(15, 2) NOT NULL,
	"totalAmountPayable" numeric(15, 2) NOT NULL,
	"processingFees" numeric(15, 2) NOT NULL,
	"otherCharges" numeric(15, 2) DEFAULT '0' NOT NULL,
	"agreementGenerated" boolean DEFAULT false NOT NULL,
	"agreementUrl" varchar(500),
	"agreementSignedAt" timestamp,
	"agreementIp" varchar(50),
	"sanctionedBy" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_sanction_loanApplicationId_unique" UNIQUE("loanApplicationId"),
	CONSTRAINT "loan_sanction_sanctionLetterNumber_unique" UNIQUE("sanctionLetterNumber")
);
--> statement-breakpoint
CREATE TABLE "los"."approval_workflow" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"approverId" uuid NOT NULL,
	"approvalLevel" integer NOT NULL,
	"role" varchar(100) NOT NULL,
	"status" "approval_status" DEFAULT 'pending' NOT NULL,
	"remarks" text,
	"approvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."disbursement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"loanSanctionId" uuid NOT NULL,
	"disbursementAmount" numeric(15, 2) NOT NULL,
	"disbursementDate" timestamp DEFAULT now() NOT NULL,
	"status" "disbursement_status" DEFAULT 'pending' NOT NULL,
	"beneficiaryAccountNumber" varchar(50) NOT NULL,
	"beneficiaryIfsc" varchar(20) NOT NULL,
	"beneficiaryName" varchar(255) NOT NULL,
	"bankName" varchar(255) NOT NULL,
	"utrNumber" varchar(100),
	"transactionReference" varchar(100),
	"paymentGatewayReference" varchar(100),
	"initiatedAt" timestamp,
	"completedAt" timestamp,
	"failureReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."emi_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"loanSanctionId" uuid NOT NULL,
	"installmentNumber" integer NOT NULL,
	"dueDate" date NOT NULL,
	"principalAmount" numeric(15, 2) NOT NULL,
	"interestAmount" numeric(15, 2) NOT NULL,
	"totalEmiAmount" numeric(15, 2) NOT NULL,
	"openingPrincipal" numeric(15, 2) NOT NULL,
	"closingPrincipal" numeric(15, 2) NOT NULL,
	"status" "emi_status" DEFAULT 'scheduled' NOT NULL,
	"paidDate" timestamp,
	"paidAmount" numeric(15, 2),
	"overdueDays" integer DEFAULT 0 NOT NULL,
	"latePaymentCharges" numeric(15, 2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."repayment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"emiScheduleId" uuid,
	"paymentAmount" numeric(15, 2) NOT NULL,
	"paymentDate" timestamp DEFAULT now() NOT NULL,
	"paymentMode" varchar(50) NOT NULL,
	"principalComponent" numeric(15, 2) NOT NULL,
	"interestComponent" numeric(15, 2) NOT NULL,
	"latePaymentCharges" numeric(15, 2) DEFAULT '0' NOT NULL,
	"transactionReference" varchar(100) NOT NULL,
	"utrNumber" varchar(100),
	"paymentGatewayResponse" jsonb,
	"allocatedToEmiNumbers" varchar(500),
	"foreclosurePayment" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."loan_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanApplicationId" uuid NOT NULL,
	"loanSanctionId" uuid NOT NULL,
	"accountNumber" varchar(50) NOT NULL,
	"principalAmount" numeric(15, 2) NOT NULL,
	"currentOutstanding" numeric(15, 2) NOT NULL,
	"interestRate" numeric(8, 4) NOT NULL,
	"tenureMonths" integer NOT NULL,
	"loanStartDate" timestamp NOT NULL,
	"loanEndDate" timestamp NOT NULL,
	"nextEmiDueDate" date,
	"status" "loan_status" DEFAULT 'active' NOT NULL,
	"totalCollateralValue" numeric(15, 2) NOT NULL,
	"currentLtv" numeric(5, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_account_loanApplicationId_unique" UNIQUE("loanApplicationId"),
	CONSTRAINT "loan_account_accountNumber_unique" UNIQUE("accountNumber")
);
--> statement-breakpoint
CREATE TABLE "lms"."interest_accrual" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"accrualDate" date NOT NULL,
	"principalOutstanding" numeric(15, 2) NOT NULL,
	"interestRate" numeric(8, 4) NOT NULL,
	"daysInPeriod" integer NOT NULL,
	"accruedInterest" numeric(15, 2) NOT NULL,
	"postedToLedger" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."interest_rate_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"effectiveDate" date NOT NULL,
	"oldRate" numeric(8, 4) NOT NULL,
	"newRate" numeric(8, 4) NOT NULL,
	"reason" text NOT NULL,
	"changedBy" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."accrual_run_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"runDate" date NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL,
	"loansProcessed" integer NOT NULL,
	"totalAccruedInterest" numeric(15, 2) NOT NULL,
	"status" "accrual_status" DEFAULT 'pending' NOT NULL,
	"errorMessage" text,
	"startedAt" timestamp NOT NULL,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "lms"."fee_master" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feeCode" varchar(50) NOT NULL,
	"feeName" varchar(255) NOT NULL,
	"feeType" "fee_type" NOT NULL,
	"calculationMethod" "fee_calculation_method" NOT NULL,
	"rate" numeric(8, 4),
	"fixedAmount" numeric(15, 2),
	"applicability" varchar(100) NOT NULL,
	"glHead" varchar(100) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"effectiveDate" date NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "fee_master_feeCode_unique" UNIQUE("feeCode")
);
--> statement-breakpoint
CREATE TABLE "lms"."loan_fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"feeId" uuid NOT NULL,
	"feeAmount" numeric(15, 2) NOT NULL,
	"waivedAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"paidAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"outstandingAmount" numeric(15, 2) NOT NULL,
	"applicableDate" date NOT NULL,
	"dueDate" date NOT NULL,
	"status" "fee_status" DEFAULT 'applicable' NOT NULL,
	"waivedBy" varchar(255),
	"waivedReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."fee_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanFeeId" uuid NOT NULL,
	"paymentAmount" numeric(15, 2) NOT NULL,
	"paymentDate" date NOT NULL,
	"paymentMode" varchar(50) NOT NULL,
	"transactionReference" varchar(100),
	"utrNumber" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."penalty_calculation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"emiScheduleId" uuid NOT NULL,
	"overdueDays" integer NOT NULL,
	"penaltyAmount" numeric(15, 2) NOT NULL,
	"calculatedDate" date NOT NULL,
	"waived" boolean DEFAULT false NOT NULL,
	"waivedBy" varchar(255),
	"waivedReason" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."collection_bucket" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucketCode" varchar(50) NOT NULL,
	"bucketName" varchar(255) NOT NULL,
	"minDpdDays" integer NOT NULL,
	"maxDpdDays" integer NOT NULL,
	"provisioningPercentage" numeric(5, 2) NOT NULL,
	"collectionStrategy" text NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "collection_bucket_bucketCode_unique" UNIQUE("bucketCode")
);
--> statement-breakpoint
CREATE TABLE "lms"."loan_collection_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"currentBucket" uuid,
	"dpdDays" integer DEFAULT 0 NOT NULL,
	"lastPaymentDate" date,
	"totalOverdueAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"principalOverdue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"interestOverdue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"feeOverdue" numeric(15, 2) DEFAULT '0' NOT NULL,
	"npaDate" date,
	"npaCategory" "npa_category",
	"provisioningAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"assignedTo" varchar(255),
	"assignedDate" date,
	"lastFollowUpDate" date,
	"nextFollowUpDate" date,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "loan_collection_status_loanAccountId_unique" UNIQUE("loanAccountId")
);
--> statement-breakpoint
CREATE TABLE "lms"."collection_activity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanCollectionStatusId" uuid NOT NULL,
	"activityType" "collection_activity_type" NOT NULL,
	"activityDate" date NOT NULL,
	"notes" text,
	"outcome" "collection_outcome",
	"nextActionDate" date,
	"assignedTo" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."recovery_proceeding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"proceedingType" "proceeding_type" NOT NULL,
	"stage" "proceeding_stage" DEFAULT 'initiated' NOT NULL,
	"filingDate" date NOT NULL,
	"caseNumber" varchar(100),
	"courtName" varchar(255),
	"lawyerName" varchar(255),
	"legalCharges" numeric(15, 2) DEFAULT '0' NOT NULL,
	"expectedRecoveryDate" date,
	"actualRecoveryDate" date,
	"recoveryAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."loan_restructuring" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"restructuringType" "restructuring_type" NOT NULL,
	"requestedDate" date NOT NULL,
	"effectiveDate" date,
	"approvedDate" date,
	"approvedBy" varchar(255),
	"reason" text NOT NULL,
	"status" "restructuring_status" DEFAULT 'requested' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."restructuring_terms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanRestructuringId" uuid NOT NULL,
	"oldTenure" integer NOT NULL,
	"newTenure" integer NOT NULL,
	"oldInterestRate" numeric(8, 4) NOT NULL,
	"newInterestRate" numeric(8, 4) NOT NULL,
	"oldEmiAmount" numeric(15, 2) NOT NULL,
	"newEmiAmount" numeric(15, 2) NOT NULL,
	"moratoriumPeriod" integer DEFAULT 0 NOT NULL,
	"moratoriumReason" text,
	"restructuringCharges" numeric(15, 2) DEFAULT '0' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."interest_rate_adjustment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"effectiveFrom" date NOT NULL,
	"previousRate" numeric(8, 4) NOT NULL,
	"newRate" numeric(8, 4) NOT NULL,
	"adjustmentReason" "adjustment_reason" NOT NULL,
	"approvedBy" varchar(255),
	"approvedAt" timestamp,
	"linkedToRestructuring" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."top_up_loan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parentLoanAccountId" uuid NOT NULL,
	"topUpAmount" numeric(15, 2) NOT NULL,
	"newTotalLoan" numeric(15, 2) NOT NULL,
	"newTenure" integer NOT NULL,
	"newInterestRate" numeric(8, 4) NOT NULL,
	"approvedDate" date,
	"disbursedDate" date,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lms"."tenure_change" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"loanAccountId" uuid NOT NULL,
	"oldTenureMonths" integer NOT NULL,
	"newTenureMonths" integer NOT NULL,
	"effectiveDate" date NOT NULL,
	"reason" text NOT NULL,
	"impactOnEmi" numeric(15, 2) NOT NULL,
	"approvedBy" varchar(255),
	"approvedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_kyc" (
	"id" uuid PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"panNumber" varchar(10) NOT NULL,
	"gstin" varchar(15) NOT NULL,
	"bankAccountNumber" varchar(20) NOT NULL,
	"bankName" varchar(255) NOT NULL,
	"bankBranch" varchar(255) NOT NULL,
	"bankIfsc" varchar(11) NOT NULL,
	"bankAccountHolderName" varchar(255) NOT NULL,
	"bankAccountType" varchar(20) NOT NULL,
	"upiId" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"primaryContactName" varchar(255) NOT NULL,
	"primaryContactPhone" varchar(15) NOT NULL,
	"primaryContactEmail" varchar(255) NOT NULL,
	"businessPhone" varchar(15),
	"businessEmail" varchar(255),
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(100) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	"country" varchar(100) DEFAULT 'India',
	"commissionRate" numeric(5, 2) DEFAULT '0.00',
	"logoUrl" varchar(500),
	"businessDescription" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_settlement_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"settlementCycleDays" integer NOT NULL,
	"settlementDayOfMonth" integer,
	"settlementBankAccount" varchar(35) NOT NULL,
	"settlementBankIfsc" varchar(11) NOT NULL,
	"settlementBankAccountName" varchar(255) NOT NULL,
	"reservePercentage" integer DEFAULT 0,
	"reserveReleaseDays" integer,
	"minimumSettlementAmount" numeric(15, 2) DEFAULT '1000.00',
	"autoSettlementEnabled" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_stores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"storeName" varchar(255) NOT NULL,
	"storeCode" varchar(50) NOT NULL,
	"storeType" "store_type" NOT NULL,
	"address" text,
	"landmark" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"pincode" varchar(10),
	"country" varchar(100) DEFAULT 'India',
	"gstin" varchar(15) NOT NULL,
	"bankAccountNumber" varchar(20) NOT NULL,
	"bankName" varchar(255) NOT NULL,
	"bankBranch" varchar(255) NOT NULL,
	"bankIfsc" varchar(11) NOT NULL,
	"bankAccountHolderName" varchar(255) NOT NULL,
	"bankAccountType" varchar(20) NOT NULL,
	"upiId" varchar(255) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"radiusKm" integer DEFAULT 10,
	"phone" varchar(15),
	"email" varchar(255),
	"operatingHours" jsonb,
	"isActive" boolean DEFAULT true,
	"isDefault" boolean DEFAULT false,
	"supportsPickup" boolean DEFAULT true,
	"supportsBopis" boolean DEFAULT true,
	"commissionRate" numeric(5, 2) DEFAULT '0.00',
	"storeManagerName" varchar(255),
	"storeManagerPhone" varchar(15),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "merchant_stores_storeCode_unique" UNIQUE("storeCode")
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchants" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"isActive" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"level" integer DEFAULT 0 NOT NULL,
	"path" text,
	"imageUrl" varchar(500),
	"iconUrl" varchar(500),
	"isActive" boolean DEFAULT true,
	"displayOrder" integer DEFAULT 0,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"metaKeywords" text,
	"attributeTemplate" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."product_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchantId" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"description" text,
	"bundlePrice" numeric(15, 2) NOT NULL,
	"compareAtPrice" numeric(15, 2),
	"discountAmount" numeric(15, 2),
	"discountPercentage" numeric(5, 2),
	"components" jsonb NOT NULL,
	"isActive" boolean DEFAULT true,
	"isAvailable" boolean DEFAULT true,
	"primaryImageUrl" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."product_channel_pricing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid,
	"productVariantId" uuid,
	"bundleId" uuid,
	"channel" varchar(20) NOT NULL,
	"pricingType" varchar(20) DEFAULT 'standard' NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"compareAtPrice" numeric(15, 2),
	"effectiveFrom" timestamp DEFAULT now() NOT NULL,
	"effectiveTo" timestamp,
	"storeId" uuid,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"productId" uuid NOT NULL,
	"variantSku" varchar(100) NOT NULL,
	"variantName" varchar(255) NOT NULL,
	"barcode" varchar(50),
	"attributes" jsonb NOT NULL,
	"price" numeric(15, 2) NOT NULL,
	"compareAtPrice" numeric(15, 2),
	"costPrice" numeric(15, 2),
	"stockAvailable" integer DEFAULT 0 NOT NULL,
	"stockOnOrder" integer DEFAULT 0,
	"lowStockThreshold" integer DEFAULT 5,
	"isActive" boolean DEFAULT true,
	"imageUrl" varchar(500),
	"weight" numeric(10, 2),
	"weightUnit" varchar(10) DEFAULT 'g',
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."products" (
	"id" uuid PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"categoryId" uuid,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"sku" varchar(100) NOT NULL,
	"barcode" varchar(50),
	"productType" varchar(20) DEFAULT 'product' NOT NULL,
	"shortDescription" varchar(500),
	"longDescription" text,
	"basePrice" numeric(15, 2) NOT NULL,
	"compareAtPrice" numeric(15, 2),
	"costPrice" numeric(15, 2),
	"taxRate" numeric(5, 2) DEFAULT '18.00',
	"taxIncluded" boolean DEFAULT true,
	"trackInventory" boolean DEFAULT true,
	"allowBackorder" boolean DEFAULT false,
	"lowStockThreshold" integer DEFAULT 10,
	"isActive" boolean DEFAULT true,
	"isFeatured" boolean DEFAULT false,
	"metaTitle" varchar(255),
	"metaDescription" text,
	"metaKeywords" text,
	"primaryImageUrl" varchar(500),
	"additionalImages" jsonb,
	"attributes" jsonb,
	"weight" numeric(10, 2),
	"weightUnit" varchar(10) DEFAULT 'g',
	"length" numeric(10, 2),
	"width" numeric(10, 2),
	"height" numeric(10, 2),
	"dimensionUnit" varchar(10) DEFAULT 'cm',
	"specifications" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."order_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"orderId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"productVariantId" uuid,
	"bundleId" uuid,
	"productName" varchar(255) NOT NULL,
	"productSku" varchar(100) NOT NULL,
	"variantName" varchar(255),
	"variantSku" varchar(100),
	"quantity" integer NOT NULL,
	"unitPrice" numeric(15, 2) NOT NULL,
	"totalPrice" numeric(15, 2) NOT NULL,
	"discountAmount" numeric(15, 2) DEFAULT '0.00',
	"taxAmount" numeric(15, 2) DEFAULT '0.00',
	"finalPrice" numeric(15, 2) NOT NULL,
	"attributes" jsonb,
	"serviceAddOns" jsonb,
	"fulfillmentStatus" varchar(50) DEFAULT 'pending',
	"shippedAt" timestamp,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"customerId" uuid NOT NULL,
	"merchantId" uuid NOT NULL,
	"storeId" uuid,
	"channel" "channel_type" NOT NULL,
	"fulfillmentType" "fulfillment_type" DEFAULT 'delivery' NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"paymentStatus" "payment_status" DEFAULT 'pending' NOT NULL,
	"subtotalAmount" numeric(15, 2) NOT NULL,
	"discountAmount" numeric(15, 2) DEFAULT '0.00',
	"taxAmount" numeric(15, 2) DEFAULT '0.00',
	"shippingAmount" numeric(15, 2) DEFAULT '0.00',
	"totalAmount" numeric(15, 2) NOT NULL,
	"couponCode" varchar(50),
	"couponDiscount" numeric(15, 2) DEFAULT '0.00',
	"paymentMethod" varchar(50),
	"paymentTransactionId" varchar(255),
	"paymentGateway" varchar(50),
	"deliveryAddress" jsonb,
	"billingAddress" jsonb,
	"expectedDeliveryDate" timestamp,
	"deliveredAt" timestamp,
	"pickupStoreId" uuid,
	"pickupScheduledAt" timestamp,
	"pickupCompletedAt" timestamp,
	"customerNotes" text,
	"giftMessage" text,
	"isGift" boolean DEFAULT false,
	"internalNotes" text,
	"ipAddress" varchar(45),
	"userAgent" text,
	"source" varchar(50),
	"utmSource" varchar(255),
	"utmMedium" varchar(255),
	"utmCampaign" varchar(255),
	"loanApplicationId" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "merchant"."order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orderId" uuid NOT NULL,
	"fromStatus" varchar(50),
	"toStatus" varchar(50) NOT NULL,
	"location" varchar(255),
	"trackingNumber" varchar(255),
	"trackingUrl" varchar(500),
	"notes" text,
	"metadata" jsonb,
	"changedBy" uuid,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."settlement_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settlementId" uuid NOT NULL,
	"orderId" uuid NOT NULL,
	"orderAmount" numeric(15, 2) NOT NULL,
	"commissionAmount" numeric(15, 2) NOT NULL,
	"refundAmount" numeric(15, 2) DEFAULT '0.00',
	"returnAmount" numeric(15, 2) DEFAULT '0.00',
	"cancellationAmount" numeric(15, 2) DEFAULT '0.00',
	"netAmount" numeric(15, 2) NOT NULL,
	"deliveredAt" timestamp NOT NULL,
	"settlementDate" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."settlements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"settlementNumber" varchar(50) NOT NULL,
	"merchantId" uuid NOT NULL,
	"settlementPeriodStart" timestamp NOT NULL,
	"settlementPeriodEnd" timestamp NOT NULL,
	"totalOrders" integer DEFAULT 0 NOT NULL,
	"ordersSettled" integer DEFAULT 0 NOT NULL,
	"totalSalesAmount" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"totalCommission" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"totalRefunds" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"totalReturns" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"totalCancellation" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"adjustments" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"adjustmentNotes" text,
	"netSettlementAmount" numeric(15, 2) NOT NULL,
	"status" "settlement_status" DEFAULT 'pending' NOT NULL,
	"bankAccountNumber" varchar(35) NOT NULL,
	"bankIfsc" varchar(11) NOT NULL,
	"bankAccountName" varchar(255) NOT NULL,
	"initiatedAt" timestamp,
	"processedAt" timestamp,
	"completedAt" timestamp,
	"utr" varchar(50),
	"transactionReference" varchar(255),
	"paymentMethod" varchar(50),
	"failureReason" text,
	"retryCount" integer DEFAULT 0,
	"lastRetryAt" timestamp,
	"settlementReportUrl" varchar(500),
	"invoiceUrl" varchar(500),
	"notes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "settlements_settlementNumber_unique" UNIQUE("settlementNumber")
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_analytics_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"storeId" integer,
	"date" timestamp NOT NULL,
	"period" "analytics_period" DEFAULT 'daily' NOT NULL,
	"totalOrders" integer DEFAULT 0 NOT NULL,
	"totalRevenue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"averageOrderValue" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"totalItemsSold" integer DEFAULT 0 NOT NULL,
	"ordersByChannel" jsonb,
	"ordersByFulfillment" jsonb,
	"revenueByChannel" jsonb,
	"totalProducts" integer DEFAULT 0,
	"lowStockProducts" integer DEFAULT 0,
	"outOfStockProducts" integer DEFAULT 0,
	"inventoryValue" numeric(15, 2) DEFAULT '0.00',
	"topSellingProducts" jsonb,
	"fastMovingProducts" jsonb,
	"slowMovingProducts" jsonb,
	"newCustomers" integer DEFAULT 0,
	"returningCustomers" integer DEFAULT 0,
	"totalCustomers" integer DEFAULT 0,
	"customersByCity" jsonb,
	"customersByGender" jsonb,
	"trafficSource" jsonb,
	"averageFulfillmentTime" numeric(10, 2),
	"fulfillmentRate" numeric(5, 2),
	"returnRate" numeric(5, 2),
	"cancellationRate" numeric(5, 2),
	"averageProductRating" numeric(3, 2),
	"averageServiceRating" numeric(3, 2),
	"totalReviews" integer DEFAULT 0,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_analytics_raw" (
	"id" uuid PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"storeId" uuid,
	"eventType" varchar(50) NOT NULL,
	"eventName" varchar(100) NOT NULL,
	"customerId" uuid,
	"sessionId" varchar(255),
	"productId" uuid,
	"productVariantId" uuid,
	"categoryId" uuid,
	"orderId" uuid,
	"eventProperties" jsonb,
	"channel" varchar(20),
	"source" varchar(50),
	"deviceType" varchar(50),
	"userAgent" text,
	"ipAddress" varchar(45),
	"utmSource" varchar(255),
	"utmMedium" varchar(255),
	"utmCampaign" varchar(255),
	"utmTerm" varchar(255),
	"utmContent" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"country" varchar(100) DEFAULT 'India',
	"occurredAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."qrTable" (
	"id" serial PRIMARY KEY NOT NULL,
	"merchantId" uuid NOT NULL,
	"qrCode" varchar(255) NOT NULL,
	"journeyType" "journey" DEFAULT 'basic',
	"amount" numeric(15, 2),
	"productId" uuid,
	"variantId" uuid,
	"qrCodeData" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared"."session_journey" (
	"id" uuid PRIMARY KEY NOT NULL,
	"page" varchar(255) NOT NULL,
	"productId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."merchant_user_journey" (
	"id" uuid PRIMARY KEY NOT NULL,
	"sessionId" uuid NOT NULL,
	"userId" uuid NOT NULL,
	"page" varchar(255) NOT NULL,
	"productId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "los"."ltv_config" ADD CONSTRAINT "ltv_config_loanProductId_loan_products_id_fk" FOREIGN KEY ("loanProductId") REFERENCES "los"."loan_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."cas_data" ADD CONSTRAINT "cas_data_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."kyc_verification" ADD CONSTRAINT "kyc_verification_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."autopay" ADD CONSTRAINT "autopay_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."loan_applications" ADD CONSTRAINT "loan_applications_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."loan_applications" ADD CONSTRAINT "loan_applications_loanProductId_loan_products_id_fk" FOREIGN KEY ("loanProductId") REFERENCES "los"."loan_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."loan_applications" ADD CONSTRAINT "loan_applications_reviewedBy_users_id_fk" FOREIGN KEY ("reviewedBy") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."mutual_fund_collateral" ADD CONSTRAINT "mutual_fund_collateral_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."documents" ADD CONSTRAINT "documents_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."documents" ADD CONSTRAINT "documents_verifiedBy_users_id_fk" FOREIGN KEY ("verifiedBy") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."loan_sanction" ADD CONSTRAINT "loan_sanction_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."loan_sanction" ADD CONSTRAINT "loan_sanction_sanctionedBy_users_id_fk" FOREIGN KEY ("sanctionedBy") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."approval_workflow" ADD CONSTRAINT "approval_workflow_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "los"."approval_workflow" ADD CONSTRAINT "approval_workflow_approverId_users_id_fk" FOREIGN KEY ("approverId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."disbursement" ADD CONSTRAINT "disbursement_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."disbursement" ADD CONSTRAINT "disbursement_loanSanctionId_loan_sanction_id_fk" FOREIGN KEY ("loanSanctionId") REFERENCES "los"."loan_sanction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."emi_schedule" ADD CONSTRAINT "emi_schedule_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."emi_schedule" ADD CONSTRAINT "emi_schedule_loanSanctionId_loan_sanction_id_fk" FOREIGN KEY ("loanSanctionId") REFERENCES "los"."loan_sanction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."repayment" ADD CONSTRAINT "repayment_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."repayment" ADD CONSTRAINT "repayment_emiScheduleId_emi_schedule_id_fk" FOREIGN KEY ("emiScheduleId") REFERENCES "lms"."emi_schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_account" ADD CONSTRAINT "loan_account_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_account" ADD CONSTRAINT "loan_account_loanSanctionId_loan_sanction_id_fk" FOREIGN KEY ("loanSanctionId") REFERENCES "los"."loan_sanction"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."interest_accrual" ADD CONSTRAINT "interest_accrual_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."interest_rate_history" ADD CONSTRAINT "interest_rate_history_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_fees" ADD CONSTRAINT "loan_fees_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_fees" ADD CONSTRAINT "loan_fees_feeId_fee_master_id_fk" FOREIGN KEY ("feeId") REFERENCES "lms"."fee_master"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."fee_payment" ADD CONSTRAINT "fee_payment_loanFeeId_loan_fees_id_fk" FOREIGN KEY ("loanFeeId") REFERENCES "lms"."loan_fees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."penalty_calculation" ADD CONSTRAINT "penalty_calculation_emiScheduleId_emi_schedule_id_fk" FOREIGN KEY ("emiScheduleId") REFERENCES "lms"."emi_schedule"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_collection_status" ADD CONSTRAINT "loan_collection_status_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_collection_status" ADD CONSTRAINT "loan_collection_status_currentBucket_collection_bucket_id_fk" FOREIGN KEY ("currentBucket") REFERENCES "lms"."collection_bucket"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."collection_activity" ADD CONSTRAINT "collection_activity_loanCollectionStatusId_loan_collection_status_id_fk" FOREIGN KEY ("loanCollectionStatusId") REFERENCES "lms"."loan_collection_status"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."recovery_proceeding" ADD CONSTRAINT "recovery_proceeding_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."loan_restructuring" ADD CONSTRAINT "loan_restructuring_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."restructuring_terms" ADD CONSTRAINT "restructuring_terms_loanRestructuringId_loan_restructuring_id_fk" FOREIGN KEY ("loanRestructuringId") REFERENCES "lms"."loan_restructuring"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."interest_rate_adjustment" ADD CONSTRAINT "interest_rate_adjustment_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."top_up_loan" ADD CONSTRAINT "top_up_loan_parentLoanAccountId_loan_account_id_fk" FOREIGN KEY ("parentLoanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lms"."tenure_change" ADD CONSTRAINT "tenure_change_loanAccountId_loan_account_id_fk" FOREIGN KEY ("loanAccountId") REFERENCES "lms"."loan_account"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD CONSTRAINT "merchant_kyc_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_settlement_config" ADD CONSTRAINT "merchant_settlement_config_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD CONSTRAINT "merchant_stores_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."product_bundles" ADD CONSTRAINT "product_bundles_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."product_channel_pricing" ADD CONSTRAINT "product_channel_pricing_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."product_channel_pricing" ADD CONSTRAINT "product_channel_pricing_productVariantId_product_variants_id_fk" FOREIGN KEY ("productVariantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."product_channel_pricing" ADD CONSTRAINT "product_channel_pricing_bundleId_product_bundles_id_fk" FOREIGN KEY ("bundleId") REFERENCES "merchant"."product_bundles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."product_variants" ADD CONSTRAINT "product_variants_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."products" ADD CONSTRAINT "products_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."products" ADD CONSTRAINT "products_categoryId_merchant_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "merchant"."merchant_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."order_items" ADD CONSTRAINT "order_items_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "merchant"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."orders" ADD CONSTRAINT "orders_customerId_users_id_fk" FOREIGN KEY ("customerId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."orders" ADD CONSTRAINT "orders_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."orders" ADD CONSTRAINT "orders_storeId_merchant_stores_id_fk" FOREIGN KEY ("storeId") REFERENCES "merchant"."merchant_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."orders" ADD CONSTRAINT "orders_pickupStoreId_merchant_stores_id_fk" FOREIGN KEY ("pickupStoreId") REFERENCES "merchant"."merchant_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."order_status_history" ADD CONSTRAINT "order_status_history_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "merchant"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."settlement_orders" ADD CONSTRAINT "settlement_orders_settlementId_settlements_id_fk" FOREIGN KEY ("settlementId") REFERENCES "merchant"."settlements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."settlement_orders" ADD CONSTRAINT "settlement_orders_orderId_orders_id_fk" FOREIGN KEY ("orderId") REFERENCES "merchant"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."settlements" ADD CONSTRAINT "settlements_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_analytics_daily" ADD CONSTRAINT "merchant_analytics_daily_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."qrTable" ADD CONSTRAINT "qrTable_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."qrTable" ADD CONSTRAINT "qrTable_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."qrTable" ADD CONSTRAINT "qrTable_variantId_products_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ADD CONSTRAINT "session_journey_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ADD CONSTRAINT "session_journey_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" ADD CONSTRAINT "merchant_user_journey_sessionId_session_journey_id_fk" FOREIGN KEY ("sessionId") REFERENCES "shared"."session_journey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" ADD CONSTRAINT "merchant_user_journey_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" ADD CONSTRAINT "merchant_user_journey_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" ADD CONSTRAINT "merchant_user_journey_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kyc_user" ON "los"."kyc_verification" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "kyc_aadhaar" ON "los"."kyc_verification" USING btree ("aadhaarNumber");--> statement-breakpoint
CREATE INDEX "kyc_pan" ON "los"."kyc_verification" USING btree ("panNumber");--> statement-breakpoint
CREATE INDEX "txn_user_id" ON "users"."transactions" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "txn_order_id" ON "users"."transactions" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "txn_cf_payment_id" ON "users"."transactions" USING btree ("cfPaymentId");--> statement-breakpoint
CREATE INDEX "txn_status" ON "users"."transactions" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "autopay_user_id" ON "users"."autopay" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "autopay_sub_id" ON "users"."autopay" USING btree ("subscriptionId");--> statement-breakpoint
CREATE INDEX "autopay_status" ON "users"."autopay" USING btree ("subscriptionStatus");--> statement-breakpoint
CREATE INDEX "loan_app_user_id" ON "los"."loan_applications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "loan_app_number" ON "los"."loan_applications" USING btree ("applicationNumber");--> statement-breakpoint
CREATE INDEX "loan_app_status" ON "los"."loan_applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_app_created" ON "los"."loan_applications" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "mf_collateral_loan_app" ON "los"."mutual_fund_collateral" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "mf_collateral_folio" ON "los"."mutual_fund_collateral" USING btree ("folioNumber");--> statement-breakpoint
CREATE INDEX "mf_collateral_lien_ref" ON "los"."mutual_fund_collateral" USING btree ("lienRefNo");--> statement-breakpoint
CREATE INDEX "docs_loan_app" ON "los"."documents" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "docs_type" ON "los"."documents" USING btree ("documentType");--> statement-breakpoint
CREATE INDEX "docs_status" ON "los"."documents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sanction_loan_app" ON "los"."loan_sanction" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "sanction_letter" ON "los"."loan_sanction" USING btree ("sanctionLetterNumber");--> statement-breakpoint
CREATE INDEX "sanction_date" ON "los"."loan_sanction" USING btree ("sanctionDate");--> statement-breakpoint
CREATE INDEX "approval_loan_app" ON "los"."approval_workflow" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "approval_approver" ON "los"."approval_workflow" USING btree ("approverId");--> statement-breakpoint
CREATE INDEX "approval_status" ON "los"."approval_workflow" USING btree ("status");--> statement-breakpoint
CREATE INDEX "disb_loan_app" ON "lms"."disbursement" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "disb_utr" ON "lms"."disbursement" USING btree ("utrNumber");--> statement-breakpoint
CREATE INDEX "disb_status" ON "lms"."disbursement" USING btree ("status");--> statement-breakpoint
CREATE INDEX "disb_date" ON "lms"."disbursement" USING btree ("disbursementDate");--> statement-breakpoint
CREATE INDEX "emi_loan_app" ON "lms"."emi_schedule" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "emi_due_date" ON "lms"."emi_schedule" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "emi_status" ON "lms"."emi_schedule" USING btree ("status");--> statement-breakpoint
CREATE INDEX "emi_installment" ON "lms"."emi_schedule" USING btree ("loanApplicationId","installmentNumber");--> statement-breakpoint
CREATE INDEX "repayment_loan_app" ON "lms"."repayment" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "repayment_emi" ON "lms"."repayment" USING btree ("emiScheduleId");--> statement-breakpoint
CREATE INDEX "repayment_txn" ON "lms"."repayment" USING btree ("transactionReference");--> statement-breakpoint
CREATE INDEX "repayment_date" ON "lms"."repayment" USING btree ("paymentDate");--> statement-breakpoint
CREATE INDEX "loan_acc_loan_app" ON "lms"."loan_account" USING btree ("loanApplicationId");--> statement-breakpoint
CREATE INDEX "loan_acc_number" ON "lms"."loan_account" USING btree ("accountNumber");--> statement-breakpoint
CREATE INDEX "loan_acc_status" ON "lms"."loan_account" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_acc_next_emi" ON "lms"."loan_account" USING btree ("nextEmiDueDate");--> statement-breakpoint
CREATE INDEX "int_accr_loan_acc" ON "lms"."interest_accrual" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "int_accr_date" ON "lms"."interest_accrual" USING btree ("accrualDate");--> statement-breakpoint
CREATE INDEX "int_accr_posted" ON "lms"."interest_accrual" USING btree ("postedToLedger");--> statement-breakpoint
CREATE INDEX "int_accr_loan_date" ON "lms"."interest_accrual" USING btree ("loanAccountId","accrualDate");--> statement-breakpoint
CREATE INDEX "int_rate_hist_loan_acc" ON "lms"."interest_rate_history" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "int_rate_hist_eff_date" ON "lms"."interest_rate_history" USING btree ("effectiveDate");--> statement-breakpoint
CREATE INDEX "int_rate_hist_loan_date" ON "lms"."interest_rate_history" USING btree ("loanAccountId","effectiveDate");--> statement-breakpoint
CREATE INDEX "accrual_log_run_date" ON "lms"."accrual_run_log" USING btree ("runDate");--> statement-breakpoint
CREATE INDEX "accrual_log_status" ON "lms"."accrual_run_log" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fee_master_code" ON "lms"."fee_master" USING btree ("feeCode");--> statement-breakpoint
CREATE INDEX "fee_master_type" ON "lms"."fee_master" USING btree ("feeType");--> statement-breakpoint
CREATE INDEX "fee_master_active" ON "lms"."fee_master" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "loan_fees_loan_acc" ON "lms"."loan_fees" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "loan_fees_fee_id" ON "lms"."loan_fees" USING btree ("feeId");--> statement-breakpoint
CREATE INDEX "loan_fees_status" ON "lms"."loan_fees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_fees_due_date" ON "lms"."loan_fees" USING btree ("dueDate");--> statement-breakpoint
CREATE INDEX "fee_pay_loan_fee" ON "lms"."fee_payment" USING btree ("loanFeeId");--> statement-breakpoint
CREATE INDEX "fee_pay_date" ON "lms"."fee_payment" USING btree ("paymentDate");--> statement-breakpoint
CREATE INDEX "fee_pay_utr" ON "lms"."fee_payment" USING btree ("utrNumber");--> statement-breakpoint
CREATE INDEX "penalty_emi_sched" ON "lms"."penalty_calculation" USING btree ("emiScheduleId");--> statement-breakpoint
CREATE INDEX "penalty_calc_date" ON "lms"."penalty_calculation" USING btree ("calculatedDate");--> statement-breakpoint
CREATE INDEX "penalty_waived" ON "lms"."penalty_calculation" USING btree ("waived");--> statement-breakpoint
CREATE INDEX "coll_bucket_code" ON "lms"."collection_bucket" USING btree ("bucketCode");--> statement-breakpoint
CREATE INDEX "coll_bucket_active" ON "lms"."collection_bucket" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "coll_bucket_dpd" ON "lms"."collection_bucket" USING btree ("minDpdDays","maxDpdDays");--> statement-breakpoint
CREATE INDEX "loan_coll_status_loan_acc" ON "lms"."loan_collection_status" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "loan_coll_status_bucket" ON "lms"."loan_collection_status" USING btree ("currentBucket");--> statement-breakpoint
CREATE INDEX "loan_coll_status_dpd" ON "lms"."loan_collection_status" USING btree ("dpdDays");--> statement-breakpoint
CREATE INDEX "loan_coll_status_assigned" ON "lms"."loan_collection_status" USING btree ("assignedTo");--> statement-breakpoint
CREATE INDEX "loan_coll_status_npa" ON "lms"."loan_collection_status" USING btree ("npaCategory");--> statement-breakpoint
CREATE INDEX "coll_act_status" ON "lms"."collection_activity" USING btree ("loanCollectionStatusId");--> statement-breakpoint
CREATE INDEX "coll_act_date" ON "lms"."collection_activity" USING btree ("activityDate");--> statement-breakpoint
CREATE INDEX "coll_act_type" ON "lms"."collection_activity" USING btree ("activityType");--> statement-breakpoint
CREATE INDEX "coll_act_assigned" ON "lms"."collection_activity" USING btree ("assignedTo");--> statement-breakpoint
CREATE INDEX "rec_proc_loan_acc" ON "lms"."recovery_proceeding" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "rec_proc_type" ON "lms"."recovery_proceeding" USING btree ("proceedingType");--> statement-breakpoint
CREATE INDEX "rec_proc_stage" ON "lms"."recovery_proceeding" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "rec_proc_status" ON "lms"."recovery_proceeding" USING btree ("status");--> statement-breakpoint
CREATE INDEX "rec_proc_case_num" ON "lms"."recovery_proceeding" USING btree ("caseNumber");--> statement-breakpoint
CREATE INDEX "loan_restruct_loan_acc" ON "lms"."loan_restructuring" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "loan_restruct_status" ON "lms"."loan_restructuring" USING btree ("status");--> statement-breakpoint
CREATE INDEX "loan_restruct_req_date" ON "lms"."loan_restructuring" USING btree ("requestedDate");--> statement-breakpoint
CREATE INDEX "int_rate_adj_loan_acc" ON "lms"."interest_rate_adjustment" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "int_rate_adj_eff" ON "lms"."interest_rate_adjustment" USING btree ("effectiveFrom");--> statement-breakpoint
CREATE INDEX "int_rate_adj_restruct" ON "lms"."interest_rate_adjustment" USING btree ("linkedToRestructuring");--> statement-breakpoint
CREATE INDEX "top_up_parent_loan" ON "lms"."top_up_loan" USING btree ("parentLoanAccountId");--> statement-breakpoint
CREATE INDEX "top_up_status" ON "lms"."top_up_loan" USING btree ("status");--> statement-breakpoint
CREATE INDEX "top_up_app_date" ON "lms"."top_up_loan" USING btree ("approvedDate");--> statement-breakpoint
CREATE INDEX "tenure_change_loan_acc" ON "lms"."tenure_change" USING btree ("loanAccountId");--> statement-breakpoint
CREATE INDEX "tenure_change_eff" ON "lms"."tenure_change" USING btree ("effectiveDate");--> statement-breakpoint
CREATE INDEX "settlement_config_merchant" ON "merchant"."merchant_settlement_config" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "store_merchant_id" ON "merchant"."merchant_stores" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "store_code" ON "merchant"."merchant_stores" USING btree ("storeCode");--> statement-breakpoint
CREATE INDEX "store_type" ON "merchant"."merchant_stores" USING btree ("storeType");--> statement-breakpoint
CREATE INDEX "store_location" ON "merchant"."merchant_stores" USING btree ("latitude","longitude");--> statement-breakpoint
CREATE INDEX "store_active" ON "merchant"."merchant_stores" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "category_merchant" ON "merchant"."merchant_categories" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "category_slug" ON "merchant"."merchant_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "category_active" ON "merchant"."merchant_categories" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "category_display_order" ON "merchant"."merchant_categories" USING btree ("displayOrder");--> statement-breakpoint
CREATE INDEX "bundle_merchant" ON "merchant"."product_bundles" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "bundle_sku" ON "merchant"."product_bundles" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "bundle_slug" ON "merchant"."product_bundles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "bundle_active" ON "merchant"."product_bundles" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "channel_price_product" ON "merchant"."product_channel_pricing" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "channel_price_variant" ON "merchant"."product_channel_pricing" USING btree ("productVariantId");--> statement-breakpoint
CREATE INDEX "channel_price_bundle" ON "merchant"."product_channel_pricing" USING btree ("bundleId");--> statement-breakpoint
CREATE INDEX "channel_price_channel" ON "merchant"."product_channel_pricing" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "channel_price_store" ON "merchant"."product_channel_pricing" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "channel_price_active" ON "merchant"."product_channel_pricing" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "channel_price_dates" ON "merchant"."product_channel_pricing" USING btree ("effectiveFrom","effectiveTo");--> statement-breakpoint
CREATE INDEX "variant_product" ON "merchant"."product_variants" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "variant_sku" ON "merchant"."product_variants" USING btree ("variantSku");--> statement-breakpoint
CREATE INDEX "variant_barcode" ON "merchant"."product_variants" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "variant_active" ON "merchant"."product_variants" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "variant_stock" ON "merchant"."product_variants" USING btree ("stockAvailable");--> statement-breakpoint
CREATE INDEX "product_merchant" ON "merchant"."products" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "product_category" ON "merchant"."products" USING btree ("categoryId");--> statement-breakpoint
CREATE INDEX "product_sku" ON "merchant"."products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX "product_slug" ON "merchant"."products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_barcode" ON "merchant"."products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX "product_active" ON "merchant"."products" USING btree ("isActive");--> statement-breakpoint
CREATE INDEX "product_featured" ON "merchant"."products" USING btree ("isFeatured");--> statement-breakpoint
CREATE INDEX "product_created" ON "merchant"."products" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "order_item_order" ON "merchant"."order_items" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "order_item_product" ON "merchant"."order_items" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "order_item_variant" ON "merchant"."order_items" USING btree ("productVariantId");--> statement-breakpoint
CREATE INDEX "order_item_bundle" ON "merchant"."order_items" USING btree ("bundleId");--> statement-breakpoint
CREATE INDEX "order_item_fulfillment" ON "merchant"."order_items" USING btree ("fulfillmentStatus");--> statement-breakpoint
CREATE INDEX "order_number" ON "merchant"."orders" USING btree ("orderNumber");--> statement-breakpoint
CREATE INDEX "order_customer" ON "merchant"."orders" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "order_merchant" ON "merchant"."orders" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "order_store" ON "merchant"."orders" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "order_status" ON "merchant"."orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "order_payment_status" ON "merchant"."orders" USING btree ("paymentStatus");--> statement-breakpoint
CREATE INDEX "order_channel" ON "merchant"."orders" USING btree ("channel");--> statement-breakpoint
CREATE INDEX "order_fulfillment" ON "merchant"."orders" USING btree ("fulfillmentType");--> statement-breakpoint
CREATE INDEX "order_created" ON "merchant"."orders" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "order_pickup_store" ON "merchant"."orders" USING btree ("pickupStoreId");--> statement-breakpoint
CREATE INDEX "status_history_order" ON "merchant"."order_status_history" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "status_history_to_status" ON "merchant"."order_status_history" USING btree ("toStatus");--> statement-breakpoint
CREATE INDEX "status_history_created" ON "merchant"."order_status_history" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "settlement_order_settlement" ON "merchant"."settlement_orders" USING btree ("settlementId");--> statement-breakpoint
CREATE INDEX "settlement_order_order" ON "merchant"."settlement_orders" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "settlement_order_date" ON "merchant"."settlement_orders" USING btree ("settlementDate");--> statement-breakpoint
CREATE INDEX "settlement_order_delivered" ON "merchant"."settlement_orders" USING btree ("deliveredAt");--> statement-breakpoint
CREATE INDEX "settlement_number" ON "merchant"."settlements" USING btree ("settlementNumber");--> statement-breakpoint
CREATE INDEX "settlement_merchant" ON "merchant"."settlements" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "settlement_period" ON "merchant"."settlements" USING btree ("settlementPeriodStart","settlementPeriodEnd");--> statement-breakpoint
CREATE INDEX "settlement_status" ON "merchant"."settlements" USING btree ("status");--> statement-breakpoint
CREATE INDEX "settlement_utr" ON "merchant"."settlements" USING btree ("utr");--> statement-breakpoint
CREATE INDEX "settlement_completed" ON "merchant"."settlements" USING btree ("completedAt");--> statement-breakpoint
CREATE INDEX "settlement_created" ON "merchant"."settlements" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "analytics_daily_merchant" ON "merchant"."merchant_analytics_daily" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "analytics_daily_store" ON "merchant"."merchant_analytics_daily" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "analytics_daily_date" ON "merchant"."merchant_analytics_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX "analytics_daily_period" ON "merchant"."merchant_analytics_daily" USING btree ("period");--> statement-breakpoint
CREATE INDEX "analytics_daily_merchant_date" ON "merchant"."merchant_analytics_daily" USING btree ("merchantId","date");--> statement-breakpoint
CREATE INDEX "analytics_raw_merchant" ON "merchant"."merchant_analytics_raw" USING btree ("merchantId");--> statement-breakpoint
CREATE INDEX "analytics_raw_store" ON "merchant"."merchant_analytics_raw" USING btree ("storeId");--> statement-breakpoint
CREATE INDEX "analytics_raw_type" ON "merchant"."merchant_analytics_raw" USING btree ("eventType");--> statement-breakpoint
CREATE INDEX "analytics_raw_customer" ON "merchant"."merchant_analytics_raw" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "analytics_raw_product" ON "merchant"."merchant_analytics_raw" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "analytics_raw_order" ON "merchant"."merchant_analytics_raw" USING btree ("orderId");--> statement-breakpoint
CREATE INDEX "analytics_raw_occurred" ON "merchant"."merchant_analytics_raw" USING btree ("occurredAt");--> statement-breakpoint
CREATE INDEX "analytics_raw_session" ON "merchant"."merchant_analytics_raw" USING btree ("sessionId");--> statement-breakpoint
CREATE INDEX "analytics_raw_merchant_event" ON "merchant"."merchant_analytics_raw" USING btree ("merchantId","eventType");--> statement-breakpoint
CREATE INDEX "user_journey_page" ON "users"."merchant_user_journey" USING btree ("page");--> statement-breakpoint
CREATE INDEX "user_journey_product" ON "users"."merchant_user_journey" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "user_journey_variant" ON "users"."merchant_user_journey" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "user_journey_created" ON "users"."merchant_user_journey" USING btree ("createdAt");