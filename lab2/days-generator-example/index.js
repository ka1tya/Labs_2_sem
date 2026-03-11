"use strict";

const { daysGenerator, iterateWithTimeout } = require("days-iterator-lib");

//Example 1
console.log("Example 1: ");
const gen1 = daysGenerator();

for (let i = 0; i < 9; i++) {
  const { value } = gen1.next();
  console.log(`Step ${i + 1}: ${value}`);
}

//Example 2
console.log("\nExample 2: ");
const gen2 = daysGenerator();
iterateWithTimeout(gen2, 5);

//Example 3:
setTimeout(() => {
  console.log("\nExample 3: ");
  const gen3 = daysGenerator();
  iterateWithTimeout(gen3, 3);
}, 6500);
