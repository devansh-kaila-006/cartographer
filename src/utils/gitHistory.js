/**
 * Git History Service - Fetches commit history for time-travel visualization
 */

const GITHUB_API_BASE = 'https://api.github.com'

export class GitHistoryService {
  constructor() {
    this.cache = new Map()
    this.token = null
  }

  /**
   * Set GitHub API token for higher rate limits
   */
  setToken(token) {
    this.token = token
  }

  /**
   * Get auth headers
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    return headers
  }

  /**
   * Fetch commit history for a repository
   */
  async fetchCommitHistory(owner, repo, branch = 'main', perPage = 50) { // Reduced from 100
    const cacheKey = `${owner}/${repo}/${branch}`

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${perPage}`,
        {
          headers: this.getHeaders()
        }
      )

      if (!response.ok) {
        // Check for rate limit
        if (response.status === 403) {
          const remaining = response.headers.get('X-RateLimit-Remaining')
          const reset = response.headers.get('X-RateLimit-Reset')
          const resetTime = reset ? new Date(reset * 1000) : null

          throw new Error(
            `GitHub rate limit exceeded. ${resetTime
              ? `Resets at ${resetTime.toLocaleTimeString()}`
              : 'Please add a GitHub token for higher limits.'}`
          )
        }
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const commits = await response.json()

      // Transform commits into timeline data
      const timeline = commits.map((commit, index) => ({
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0],
        author: commit.commit.author.name,
        date: new Date(commit.commit.author.date),
        index: commits.length - index,
        filesChanged: commit.files ? commit.files.length : 0
      }))

      this.cache.set(cacheKey, timeline)
      return timeline
    } catch (error) {
      throw error
    }
  }

  /**
   * Get file history (when a file was created/modified)
   * Note: Skipped for now to avoid rate limits
   */
  async getFileHistory(owner, repo, path, branch = 'main') {
    // Return mock data to avoid API rate limits
    // In production, you'd cache this or use the GitHub GraphQL API
    return {
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      lastModified: new Date(),
      modificationCount: Math.floor(Math.random() * 10) + 1
    }
  }

  /**
   * Batch fetch file histories (more efficient)
   */
  async batchGetFileHistory(owner, repo, paths, branch = 'main') {
    // For now, return mock data for all files
    // Real implementation would use GraphQL API
    const historyMap = new Map()

    for (const path of paths) {
      historyMap.set(path, {
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        lastModified: new Date(),
        modificationCount: Math.floor(Math.random() * 20) + 1
      })
    }

    return historyMap
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

// Singleton instance
export const gitHistoryService = new GitHistoryService()
