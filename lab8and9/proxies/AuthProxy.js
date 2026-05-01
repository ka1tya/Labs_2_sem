class AuthProxy {
  constructor(inner, strategy) {
    this.inner = inner;
    this.strategy = strategy;
  }

  async request(req) {
    const authHeaders = await this.strategy.getHeaders();

    const augmented = {
      ...req,
      headers: { ...(req.headers || {}), ...authHeaders },
    };

    const response = await this.inner.request(augmented);

    if (response.status === 401 && !req.retried && this.strategy.canRefresh()) {
      console.log(`401: refresh(${this.strategy.name})`);
      await this.strategy.refresh();

      const freshHeaders = await this.strategy.getHeaders();
      return this.inner.request({
        ...req,
        retried: true,
        headers: { ...(req.headers || {}), ...freshHeaders },
      });
    }

    return response;
  }

  setStrategy(strategy) {
    console.log(`${this.strategy.name}: ${strategy.name}`);
    this.strategy = strategy;
  }

  getName() {
    return this.strategy.name;
  }
}

module.exports = { AuthProxy };
