CREATE TABLE "merchant"."emi_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"planName" varchar(255) NOT NULL,
	"tenure" integer NOT NULL,
	"interestRate" numeric(15, 2) NOT NULL,
	"processingFee" numeric(15, 2) NOT NULL,
	"minAmount" numeric(15, 2) NOT NULL,
	"maxAmount" numeric(15, 2) NOT NULL,
	"downPaymentTenure" integer DEFAULT 0 NOT NULL,
	"minDownPayment" numeric(15, 2) DEFAULT '0' NOT NULL,
	"planType" varchar(50) DEFAULT 'standard' NOT NULL,
	"cashbackAmount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"processingFeeType" varchar(20) DEFAULT 'fixed' NOT NULL,
	"planDescription" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_emi_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchantId" uuid NOT NULL,
	"emiPlanId" uuid NOT NULL,
	"processingFee" numeric(15, 2) NOT NULL,
	"processingFeeType" varchar(20) DEFAULT 'fixed' NOT NULL,
	"overrideInterestRate" boolean DEFAULT false NOT NULL,
	"subvention" numeric(15, 2) NOT NULL,
	"subventionType" varchar(20) DEFAULT 'percentage' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "merchant"."merchant_variant_emi_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"merchantId" uuid NOT NULL,
	"variantId" uuid NOT NULL,
	"emiPlanId" uuid NOT NULL,
	"processingFee" numeric(15, 2) NOT NULL,
	"processingFeeType" varchar(20) DEFAULT 'fixed' NOT NULL,
	"overrideInterestRate" boolean DEFAULT false NOT NULL,
	"subvention" numeric(15, 2) NOT NULL,
	"subventionType" varchar(20) DEFAULT 'percentage' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shared"."cors" (
	"id" uuid PRIMARY KEY NOT NULL,
	"origin" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users"."logged_in_user_journey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"journeySessionId" uuid NOT NULL,
	"sessionId" uuid,
	"userId" uuid NOT NULL,
	"page" varchar(255) NOT NULL,
	"productId" uuid,
	"variantId" uuid,
	"loanApplicationId" uuid,
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users"."merchant_user_journey" CASCADE;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ALTER COLUMN "productId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ALTER COLUMN "variantId" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ADD COLUMN "journeySessionId" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "shared"."session_journey" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_emi_plans" ADD CONSTRAINT "merchant_emi_plans_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_emi_plans" ADD CONSTRAINT "merchant_emi_plans_emiPlanId_emi_plans_id_fk" FOREIGN KEY ("emiPlanId") REFERENCES "merchant"."emi_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_variant_emi_plans" ADD CONSTRAINT "merchant_variant_emi_plans_merchantId_merchants_id_fk" FOREIGN KEY ("merchantId") REFERENCES "merchant"."merchants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_variant_emi_plans" ADD CONSTRAINT "merchant_variant_emi_plans_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "merchant"."merchant_variant_emi_plans" ADD CONSTRAINT "merchant_variant_emi_plans_emiPlanId_emi_plans_id_fk" FOREIGN KEY ("emiPlanId") REFERENCES "merchant"."emi_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."logged_in_user_journey" ADD CONSTRAINT "logged_in_user_journey_sessionId_session_journey_id_fk" FOREIGN KEY ("sessionId") REFERENCES "shared"."session_journey"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."logged_in_user_journey" ADD CONSTRAINT "logged_in_user_journey_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "users"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."logged_in_user_journey" ADD CONSTRAINT "logged_in_user_journey_productId_products_id_fk" FOREIGN KEY ("productId") REFERENCES "merchant"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."logged_in_user_journey" ADD CONSTRAINT "logged_in_user_journey_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users"."logged_in_user_journey" ADD CONSTRAINT "logged_in_user_journey_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "logged_in_journey_session_id" ON "users"."logged_in_user_journey" USING btree ("journeySessionId");--> statement-breakpoint
CREATE INDEX "user_journey_page" ON "users"."logged_in_user_journey" USING btree ("page");--> statement-breakpoint
CREATE INDEX "user_journey_product" ON "users"."logged_in_user_journey" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "user_journey_variant" ON "users"."logged_in_user_journey" USING btree ("variantId");--> statement-breakpoint
CREATE INDEX "user_journey_created" ON "users"."logged_in_user_journey" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "session_journey_session_id" ON "shared"."session_journey" USING btree ("journeySessionId");--> statement-breakpoint
CREATE INDEX "session_journey_created" ON "shared"."session_journey" USING btree ("createdAt");