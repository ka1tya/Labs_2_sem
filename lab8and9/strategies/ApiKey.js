class ApiKeyStrategy {
  /**
   * @param {{ apiKey: string, headerName?: string }} options
   */
  constructor({ apiKey, headerName = "X-API-Key" }) {
    if (!apiKey) throw new Error("ApiKeyStrategy: apiKey required");
    this.name = "ApiKey";
    this.apiKey = apiKey;
    this.headerName = headerName;
  }

  async getHeaders() {
    return { [this.headerName]: this.apiKey };
  }

  canRefresh() {
    return false;
  }

  async refresh() {
    throw new Error("ApiKeyStrategy cannot be refreshed");
  }
}

module.exports = { ApiKeyStrategy };
