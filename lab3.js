function memoize(fn, options = {}) {
  let maxSize = options.maxSize || Infinity;
  let policy = options.policy || "lru";
  let ttlMs = options.ttlMs || 60_000;
  let customEvic = options.customEvic || null;
  let cache = new Map();
  let callCount = new Map();

  function memoization(...args) {
    let key = JSON.stringify(args);

    if (cache.has(key)) {
      let cached = cache.get(key);

      if (policy === "ttl") {
        if (Date.now() - cached.savedAt > ttlMs) {
          cache.delete(key);
          callCount.delete(key);
        } else {
          return cached.value;
        }
      }

      if (policy === "lru") {
        cache.delete(key);
        cache.set(key, cached);
        callCount.set(key, (callCount.get(key) || 0) + 1);
        return cached;
      }

      if (policy === "lfu" || policy === "custom") {
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

      if (policy === "ttl") {
        let now = Date.now();
        for (let [k, entry] of cache) {
          if (now - entry.savedAt > ttlMs) {
            cache.delete(k);
            callCount.delete(k);
          }
        }

        if (cache.size >= maxSize) {
          let oldKey = cache.keys().next().value;
          cache.delete(oldKey);
          callCount.delete(oldKey);
        }
      }

      if (policy === "custom") {
        if (typeof customEvic === "function") {
          customEvic(cache);
        } else {
          let oldKey = cache.keys().next().value;
          cache.delete(oldKey);
          callCount.delete(oldKey);
        }
      }
    }

    let result = fn(...args);
    if (policy === "ttl") {
      cache.set(key, { value: result, savedAt: Date.now() });
    } else {
      cache.set(key, result);
    }
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
