-- Dynamic CORS Configuration Migration
-- Creates enhanced CORS configuration table for service-specific dynamic CORS management

-- Create new enhanced CORS configuration table
CREATE TABLE "shared"."cors_config" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "service" varchar(50) NOT NULL,
    "origin" varchar(255) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL,
    "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX "cors_config_service_idx" ON "shared"."cors_config"("service");
CREATE INDEX "cors_config_is_active_idx" ON "shared"."cors_config"("isActive");
CREATE INDEX "cors_config_service_active_idx" ON "shared"."cors_config"("service", "isActive");

-- Insert default configurations for development
INSERT INTO "shared"."cors_config" ("service", "origin", "isActive") VALUES
    ('*', 'http://localhost:3000', true),
    ('*', 'http://localhost:4000', true),
    ('*', 'http://localhost:5000', true),
    ('*', 'http://localhost:5173', true),
    ('mms', 'https://merchant.1fi.in', true),
    ('los', 'https://los.1fi.in', true);
