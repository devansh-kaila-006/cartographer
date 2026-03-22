import { useState } from 'react'
import './SemanticSearch.css'

export function SemanticSearch({ onSearch, isSearching, hasApiKey }) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])

  const exampleQueries = [
    'Where is authentication?',
    'Find database models',
    'Show API endpoints',
    'Locate utility functions'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim() || !hasApiKey) return

    await onSearch(query)
    setQuery('')
  }

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion)
  }

  return (
    <div className="semantic-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about the codebase..."
            className="search-input glass"
            disabled={!hasApiKey}
          />
          <button
            type="submit"
            className="search-submit glow-cyan"
            disabled={!hasApiKey || !query.trim() || isSearching}
          >
            {isSearching ? '...' : 'Search'}
          </button>
        </div>

        {!hasApiKey && (
          <p className="search-hint">
            Add an API key to enable AI search
          </p>
        )}
      </form>

      {hasApiKey && !query && (
        <div className="search-suggestions">
          <p className="suggestions-title">Try asking:</p>
          <div className="suggestion-chips">
            {exampleQueries.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="suggestion-chip glass"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
