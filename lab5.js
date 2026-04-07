const wait = (ms) => new Promise((done) => setTimeout(done, ms));

function filterCallback(arr, check, done, signal) {
  const kept = [];
  let waiting = arr.length;

  if (waiting === 0) return done(null, []);

  if (signal.aborted) return done(new Error("Filter was cancelled"));

  signal.addEventListener("abort", () => {
    done(new Error("Filter was cancelled"));
  });

  arr.forEach((item, i) => {
    if (signal.aborted) return;

    check(item, i, (err, pass) => {
      if (signal.aborted) return;
      if (err) return done(err);
      if (pass) kept.push({ i, item });
      waiting--;

      if (waiting === 0) {
        const result = kept.sort((a, b) => a.i - b.i).map((x) => x.item);
        done(null, result);
      }
    });
  });
}
