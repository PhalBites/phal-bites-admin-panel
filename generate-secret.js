const crypto = require("crypto");

const secret = crypto.randomBytes(32).toString("hex");

console.log("\n=== YOUR NEXTAUTH SECRET ===");
console.log(secret);
console.log("===========================\n");
console.log("Add this to your .env.local file:");
console.log(`NEXTAUTH_SECRET=${secret}\n`);
