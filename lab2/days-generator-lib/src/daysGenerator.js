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

module.exports = { daysGenerator };
