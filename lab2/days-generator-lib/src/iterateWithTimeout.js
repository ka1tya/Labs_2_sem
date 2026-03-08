"use strict";

function iterateWithTimeout(iterator, seconds, onValue, onEnd) {
  const startTime = Date.now();
  let iteration = 0;

  const interval = setInterval(() => {
    const now = Date.now();
    if ((now - startTime) / 1000 >= seconds) {
      clearInterval(interval);
      if (onEnd) onEnd("timeout");
      else console.log("Time is over!");
      return;
    }

    const { value, done } = iterator.next();
    if (done) {
      clearInterval(interval);
      if (onEnd) onEnd("done");
      return;
    }

    iteration++;
    if (onValue) {
      onValue(iteration, value);
    } else {
      console.log(`Iteration ${iteration}: ${value}`);
    }
  }, 1000);
}

module.exports = { iterateWithTimeout };
