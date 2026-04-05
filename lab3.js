function memoize(fn, options = {}) {
  let maxSize = options.maxSize || Infinity;
  let policy = options.policy || "lru";
  let cache = new Map();
  let callCount = new Map();

  function memoization(...args) {
    let key = JSON.stringify(args);

    if (cache.has(key)) {
      let cached = cache.get(key);

      if (policy === "lru") {
        cache.delete(key);
        cache.set(key, cached);
        callCount.set(key, (callCount.get(key) || 0) + 1);
        return cached;
      }

      if (policy === "lfu") {
        callCount.set(key, (callCount.get(key) || 0) + 1);
        return cached;
      }
    }

    if (cache.size >= maxSize) {
      if (policy === "lru") {
        let oldKey = cache.keys().next().value;
        cache.delete(oldKey);
        callCount.delete(oldKey);
      }

      if (policy === "lfu") {
        let minKey = null;
        let minVal = Infinity;
        for (let [k, count] of callCount) {
          if (count < minVal) {
            minVal = count;
            minKey = k;
          }
        }
        cache.delete(minKey);
        callCount.delete(minKey);
      }
    }

    let result = fn(...args);
    cache.set(key, result);
    callCount.set(key, 1);
    return result;
  }

  memoization.cache = cache;
  memoization.clear = () => {
    cache.clear();
    callCount.clear();
  };

  return memoization;
}
