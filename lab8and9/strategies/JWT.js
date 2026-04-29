const jwt = require("jsonwebtoken");

class JwtStrategy {
  constructor({ secret, accessToken, refreshFn }) {
    if (!secret) throw new Error("JwtStrategy: secret обов'язковий");
    if (!refreshFn) throw new Error("JwtStrategy: refreshFn обов'язкова");

    this.name = "JWT";
    this.secret = secret;
    this.accessToken = accessToken || null;
    this.refreshFn = refreshFn;
    this.expiresAt = accessToken
      ? JwtStrategy.parseExpiry(accessToken) || 0
      : 0;
  }

  generateToken(user, userAgent = "") {
    return jwt.sign(
      {
        auth: "bank",
        id: user.id,
        email: user.email,
        agent: userAgent,
      },
      this.secret,
      { expiresIn: "1h" },
    );
  }

  validateToken(token, userAgent = "") {
    try {
      const decoded = jwt.verify(token, this.secret);

      if (
        !decoded ||
        decoded.auth !== "bank" ||
        (userAgent && decoded.agent !== userAgent)
      ) {
        return null;
      }

      return decoded;
    } catch (error) {
      return null;
    }
  }
}

module.exports = { JwtStrategy };
