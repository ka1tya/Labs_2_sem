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
  }
}
