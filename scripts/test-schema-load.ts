
import * as schema from "../src/db/schema/index";

console.log("Checking schema exports...");
const keys = Object.keys(schema);
console.log(`Total exported keys: ${keys.length}`);

if (keys.includes('loanProductsTable')) {
    console.log("✅ loanProductsTable is exported.");
    // @ts-ignore
    console.log("Value:", schema.loanProductsTable);
} else {
    console.log("❌ loanProductsTable is NOT exported.");
}

if (keys.includes('ltvConfigTable')) {
    console.log("✅ ltvConfigTable is exported.");
} else {
    console.log("❌ ltvConfigTable is NOT exported.");
}

console.log("Exported keys:", keys);
