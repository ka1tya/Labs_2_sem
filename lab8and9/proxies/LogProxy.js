const { log } = require("../logger");

class LogProxy {
  constructor(inner, logger, options = {}) {
    if (!logger) throw new Error("Logger must be provided");

    this.inner = inner;

    const rawReq = (req) => this.inner.request(req);

    this.request = log({
      level: options.level || "INFO",
      logger,
      name: "HttpClient.request",
    })(rawReq);
  }
}

module.exports = { LogProxy };
