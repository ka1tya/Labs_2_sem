"use strict";

function iterateWithTimeout(iterator, seconds) {
  const startTime = Date.now();
  let iteration = 0;

  const interval = setInterval(() => {
    const now = Date.now();
    if ((now - startTime) / 1000 >= seconds) {
      console.log("Time is over!");
      clearInterval(interval);
      return;
    }

    const { value, done } = iterator.next();
    if (done) {
      clearInterval(interval);
      return;
    }

    iteration++;
    console.log(`Iteration ${iteration}: ${value}`);
  }, 1000);
}

module.exports = { iterateWithTimeout };
