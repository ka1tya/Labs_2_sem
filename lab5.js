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

    check(item, (err, pass) => {
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

const numbers = [5, 22, 3, 8, 15];
const isOdd = (num) => num % 2 !== 0;

async function runDemos() {
  await new Promise((resolve) => {
    const controller1 = new AbortController();

    filterCallback(
      numbers,
      (num, next) => setTimeout(() => next(null, isOdd(num)), 100),
      (err, result) => {
        if (err) console.error(err.message);
        else console.log("Result:", result);
        resolve();
      },
      controller1.signal,
    );
  });

  const controller2 = new AbortController();

  await filterPromise(
    numbers,
    async (num) => {
      await wait(80);
      return isOdd(num);
    },
    controller2.signal,
  ).then((result) => console.log("Result:", result));

  const controller3 = new AbortController();

  const result = await filterPromise(
    numbers,
    async (num) => {
      await wait(60);
      return isOdd(num);
    },
    controller3.signal,
  );
  console.log("Result:", result);

  await new Promise((resolve) => {
    const controller4 = new AbortController();

    filterCallback(
      numbers,
      (num, next) => setTimeout(() => next(null, isOdd(num)), 300),
      (err, result) => {
        if (err) console.log(err.message);
        else console.log("Result:", result);
        resolve();
      },
      controller4.signal,
    );

    setTimeout(() => {
      controller4.abort();
    }, 100);
  });

  const controller5 = new AbortController();
  setTimeout(() => controller5.abort(), 100);

  await filterPromise(
    numbers,
    async (num) => {
      await wait(400);
      return isOdd(num);
    },
    controller5.signal,
  )
    .then((result) => console.log("Result:", result))
    .catch((err) => console.log(err.message));
}

runDemos().catch(console.error);
