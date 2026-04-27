const fs = require("fs");
const path = require("path");
const readline = require("readline");

async function generateCSV(filePath, totalRows = 100000) {
  const categories = ["Food", "Electronics", "Clothing", "Books", "Sports"];
  const statuses = ["completed", "pending", "failed"];

  const ws = fs.createWriteStream(filePath);

  await new Promise((res, rej) => {
    ws.on("error", rej);
    ws.write("id, category, amount, status\n");

    (async () => {
      for (let i = 1; i <= totalRows; i++) {
        const category = categories[i % 5];
        const amount = (Math.random() * 1000).toFixed(2);
        const status = statuses[i % 3];
        const line = `${i}, ${category}, ${amount}, ${status}\n`;

        if (!ws.write(line)) {
          await new Promise((res) => ws.once("drain", res));
        }
      }

      ws.end(res);
    })().catch(rej);
  });
}

async function* readCSV(filePath) {
  const stream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });

  let streamError = null;
  stream.on("error", (error) => {
    streamError = error;
    rl.close();
  });

  let first = true;

  for await (const line of rl) {
    if (streamError) throw streamError;
    if (first) {
      first = false;
      continue;
    }
    if (!line) continue;

    const [id, category, amount, status] = line.split(",");
    yield {
      id: Number(id),
      category,
      amount: Number(amount),
      status: status.trim(),
    };
  }

  if (streamError) throw streamError;
}

async function* filter(source, fn) {
  for await (const item of source) {
    if (fn(item)) yield item;
  }
}

async function* map(source, fn) {
  for await (const item of source) {
    yield fn(item);
  }
}

async function aggregate(source) {
  const stats = {};
  let total = 0;

  for await (const item of source) {
    total++;

    if (!stats[item.category]) {
      stats[item.category] = { count: 0, sum: 0 };
    }
    stats[item.category].count++;
    stats[item.category].sum += item.amount;
  }

  return { total, stats };
}

async function main() {
  const file = path.join(__dirname, "data.csv");

  await generateCSV(file, 100000);

  const start = Date.now();

  const rows = readCSV(file);
  const completed = filter(rows, (r) => r.status === "completed");
  const withUAH = map(completed, (r) => ({
    ...r,
    amountUAH: +(r.amount * 40).toFixed(2),
  }));

  const result = await aggregate(withUAH);

  const time = ((Date.now() - start) / 1000).toFixed(2);

  console.log(`Processed ${result.total}`);
  console.log(`Time: ${time}s\n`);

  for (let key in result.stats) {
    const s = result.stats[key];
    console.log(
      `${key}: count=${s.count}, avg=${(s.sum / s.count).toFixed(2)}`,
    );
  }

  fs.unlinkSync(file);
}

main().catch(console.error);
