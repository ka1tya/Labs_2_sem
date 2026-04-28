class EventBus {
  constructor() {
    this.events = {};
  }

  subscribe(event, listener) {
    !this.events[event] && (this.events[event] = []);
    this.events[event].push(listener);
  }

  unsubscribe(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((l) => l !== listener);
  }

  once(event, listener) {
    const wrapper = (data) => {
      listener(data);
      this.events[event] = this.events[event].filter((l) => l !== wrapper);
    };
    this.subscribe(event, wrapper);
  }

  emit(event, data) {
    const listeners = this.events[event];

    if (!listeners) return;
    listeners.forEach((listener) => {
      try {
        listener.call(null, data);
      } catch (error) {
        const errorListener = this.events["error"];
        if (errorListener && errorListener.length > 0) {
          errorListener.forEach((l) => l({ event, data, error }));
        } else {
          console.error(`Необроблена помилка в '${event}' listener:`, error);
        }
      }
    });
  }
}

const events = new EventBus();
let passed = 0,
  failed = 0;

function test(fn) {
  try {
    fn();
    console.log(`pass`);
    passed++;
  } catch (error) {
    console.log(`fail: ${error.message}`);
    failed++;
  }
}

test(() => {
  const received = [];
  events.subscribe("message", (msg) => received.push("Alice: " + msg));
  events.subscribe("message", (msg) => received.push("Bob: " + msg));
  events.emit("message", "Hello!");
  if (!received.includes("Alice: Hello!") || !received.includes("Bob: Hello!"))
    throw new Error("not all listeners received the message");
});

test(() => {
  const received = [];
  const listener = (msg) => received.push(msg);
  events.subscribe("message", listener);
  events.unsubscribe("message", listener);
  events.emit("message", "Anyone here?");
  if (received.includes("Anyone here?"))
    throw new Error("listener received message after unsubscribe");
});

test(() => {
  let count = 0;
  events.once("join", () => count++);
  events.emit("join", "Carol");
  events.emit("join", "Carol");
  if (count !== 1) throw new Error(`expected 1 call, got ${count}`);
});

test(() => {
  const received = [];
  events.subscribe("error", () => {});
  events.subscribe("dm", () => {
    throw new Error("something went wrong");
  });
  events.subscribe("dm", (msg) => received.push(msg));
  events.emit("dm", "Hello in private!");
  if (received[0] !== "Hello in private!")
    throw new Error("healthy listener didn't receive the message");
});

test(() => {
  const freshBus = new EventBus();
  const errors = [];
  freshBus.subscribe("error", (e) => errors.push(e.event));
  freshBus.subscribe("message", () => {
    throw new Error("failure");
  });
  freshBus.emit("message", "test");
  if (errors[0] !== "message")
    throw new Error("error didn't reach the error channel");
});

console.log(`${passed}/${passed + failed} tests passed`);
