const {
  Logger,
  log,
  textFormatter,
  jsonFormatter,
  consoleTransport,
  fileTransport,
} = require("./logger");

const { AuthProxy } = require("./proxies/AuthProxy");
const { ApiKeyStrategy } = require("./strategies/ApiKey");
const { JwtStrategy } = require("./strategies/JwtStrategy");

const DEMO_API_KEY = process.env.DEMO_API_KEY || "demo-key";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const logger = new Logger({
  minLevel: "DEBUG",
  formatter: textFormatter,
  transports: [consoleTransport, fileTransport("./logs/app.log")],
});
