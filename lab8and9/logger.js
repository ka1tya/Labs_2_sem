const fs = require("fs");
const path = require("path");

const levels = {
  DEBUG: 10,
  INFO: 20,
  WARN: 25,
  ERROR: 30,
};

function isPromise(val) {
  return val && typeof val.then === "function";
}

function textFormatter(entry) {
  const base = `[${entry.timestamp}] [${entry.level}] ${entry.function}`;
  const parts = [];
  if (entry.args !== undefined)
    parts.push(`args:${JSON.stringify(entry.args)}`);
  if (entry.result !== undefined)
    parts.push(`result:${JSON.stringify(entry.result)}`);
  if (entry.error !== undefined) parts.push(`error:"${entry.error}"`);
  if (entry.durationMs !== undefined) parts.push(`${entry.durationMs}ms`);

  return parts.length ? `${base} → ${parts.join("  ")}` : base;
}

function jsonFormatter(entry) {
  return JSON.stringify(entry);
}

const consoleTransport = {
  write(level, message) {
    if (level === "ERROR") console.error(message);
    else if (level === "WARN") console.warn(message);
    else console.log(message);
  },
};

function fileTransport(filePath) {
  const fullPath = path.resolve(filePath);

  return {
    write(_level, message) {
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.appendFileSync(fullPath, message + "\n", "utf8");
    },
  };
}

function log({ level = "INFO", logger, name } = {}) {
  if (!logger) {
    throw new Error("Logger must be provided");
  }

  return function decorator(fn) {
    const fnName = name || fn.name || "anonymous";

    return function (...args) {
      const start = Date.now();

      if (level !== "ERROR") {
        logger.log(level, {
          args,
          level,
          function: fnName,
          timestamp: new Date().toISOString(),
        });
      }

      try {
        const result = fn.apply(this, args);

        if (isPromise(result)) {
          return result
            .then((res) => {
              if (level !== "ERROR") {
                logger.log(level, {
                  result: res,
                  level,
                  function: fnName,
                  timestamp: new Date().toISOString(),
                  durationMs: Date.now() - start,
                });
              }
              return res;
            })
            .catch((error) => {
              logger.error({
                timestamp: new Date().toISOString(),
                level: "ERROR",
                function: fnName,
                error: error.message,
                durationMs: Date.now() - start,
              });
              throw error;
            });
        }
        return result;
      } catch (error) {
        logger.error({
          timestamp: new Date().toISOString(),
          level: "ERROR",
          function: fnName,
          error: error.message,
          durationMs: Date.now() - start,
        });
        throw error;
      }
    };
  };
}
