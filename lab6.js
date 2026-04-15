const fs = require("fs");
const path = require("path");
const readline = require("readline");

async function generateCSV(filePath, totalRows = 100000) {
  const categories = ["Food", "Electronics", "Clothing", "Books", "Sports"];
  const statuses = ["completed", "pending", "failed"];

  const ws = fs.createWriteStream(filePath);
  ws.write("id, category, amount, status\n");

  for (let i = 1; i <= totalRows; i++) {
    const category = categories[i % 5];
    const amount = (Math.random() * 1000).toFixed(2);
    const status = statuses[i % 3];
    const line = `${i}, ${category}, ${amount}, ${status}\n`;

    if (!ws.write(line)) {
      await new Promise((res) => ws.once("drain", res));
    }
  }

  await new Promise((res) => ws.end(res));
}

async function* readCSV(filePath) {
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let first = true;
  for await (const line of rl) {
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
      status,
    };
  }
}
