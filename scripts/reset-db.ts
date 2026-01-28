import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    await client.connect();

    console.log("Dropping schemas...");
    await client.query(`DROP SCHEMA IF EXISTS "los" CASCADE;`);
    await client.query(`DROP SCHEMA IF EXISTS "lms" CASCADE;`);
    await client.query(`DROP SCHEMA IF EXISTS "merchant" CASCADE;`);
    await client.query(`DROP SCHEMA IF EXISTS "users" CASCADE;`);
    await client.query(`DROP SCHEMA IF EXISTS "shared" CASCADE;`);
    await client.query(`DROP SCHEMA IF EXISTS "public" CASCADE;`);
    await client.query(`CREATE SCHEMA "public";`);

    console.log("Schemas dropped successfully.");
    await client.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
