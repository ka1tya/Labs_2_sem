class QueueItem {
  constructor(value, priority, sequence) {
    this.value = value;
    this.priority = priority;
    this.sequence = sequence;
  }
}

class Queue {
  constructor() {
    this.items = [];
    this.counter = 0;
  }

  enqueue(value, priority) {
    const newItem = new QueueItem(value, priority, this.counter);
    this.counter++;
    this.items.push(newItem);
  }

  _findItem(mode) {
    if (this.items.length === 0) {
      throw new Error("Queue is empty");
    }

    if (mode === "oldest") {
      return this.items[0];
    }

    if (mode === "newest") {
      return this.items[this.items.length - 1];
    }

    if (mode === "highest") {
      let best = this.items[0];
      for (const item of this.items) {
        const betterP = item.priority > best.priority;
        const sameP =
          item.priority === best.priority && item.sequence < best.sequence;

        if (betterP || sameP) {
          best = item;
        }
      }
      return best;
    }

    if (mode === "lowest") {
      let best = this.items[0];
      for (const item of this.items) {
        const worseP = item.priority < best.priority;
        const sameP =
          item.priority === best.priority && item.sequence < best.sequence;

        if (worseP || sameP) {
          best = item;
        }
      }
      return best;
    }

    throw new Error(
      `Unknown mode "${mode}". Use: highest, lowest, oldest, newest`,
    );
  }

  peek(mode) {
    return this._findItem(mode).value;
  }

  dequeue(mode) {
    const found = this._findItem(mode);
    const index = this.items.indexOf(found);
    this.items.splice(index, 1);
    return found.value;
  }
}

const queue = new Queue();

queue.enqueue("wash dishes", 2);
queue.enqueue("go for a walk", 5);
queue.enqueue("call mom", 5);
queue.enqueue("watch tik tok", 1);
queue.enqueue("do lab", 8);

console.log("Highest priority:", queue.peek("highest"));
console.log("Lowest priority: ", queue.peek("lowest"));
console.log("Oldest inserted: ", queue.peek("oldest"));
console.log("Newest inserted: ", queue.peek("newest"));

console.log("\nDequeue by highest priority:");
console.log(queue.dequeue("highest"));
console.log(queue.dequeue("highest"));
console.log(queue.dequeue("highest"));
console.log(queue.dequeue("highest"));
console.log(queue.dequeue("highest"));

const queue2 = new Queue();

queue2.enqueue("first", 1);
queue2.enqueue("second", 2);
queue2.enqueue("third", 3);

console.log("FIFO:", queue2.dequeue("oldest"));
console.log("LIFO:", queue2.dequeue("newest"));
console.log("Left:", queue2.dequeue("oldest"));
