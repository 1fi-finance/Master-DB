
try {
    console.log("Importing los/products...");
    const products = require("../src/db/schema/los/products");
    console.log("los/products exports:", Object.keys(products));
} catch (e) {
    console.error("Error importing los/products:", e);
}

try {
    console.log("Importing los/applications...");
    const apps = require("../src/db/schema/los/applications");
    console.log("los/applications exports:", Object.keys(apps));
} catch (e) {
    console.error("Error importing los/applications:", e);
}
