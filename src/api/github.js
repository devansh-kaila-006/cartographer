/**
 * GitHub API wrapper for fetching repository file trees
 */

const GITHUB_API_BASE = 'https://api.github.com'

export class GitHubAPI {
  constructor() {
    this.token = null
    this.tokenType = null // 'oauth' or 'pat'
  }

  /**
   * Set authentication token
   * @param {string} token - OAuth token or Personal Access Token
   * @param {string} type - 'oauth' or 'pat'
   */
  setToken(token, type = 'oauth') {
    this.token = token
    this.tokenType = type
  }

  /**
   * Get auth headers for API requests
   */
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    }

    if (this.token) {
      if (this.tokenType === 'oauth') {
        headers['Authorization'] = `Bearer ${this.token}`
      } else {
        headers['Authorization'] = `token ${this.token}`
      }
    }

    return headers
  }

  /**
   * Fetch repository file tree recursively
   * @param {string} owner - Repository owner (username/org)
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name (default: 'main')
   * @returns {Promise<Array>} - Array of file objects
   */
  async getFileTree(owner, repo, branch = 'main') {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        // Handle rate limit errors
        if (response.status === 403) {
          const remaining = response.headers.get('X-RateLimit-Remaining')
          const reset = response.headers.get('X-RateLimit-Reset')
          const resetTime = reset ? new Date(reset * 1000).toLocaleTimeString() : 'in about an hour'

          if (remaining === '0') {
            throw new Error(
              `GitHub API rate limit exceeded. Resets at ${resetTime}.\n\n` +
              `To increase your limit:\n` +
              `1. Click "+ API Key" in the top right\n` +
              `2. Go to the "GitHub" tab\n` +
              `3. Add a GitHub Personal Access Token\n\n` +
              `This increases your limit from 60/hr to 5000/hr.`
            )
          } else {
            throw new Error(
              `GitHub API returned 403 Forbidden.\n\n` +
              `This repository may be private or the API token may be invalid.\n\n` +
              `Please check:\n` +
              `- Repository URL is correct\n` +
              `- Repository is public\n` +
              `- GitHub API token is valid (if added)`
            )
          }
        }
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()

      // Filter only files (not directories) and extract metadata
      return data.tree
        .filter(item => item.type === 'blob')
        .map(file => ({
          path: file.path,
          size: file.size,
          sha: file.sha,
          language: this.detectLanguage(file.path)
        }))
    } catch (error) {
      throw error
    }
  }

  /**
   * Detect programming language from file extension
   * @param {string} filepath - File path
   * @returns {string} - Programming language
   */
  detectLanguage(filepath) {
    const ext = filepath.split('.').pop().toLowerCase()
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'tsx',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin'
    }
    return languageMap[ext] || 'unknown'
  }

  /**
   * Fetch raw file content from GitHub
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} branch - Branch name (default: 'main')
   * @returns {Promise<string>} - Raw file content
   */
  async getFileContent(owner, repo, path, branch = 'main') {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: this.getHeaders() }
      )

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()

      // GitHub returns base64 encoded content
      if (data.content) {
        return atob(data.content)
      }

      throw new Error('No content found')
    } catch (error) {
      throw error
    }
  }

  /**
   * Fetch file contents for multiple files
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Array} files - Array of file objects with path property
   * @param {string} branch - Branch name (default: 'main')
   * @returns {Promise<Array>} - Array of file objects with content
   */
  async getFileContents(owner, repo, files, branch = 'main') {
    // Fetch in batches to avoid rate limiting
    const batchSize = 5
    const results = []

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)

      const batchResults = await Promise.allSettled(
        batch.map(async (file) => {
          try {
            const content = await this.getFileContent(owner, repo, file.path, branch)
            return { ...file, code: content }
          } catch (error) {
            return { ...file, code: null, error: error.message }
          }
        })
      )

      results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : r.reason))

      // Small delay between batches
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    return results
  }
}

// Singleton instance
export const githubAPI = new GitHubAPI()
