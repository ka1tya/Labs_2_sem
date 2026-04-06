function memoize(fn, options = {}) {
  const maxSize = options.maxSize || Infinity;
  const policy = options.policy || "lru";
  const ttlMs = options.ttlMs || 60000;
  const customEvic = options.customEvic;
  const cache = new Map();
  const usage = new Map();

  function memoization(...args) {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      const cached = cache.get(key);

      if (policy === "ttl") {
        if (Date.now() - cached.time > ttlMs) {
          cache.delete(key);
          usage.delete(key);
        } else {
          return cached.value;
        }
      }

      if (policy === "lru") {
        cache.delete(key);
        cache.set(key, cached);
        usage.set(key, (usage.get(key) || 0) + 1);
        return cached;
      }

      if (policy === "lfu" || policy === "custom") {
        usage.set(key, (usage.get(key) || 0) + 1);
        return cached;
      }
    }

    if (cache.size >= maxSize) {
      if (policy === "lru") {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        usage.delete(firstKey);
      }

      if (policy === "lfu") {
        let minKey = null;
        let minCount = Infinity;
        for (let [k, count] of usage) {
          if (count < minCount) {
            minCount = count;
            minKey = k;
          }
        }
        cache.delete(minKey);
        usage.delete(minKey);
      }

      if (policy === "ttl") {
        const now = Date.now();
        for (let [k, val] of cache) {
          if (now - val.time > ttlMs) {
            cache.delete(k);
            usage.delete(k);
          }
        }

        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
          usage.delete(firstKey);
        }
      }

      if (policy === "custom") {
        if (typeof customEvic === "function") {
          customEvic(cache);
        } else {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
          usage.delete(firstKey);
        }
      }
    }

    const result = fn(...args);

    if (policy === "ttl") {
      cache.set(key, { value: result, time: Date.now() });
    } else {
      cache.set(key, result);
    }
    usage.set(key, 1);
    return result;
  }

  memoization.cache = cache;
  memoization.clear = () => {
    cache.clear();
    usage.clear();
  };

  return memoization;
}

let square = (n) => n * n;

let cached1 = memoize(square, { maxSize: 2, policy: "lru" });
console.log(cached1(1));
console.log(cached1(1));
console.log(cached1(2));
console.log(cached1(3));

let cached2 = memoize(square, { maxSize: 2, policy: "lfu" });
console.log(cached2(4));
console.log(cached2(4));
console.log(cached2(5));
console.log(cached2(6));

let cached3 = memoize(square, { policy: "ttl", ttlMs: 4000 });
console.log(cached3(7));
console.log(cached3(7));
setTimeout(() => console.log(cached3(7)), 5000);

let cached3default = memoize(square, { policy: "ttl" });
console.log(cached3default(8));

let cached4 = memoize(square, {
  maxSize: 2,
  policy: "custom",
  customEvic: (a) => a.delete(a.keys().next().value),
});
console.log(cached4(9));
console.log(cached4(10));
console.log(cached4(11));

let cached4bad = memoize(square, {
  maxSize: 2,
  policy: "custom",
  customEvic: null,
});
console.log(cached4bad(12));
console.log(cached4bad(13));
console.log(cached4bad(14));
