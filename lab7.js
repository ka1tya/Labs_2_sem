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
