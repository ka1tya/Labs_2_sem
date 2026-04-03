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
    const item = new QueueItem(value, priority, this.counter);
    this.counter++;
    this.items.push(item);
  }

  _findIndex(mode) {
    if (this.items.length === 0) {
      throw new Error("Queue is empty");
    }

    if (mode === "oldest") {
      return 0;
    }

    if (mode === "newest") {
      return this.items.length - 1;
    }

    let index = 0;
    for (let i = 1; i < this.items.length; i++) {
      const current = this.items[i];
      const best = this.items[index];

      if (mode === "highest") {
        if (
          current.priority > best.priority ||
          (current.priority === best.priority &&
            current.sequence < best.sequence)
        ) {
          index = i;
        }
      }

      if (mode === "lowest") {
        if (
          current.priority < best.priority ||
          (current.priority === best.priority &&
            current.sequence < best.sequence)
        ) {
          index = i;
        }
      }
    }
    return index;
  }

  peek(mode) {
    const index = this._findIndex(mode);
    return this.items[index].value;
  }

  dequeue(mode) {
    const index = this._findIndex(mode);
    const value = this.items[index].value;
    this.items.splice(index, 1);
    return value;
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

console.log("Dequeue by highest priority:");
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
