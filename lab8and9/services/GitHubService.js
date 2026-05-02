class GitHubService {
  constructor(client) {
    this.client = client;
  }

  async getUser(username) {
    const { status, data } = await this.client.request({
      url: `https://api.github.com/users/${username}`,
    });
    if (status !== 200) throw new Error(`getUser failed: HTTP ${status}`);
    return data;
  }

  async listRepos(username) {
    const { status, data } = await this.client.request({
      url: `https://api.github.com/users/${username}/repos`,
    });
    if (status !== 200) throw new Error(`listRepos failed: HTTP ${status}`);
    return data;
  }

  async listIssues(owner, repo) {
    const { status, data } = await this.client.request({
      url: `https://api.github.com/repos/${owner}/${repo}/issues?state=open`,
    });
    if (status !== 200) throw new Error(`listIssues failed: HTTP ${status}`);
    return data;
  }
}

module.exports = { GitHubService };
