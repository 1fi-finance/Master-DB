CREATE TABLE "shared"."api_keys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"secret" varchar(255) NOT NULL,
	"key" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
