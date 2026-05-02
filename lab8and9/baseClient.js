class BaseClient {
  async request({ url, method = "GET", headers = {}, body }) {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    return { status: response.status, data };
  }
}

module.exports = { BaseClient };
