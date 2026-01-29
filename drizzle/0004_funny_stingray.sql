ALTER TABLE "merchant"."qrTable" DROP CONSTRAINT IF EXISTS "qrTable_variantId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "users"."merchant_user_journey" ADD COLUMN IF NOT EXISTS "loanApplicationId" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "merchant"."qrTable" ADD CONSTRAINT "qrTable_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users"."merchant_user_journey" ADD CONSTRAINT "merchant_user_journey_loanApplicationId_loan_applications_id_fk" FOREIGN KEY ("loanApplicationId") REFERENCES "los"."loan_applications"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;