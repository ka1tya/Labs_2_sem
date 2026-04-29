const jwt = require("jsonwebtoken");

class JwtStrategy {
  constructor({ secret, accessToken, refreshFn }) {
    if (!secret) throw new Error("JwtStrategy: secret required");
    if (!refreshFn) throw new Error("JwtStrategy: refreshFn required");

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

  async getHeaders() {
    if (!this.accessToken || Date.now() >= this.expiresAt - 30000) {
      await this.refresh();
    }
    return { Authorization: `Bearer ${this.accessToken}` };
  }

  canRefresh() {
    return true;
  }

  async refresh() {
    console.log("Refreshing access token...");
    const { accessToken, expiresIn } = await this.refreshFn();
    this.accessToken = accessToken;
    this.expiresAt = Date.now() + expiresIn * 1000;
    console.log(`Token updated, valid for ${expiresIn}s`);
  }
}

module.exports = { JwtStrategy };
