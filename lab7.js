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

  emit(event, data) {
    const listeners = this.events[event];

    if (!listeners) return;
    listeners.forEach((listener) => listener.call(null, data));
  }
}
