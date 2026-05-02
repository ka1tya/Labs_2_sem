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
const { JwtStrategy } = require("./strategies/Jwt");

const DEMO_API_KEY = process.env.DEMO_API_KEY || "demo-key";
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const logger = new Logger({
  minLevel: "DEBUG",
  formatter: textFormatter,
  transports: [consoleTransport, fileTransport("./logs/app.log")],
});

class FakeClient {
  async request(req) {
    console.log("Request:", req.url);
    if (!req.retried) {
      return { status: 401 };
    }

    return {
      status: 200,
      data: { message: "OK", url: req.url },
    };
  }
}

function buildStrategy() {
  logger.info("Using JWT strategy");

  return new JwtStrategy({
    secret: JWT_SECRET,
    refreshFn: async () => {
      logger.debug("refreshFn called");
      return { accessToken: "new-token", expiresIn: 3600 };
    },
  });
}

const client = new FakeClient();
const authClient = new AuthProxy(client, buildStrategy());

async function demo() {
  logger.info("Demo start");

  const add = (a, b) => a + b;
  const addLogged = log({
    level: "DEBUG",
    logger,
    name: "add",
  })(add);
  addLogged(2, 3);

  const fetchData = async (id) => ({ id, value: id * 10 });
  const fetchLogged = log({
    level: "INFO",
    logger,
    name: "fetchData",
  })(fetchData);
  await fetchLogged(10);

  const risky = async (x) => {
    if (x < 0) throw new Error("bad value");
    return x;
  };

  const riskyLogged = log({
    level: "ERROR",
    logger,
    name: "risky",
  })(risky);

  try {
    await riskyLogged(-1);
  } catch {}

  logger.info("\nAuthProxy demo:");
  const response = await authClient.request({
    url: "/test",
  });
  logger.info({ message: "Response:", result: response });

  logger.info("Switching to API Key strategy:");
  authClient.setStrategy(new ApiKeyStrategy({ apiKey: DEMO_API_KEY }));
  logger.info({ message: "Strategy:", result: authClient.getName() });

  const jsonLogger = new Logger({
    minLevel: "INFO",
    formatter: jsonFormatter,
    transports: [consoleTransport, fileTransport("./logs/structured.json")],
  });

  jsonLogger.info({
    message: "Structured log",
    strategy: authClient.getName(),
  });

  logger.info("Demo end");
}

demo().catch((error) =>
  logger.error({
    function: "demo",
    error: error.message,
  }),
);
