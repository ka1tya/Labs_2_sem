const fs = require("fs");
const path = require("path");

const levels = {
  DEBUG: 10,
  INFO: 20,
  WARN: 25,
  ERROR: 30,
};

function shouldLog(msgLevel, minLevel) {
  return (levels[msgLevel] ?? 0) >= (levels[minLevel] ?? 0);
}

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
      if (!dirReady) {
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      }
      fs.appendFileSync(fullPath, message + "\n", "utf8");
    },
  };
}

function log({ level = "INFO", logger, name } = {}) {
  logger = logger || new Logger();

  return function decorator(fn) {
    const fnName = name || fn.name || "anonymous";

    if (level === "ERROR") {
      function wrappedError(...args) {
        const start = Date.now();

        let result;
        try {
          result = fn.apply(this, args);
        } catch (error) {
          logger.error(fnName, {
            args,
            error: error.message,
            durationMs: Date.now() - start,
          });
          throw error;
        }

        if (result && typeof result.then === "function") {
          return result.catch((error) => {
            logger.error(fnName, {
              args,
              error: error.message,
              durationMs: Date.now() - start,
            });
            throw error;
          });
        }

        return result;
      }

      Object.defineProperty(wrappedError, "name", { value: fnName });
      return wrappedError;
    }

    function wrapped(...args) {
      const start = Date.now();

      logger.log(level, fnName, {
        args,
      });

      let result;
      try {
        result = fn.apply(this, args);
      } catch (error) {
        logger.error(fnName, {
          error: error.message,
          durationMs: Date.now() - start,
        });
        throw error;
      }

      if (result && typeof result.then === "function") {
        return result.then(
          (value) => {
            logger.log(level, fnName, {
              result: value,
              durationMs: Date.now() - start,
            });
            return value;
          },
          (error) => {
            logger.error(fnName, {
              error: error.message,
              durationMs: Date.now() - start,
            });
            throw error;
          },
        );
      }

      logger.log(level, fnName, {
        result,
        durationMs: Date.now() - start,
      });

      return result;
    }

    Object.defineProperty(wrapped, "name", { value: fnName });
    return wrapped;
  };
}
