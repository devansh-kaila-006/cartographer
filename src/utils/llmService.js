/**
 * LLM Service - Interfaces with Anthropic Claude, OpenAI GPT, and Google Gemini
 * Updated with 2025 model names and endpoints from official documentation
 */

// API Base URLs (2025)
const ANTHROPIC_API_BASE = 'https://api.anthropic.com'
const OPENAI_API_BASE = 'https://api.openai.com/v1'
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export class LLMService {
  constructor() {
    this.provider = null
    this.apiKey = null
  }

  /**
   * Set the API provider and key
   */
  setCredentials(provider, apiKey) {
    this.provider = provider
    this.apiKey = apiKey
  }

  /**
   * Check if credentials are set
   */
  hasCredentials() {
    return !!this.provider && !!this.apiKey
  }

  /**
   * Generate a code summary using the LLM
   */
  async generateSummary(fileData, code) {
    if (!this.hasCredentials()) {
      throw new Error('No API credentials set')
    }

    const prompt = this.buildSummaryPrompt(fileData, code)

    try {
      if (this.provider === 'anthropic') {
        return await this.callClaude(prompt)
      } else if (this.provider === 'openai') {
        return await this.callGPT(prompt)
      } else if (this.provider === 'gemini') {
        return await this.callGemini(prompt)
      }
    } catch (error) {
      // Provide helpful error message
      if (this.provider === 'gemini' && error.message.includes('404')) {
        throw new Error('Gemini model not found. Your API key might not have the right permissions. Try creating a new key at https://aistudio.google.com/app/apikey or switch to Claude for better compatibility.')
      }

      throw error
    }
  }

  /**
   * Build prompt for code summarization
   */
  buildSummaryPrompt(fileData, code) {
    const { filename, functions, classes, language } = fileData

    let prompt = `Analyze this ${language} file and provide a concise summary (max 50 words).

File: ${filename}

`

    if (functions.length > 0) {
      prompt += `Functions (${functions.length}):\n`
      functions.slice(0, 5).forEach(f => {
        prompt += `  - ${f.name} (complexity: ${f.complexity})\n`
      })
      if (functions.length > 5) {
        prompt += `  ... and ${functions.length - 5} more\n`
      }
      prompt += '\n'
    }

    if (classes.length > 0) {
      prompt += `Classes (${classes.length}):\n`
      classes.forEach(c => {
        prompt += `  - ${c.name} (${c.methods.length} methods)\n`
      })
      prompt += '\n'
    }

    prompt += `Provide a brief technical summary explaining:
1. What this file does
2. Its main components
3. Any notable patterns or complexity

Keep it under 50 words. Be precise and technical.`

    return prompt
  }

  /**
   * Call Anthropic Claude API (2025)
   * Uses Messages API with Claude Sonnet 4
   */
  async callClaude(prompt) {
    const response = await fetch(`${ANTHROPIC_API_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514', // Current stable model
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    return data.content[0].text.trim()
  }

  /**
   * Call OpenAI GPT API (2025)
   * Uses GPT-4.1 or GPT-5.2 models
   */
  async callGPT(prompt) {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14', // Current stable model
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'GPT API error')
    }

    const data = await response.json()
    return data.choices[0].message.content.trim()
  }

  /**
   * Call Google Gemini API (2025)
   * Uses Gemini 2.5 Flash or Gemini 3 Flash Preview
   */
  async callGemini(prompt) {
    // Try multiple models in order of preference (2025 models)
    const models = [
      'gemini-3-flash-preview',      // Newest experimental
      'gemini-2.5-flash',            // Stable, fast
      'gemini-2.5-flash-lite',      // Lightweight, very fast
      'gemini-2.5-flash-preview',   // Preview version
      'gemini-2.0-flash-exp',        // Experimental
      'gemini-pro'                   // Stable fallback
    ]

    let lastError = null

    for (const model of models) {
      try {
        const response = await fetch(
          `${GEMINI_API_BASE}/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                maxOutputTokens: 150,
                temperature: 0.7
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()

          // Extract text from Gemini response
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text.trim()
          }
        }

        // Save error for next iteration
        const errorData = await response.json().catch(() => ({}))
        lastError = errorData.error?.message || `HTTP ${response.status}`

      } catch (error) {
        lastError = error.message
        continue
      }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`)
  }

  /**
   * Semantic search - convert natural language to search terms
   */
  async semanticSearch(query, repoContext) {
    if (!this.hasCredentials()) {
      throw new Error('No API credentials set')
    }

    const prompt = this.buildSearchPrompt(query, repoContext)

    try {
      if (this.provider === 'anthropic') {
        return await this.searchWithClaude(prompt)
      } else if (this.provider === 'openai') {
        return await this.searchWithGPT(prompt)
      } else if (this.provider === 'gemini') {
        return await this.searchWithGemini(prompt)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Build prompt for semantic search
   */
  buildSearchPrompt(query, repoContext) {
    return `Given this search query: "${query}"

Convert it into technical search terms for a codebase.

Repository structure:
${repoContext.directoryStructure || 'N/A'}

Main languages: ${repoContext.languages?.join(', ') || 'N/A'}

Return JSON with:
{
  "keywords": ["term1", "term2"],
  "filePatterns": ["*.js", "src/*"],
  "concepts": ["authentication", "middleware"],
  "priority": "high|medium|low"
}

Be specific and technical. Focus on likely file names, function names, and code patterns.`
  }

  /**
   * Search using Claude (2025)
   */
  async searchWithClaude(prompt) {
    const response = await fetch(`${ANTHROPIC_API_BASE}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'Claude API error')
    }

    const data = await response.json()
    const text = data.content[0].text

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('Invalid response format')
  }

  /**
   * Search using GPT (2025)
   */
  async searchWithGPT(prompt) {
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || 'GPT API error')
    }

    const data = await response.json()
    const text = data.choices[0].message.content

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('Invalid response format')
  }

  /**
   * Search using Gemini (2025)
   */
  async searchWithGemini(prompt) {
    // Try multiple models in order of preference (2025 models)
    const models = [
      'gemini-3-flash-preview',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash-preview',
      'gemini-2.0-flash-exp',
      'gemini-pro'
    ]

    let lastError = null

    for (const model of models) {
      try {
        const response = await fetch(
          `${GEMINI_API_BASE}/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: prompt
                }]
              }],
              generationConfig: {
                maxOutputTokens: 300,
                temperature: 0.7
              }
            })
          }
        )

        if (response.ok) {
          const data = await response.json()

          // Extract text from Gemini response
          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0])
            }
          }

          // If we got here but no JSON, try next model
          lastError = 'No valid JSON in response'
          continue
        }

        const errorData = await response.json().catch(() => ({}))
        lastError = errorData.error?.message || `HTTP ${response.status}`

      } catch (error) {
        lastError = error.message
        continue
      }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError}`)
  }

  /**
   * Batch generate summaries for multiple files
   */
  async generateBatchSummaries(files) {
    const summaries = new Map()

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize)

      const results = await Promise.allSettled(
        batch.map(async (file) => {
          try {
            const summary = await this.generateSummary(file.parsedData, file.code)
            return { path: file.path, summary }
          } catch (error) {
            console.error(`Failed to summarize ${file.path}:`, error)
            return { path: file.path, summary: null, error: error.message }
          }
        })
      )

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          summaries.set(result.value.path, result.value.summary)
        }
      })

      // Small delay between batches
      if (i + batchSize < files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return summaries
  }
}

// Singleton instance
export const llmService = new LLMService()
