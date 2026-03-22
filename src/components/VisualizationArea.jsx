import { IcicleIcon, SunburstIcon, ChordIcon } from './Icons'
import './VisualizationArea.css'

export function VisualizationArea({ currentView }) {
  const viewConfig = {
    icicle: {
      icon: <IcicleIcon />,
      title: 'Icicle View',
      description: 'Vertical hierarchical visualization'
    },
    sunburst: {
      icon: <SunburstIcon />,
      title: 'Sunburst View',
      description: 'Radial hierarchical visualization'
    },
    chord: {
      icon: <ChordIcon />,
      title: 'Chord Diagram',
      description: 'File dependency relationships'
    }
  }

  const config = viewConfig[currentView] || viewConfig.icicle

  return (
    <div className="visualization-area">
      <div className="visualization-placeholder">
        <div className="placeholder-content">
          <span className="placeholder-icon">{config.icon}</span>
          <h2 className="placeholder-title">{config.title}</h2>
          <p className="placeholder-text">{config.description}</p>
          <div className="placeholder-info">
            <p className="info-text">3D visualization coming soon...</p>
            <p className="info-subtext">This will show your codebase structure using {currentView} visualization</p>
          </div>
        </div>
      </div>
    </div>
  )
}
