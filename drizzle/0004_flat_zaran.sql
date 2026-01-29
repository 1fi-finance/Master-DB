ALTER TABLE "merchant"."qrTable" DROP CONSTRAINT "qrTable_variantId_products_id_fk";
--> statement-breakpoint
ALTER TABLE "merchant"."qrTable" ADD CONSTRAINT "qrTable_variantId_product_variants_id_fk" FOREIGN KEY ("variantId") REFERENCES "merchant"."product_variants"("id") ON DELETE cascade ON UPDATE no action;