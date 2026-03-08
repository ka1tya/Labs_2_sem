"use strict";

const { daysGenerator, iterateWithTimeout } = require("days-iterator-lib");

//Example 1
console.log("=== Example 1: Manual generator stepping ===");
const gen1 = daysGenerator();

for (let i = 0; i < 9; i++) {
  const { value } = gen1.next();
  console.log(`Step ${i + 1}: ${value}`);
}

//Example 2
console.log("\n=== Example 2: Auto-iterate for 5 seconds ===");
const gen2 = daysGenerator();
iterateWithTimeout(gen2, 5);

//Example 3:
setTimeout(() => {
  console.log("\n=== Example 3: Auto-iterate for 3 seconds ===");
  const gen3 = daysGenerator();
  iterateWithTimeout(gen3, 3);
}, 6500);
