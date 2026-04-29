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
