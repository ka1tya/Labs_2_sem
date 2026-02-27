"use strict";

function* daysGenerator() {
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  while (true) {
    for (const day of days) {
      yield day;
    }
  }
}

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

const gen = daysGenerator();
iterateWithTimeout(gen, 10);
