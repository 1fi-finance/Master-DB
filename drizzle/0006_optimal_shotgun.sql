CREATE TYPE "public"."gst_verification_status" AS ENUM('pending', 'verified', 'inactive', 'invalid', 'failed', 'mismatch');--> statement-breakpoint
CREATE TABLE "shared"."cors_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service" varchar(50) NOT NULL,
	"origin" varchar(255) NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstVerificationStatus" "gst_verification_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstVerifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstVerificationData" jsonb;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstLegalName" varchar(255);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstTradeName" varchar(255);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstConstitution" varchar(100);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstType" varchar(50);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstState" varchar(100);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstStateCode" varchar(10);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstRegisteredDate" varchar(20);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstActive" boolean;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_kyc" ADD COLUMN "gstEinvoiceEnabled" boolean;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstVerificationStatus" "gst_verification_status" DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstVerifiedAt" timestamp;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstVerificationData" jsonb;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstLegalName" varchar(255);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstTradeName" varchar(255);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstConstitution" varchar(100);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstType" varchar(50);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstState" varchar(100);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstStateCode" varchar(10);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstRegisteredDate" varchar(20);--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstActive" boolean;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_stores" ADD COLUMN "gstEinvoiceEnabled" boolean;