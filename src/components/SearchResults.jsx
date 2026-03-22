import './SearchResults.css'

export function SearchResults({ results, visible, onResultClick, onClose }) {
  if (!visible || !results.length) return null

  return (
    <div className="search-results-overlay" onClick={onClose}>
      <div className="search-results glass" onClick={(e) => e.stopPropagation()}>
        <div className="results-header">
          <h3>Search Results</h3>
          <button className="results-close" onClick={onClose}>×</button>
        </div>

        <div className="results-list">
          {results.map((result, index) => (
            <div
              key={index}
              className="result-item"
              onClick={() => onResultClick(result)}
            >
              <div className="result-icon">
                {result.type === 'file' ? '[File]' :
                 result.type === 'function' ? '[Fn]' :
                 result.type === 'class' ? '[Class]' : '[Result]'}
              </div>
              <div className="result-content">
                <div className="result-path">{result.path}</div>
                <div className="result-match">{result.match}</div>
                <div className="result-relevance">
                  Relevance: {Math.round(result.relevance * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
