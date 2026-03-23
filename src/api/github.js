/**
 * GitHub API Service
 * Fetches repository data from GitHub
 */

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Fetch commit history for a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} perPage - Number of commits to fetch (default: 100)
 * @returns {Promise<Array>} Array of commit objects
 */
export async function getCommitHistory(owner, repo, perPage = 100) {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=${perPage}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch commits: ${response.status}`)
    }

    const commits = await response.json()

    return commits.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.committer.date,
      author: commit.commit.author.name,
    }))
  } catch (error) {
    console.error('Failed to fetch commit history:', error)
    throw error
  }
}

/**
 * Fetch file tree from a GitHub repository
 * @param {string} owner - Repository owner (e.g., 'facebook')
 * @param {string} repo - Repository name (e.g., 'react')
 * @returns {Promise<Object>} Object with files array and commits array
 */
export async function getFileTree(owner, repo) {
  try {
    // Fetch commits first to get file creation dates
    let commits = []
    try {
      commits = await getCommitHistory(owner, repo, 100)
    } catch (error) {
      console.warn('Could not fetch commit history, continuing without it:', error)
    }

    // Try to get the directory tree
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`
    )

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Repository not found')
      } else if (response.status === 403) {
        throw new Error('Rate limit exceeded or access denied')
      } else {
        throw new Error(`GitHub API error: ${response.status}`)
      }
    }

    const data = await response.json()

    if (!data.tree) {
      throw new Error('No files found in repository')
    }

    // Filter and transform files
    const files = data.tree
      .filter(item => item.type === 'blob' && item.path)
      .filter(item => {
        // Filter out common exclusions
        const exclusions = [
          'node_modules',
          '.git',
          'dist',
          'build',
          'coverage',
          '.next',
          '.nuxt',
          'out',
          'target',
          'bin',
          'obj',
        ]

        return !exclusions.some(exclusion => item.path.includes(exclusion))
      })
      .filter(item => {
        // Only include code-related files
        const ext = item.path.split('.').pop().toLowerCase()
        const codeExtensions = [
          'js', 'jsx', 'ts', 'tsx',
          'css', 'scss', 'sass', 'less',
          'html', 'htm',
          'json',
          'md', 'markdown',
          'py', 'rb', 'go', 'rs',
          'java', 'kt', 'kts',
          'cpp', 'c', 'h', 'hpp',
          'cs',
          'php',
          'swift',
          'vue', 'svelte',
          'xml', 'yaml', 'yml',
          'toml',
          'sh', 'bash',
          'dockerfile',
          'gitignore',
          'eslintrc',
          'prettierrc',
        ]

        // Include files without extension if they're common config files
        const name = item.path.split('/').pop().toLowerCase()
        const configFiles = [
          'readme',
          'license',
          'dockerfile',
          'gitignore',
          'eslintrc',
          'prettierrc',
          'package',
          'makefile',
        ]

        return codeExtensions.includes(ext) || configFiles.includes(name)
      })
      .slice(0, 400) // Limit to 400 files
      .map((item, index) => {
        const ext = item.path.split('.').pop().toLowerCase()

        // Assign a creation date based on file position and commit history
        // This creates a realistic timeline effect without needing individual file histories
        let createdAt

        if (commits && commits.length > 0) {
          // Distribute files across the commit timeline
          const commitIndex = Math.floor((index / 400) * commits.length)
          const targetCommit = commits[Math.min(commitIndex, commits.length - 1)]
          createdAt = targetCommit ? targetCommit.date : new Date().toISOString()
        } else {
          // No commits? Create a fake timeline spanning the last year
          const now = new Date()
          const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
          const progress = index / 400
          const fileDate = new Date(oneYearAgo.getTime() + (now.getTime() - oneYearAgo.getTime()) * progress)
          createdAt = fileDate.toISOString()
        }

        return {
          path: item.path,
          name: item.path.split('/').pop(),
          type: 'file',
          language: getLanguageFromExtension(ext),
          size: item.size || 0,
          sha: item.sha,
          createdAt: createdAt,
        }
      })

    if (files.length === 0) {
      throw new Error('No code files found in repository')
    }

    // Sort files by creation date
    files.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    return {
      files,
      commits,
    }
  } catch (error) {
    console.error('Failed to fetch file tree:', error)
    throw error
  }
}

/**
 * Get language from file extension
 */
function getLanguageFromExtension(ext) {
  const languageMap = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'html': 'html',
    'json': 'json',
    'md': 'markdown',
    'py': 'python',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'kt': 'kotlin',
    'kts': 'kotlin',
    'cpp': 'cpp',
    'c': 'c',
    'h': 'c',
    'hpp': 'cpp',
    'cs': 'csharp',
    'php': 'php',
    'swift': 'swift',
    'vue': 'vue',
    'svelte': 'svelte',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'sh': 'shell',
    'bash': 'shell',
    'dockerfile': 'dockerfile',
    'gitignore': 'gitignore',
    'eslintrc': 'eslintrc',
    'prettierrc': 'prettierrc',
  }

  return languageMap[ext] || ext
}

/**
 * Fetch file content from GitHub
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - File path
 * @returns {Promise<string>} File content
 */
export async function getFileContent(owner, repo, path) {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status}`)
    }

    const data = await response.json()

    // GitHub API returns base64 encoded content
    if (data.encoding === 'base64') {
      const content = atob(data.content)
      return content
    }

    return ''
  } catch (error) {
    console.error('Failed to fetch file content:', error)
    throw error
  }
}

/**
 * Generate mock files for testing/development
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Array} Array of mock file objects
 */
export function generateMockFiles(owner, repo) {
  const mockFiles = [
    { path: 'src/App.jsx', name: 'App.jsx', type: 'file', language: 'jsx', size: 2048, sha: 'abc123' },
    { path: 'src/main.jsx', name: 'main.jsx', type: 'file', language: 'jsx', size: 512, sha: 'def456' },
    { path: 'src/index.css', name: 'index.css', type: 'file', language: 'css', size: 1024, sha: 'ghi789' },
    { path: 'src/components/Header.jsx', name: 'Header.jsx', type: 'file', language: 'jsx', size: 1536, sha: 'jkl012' },
    { path: 'src/components/Footer.jsx', name: 'Footer.jsx', type: 'file', language: 'jsx', size: 1024, sha: 'mno345' },
    { path: 'src/utils/helpers.js', name: 'helpers.js', type: 'file', language: 'javascript', size: 768, sha: 'pqr678' },
    { path: 'src/api/client.js', name: 'client.js', type: 'file', language: 'javascript', size: 1280, sha: 'stu901' },
    { path: 'src/styles/global.css', name: 'global.css', type: 'file', language: 'css', size: 2048, sha: 'vwx234' },
    { path: 'src/config/settings.json', name: 'settings.json', type: 'file', language: 'json', size: 256, sha: 'yza567' },
    { path: 'README.md', name: 'README.md', type: 'file', language: 'markdown', size: 1024, sha: 'bcd890' },
    { path: 'package.json', name: 'package.json', type: 'file', language: 'json', size: 512, sha: 'efg123' },
    { path: 'vite.config.js', name: 'vite.config.js', type: 'file', language: 'javascript', size: 768, sha: 'hij456' },
  ]

  return mockFiles
}

export const githubAPI = {
  getFileTree,
  getFileContent,
  generateMockFiles,
  getCommitHistory,
}
