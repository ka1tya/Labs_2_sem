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

function filterPromise(arr, check, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(new Error("Filter was cancelled"));

    signal.addEventListener("abort", () => {
      reject(new Error("Filter was cancelled"));
    });

    const checks = arr.map((item, i) =>
      check(item, i).then((pass) => ({ i, item, pass })),
    );

    Promise.all(checks)
      .then((results) => {
        const result = results
          .filter((x) => x.pass)
          .sort((a, b) => a.i - b.i)
          .map((x) => x.item);

        resolve(result);
      })
      .catch(reject);
  });
}
