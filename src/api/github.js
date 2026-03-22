/**
 * GitHub API Service
 * Fetches repository data from GitHub
 */

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Fetch file tree from a GitHub repository
 * @param {string} owner - Repository owner (e.g., 'facebook')
 * @param {string} repo - Repository name (e.g., 'react')
 * @returns {Promise<Array>} Array of file objects
 */
export async function getFileTree(owner, repo) {
  try {
    // Try to get the directory tree first
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
      .map(item => {
        const ext = item.path.split('.').pop().toLowerCase()
        return {
          path: item.path,
          name: item.path.split('/').pop(),
          type: 'file',
          language: getLanguageFromExtension(ext),
          size: item.size || 0,
          sha: item.sha,
        }
      })

    if (files.length === 0) {
      throw new Error('No code files found in repository')
    }

    return files
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
}
