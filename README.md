# Cartographer

> **Understand any codebase visually** - A professional codebase exploration tool inspired by Linear's design language.

![Cartographer](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-18.x-61DAFB) ![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)

## ✨ Features

### 🎨 Three Visualization Modes
- **Grid Heatmap** - See all files in a grid layout where cell size represents file size
- **Sunburst** - Radial hierarchical view showing directory structure as nested rings
- **Chord Diagram** - Explore directory dependencies and relationships

### ⏱️ Interactive Timeline
- **Ghost Files** - See files from future commits as wireframe outlines
- **Play/Pause** - Auto-play through repository history
- **Date Scrubber** - Jump to any point in time
- **Visual Indicators** - Clear distinction between current and future files

### 🔍 Smart Search
- **Real-time Filtering** - Search across all files instantly
- **Visual Highlighting** - Matching files and directories highlighted in amber
- **Context Preservation** - See matching files within their directory structure

### 🤖 AI-Powered Insights
- **File Summaries** - Generate 2-3 sentence AI summaries of any file
- **Gemini Integration** - Uses Google's Gemini 2.5 Flash API
- **One-Click Generation** - Get insights with a single click

### ⌨️ Keyboard Shortcuts
- **Full Keyboard Control** - Navigate without touching the mouse
- **Help Modal** - Press `?` to see all shortcuts
- **Quick Actions** - Switch views, toggle timeline, search, zoom, and more

### 🔊 Audio Feedback
- **Click Sounds** - Satisfying audio feedback on interactions
- **Hover Effects** - Subtle sounds on UI element hover
- **Customizable** - Adjust volume or disable sounds

### 🎯 Professional Design
- **Linear-Inspired** - Clean, dark, minimal interface
- **Smooth Animations** - 300ms transitions throughout
- **Responsive** - Works on desktop and tablet screens

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cartographer.git
cd cartographer

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### 1. Load a Repository
1. Enter the GitHub owner and repository name (e.g., `facebook` and `react`)
2. Click "Load Repository" or try a sample repository
3. Wait for the analysis to complete

### 2. Explore Visualizations
- **Switch Views** - Click the view buttons or press `1`, `2`, or `3`
- **Zoom** - Use `+`/`-` keys or the zoom controls
- **Pan** - Click and drag the visualization
- **Reset** - Press `R` or click "Load New"

### 3. Use the Timeline
- **Toggle Timeline** - Click `▶` button or press `T`
- **Scrub** - Drag the timeline slider to see files from different time periods
- **Play/Pause** - Press `Space` or click the play button
- **Ghost Files** - Wireframe circles show files that don't exist yet

### 4. Search Files
- **Focus Search** - Press `⌘/Ctrl + F`
- **Type Query** - Enter file or folder name
- **View Results** - Matching files highlighted in amber

### 5. View File Details
- **Click File** - Click any file in the tree or visualization
- **View Info Card** - See file size, language, and modification date
- **Generate Summary** - Click "Generate AI Summary" (requires API key)
- **View on GitHub** - Open the file directly on GitHub

### 6. Configure Settings
- **API Keys** - Click settings icon → "API Keys"
- **Audio** - Click settings icon → "Audio"
- **Keyboard Shortcuts** - Press `?` or click "Shortcuts" button

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + F` | Focus search |
| `1` | Switch to Sunburst view |
| `2` | Switch to Chord view |
| `3` | Switch to Grid view |
| `+` / `-` | Zoom in/out |
| `⌘/Ctrl + 0` | Reset zoom |
| `Space` | Play/pause timeline |
| `T` | Toggle timeline |
| `I` | Toggle info box |
| `R` | Reset repository |
| `⌘/Ctrl + ,` | Open settings |
| `?` | Show keyboard shortcuts |
| `Escape` | Close modals / Deselect file |

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite 5** - Build tool and dev server
- **CSS3** - Styling with CSS variables
- **GitHub API** - Fetch repository data
- **Gemini API** - AI-powered summaries

## ⚙️ Configuration

### API Keys

To use AI summaries, you need a Gemini API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. In Cartographer, click the settings icon (⚙️)
4. Select "API Keys"
5. Enter your Gemini API key
6. Click "Save"

### Audio Settings

Customize audio feedback:
- Click settings icon → "Audio"
- Toggle sound on/off
- Adjust volume slider (0-100)
- Changes are saved automatically

## 📁 Project Structure

```
cartographer/
├── src/
│   ├── api/
│   │   └── github.js          # GitHub API integration
│   ├── components/
│   │   ├── Icons.jsx          # SVG icon components
│   │   ├── LandingPage.jsx    # Welcome screen
│   │   ├── TopBar.jsx         # Navigation bar
│   │   ├── LeftSidebar.jsx    # File tree
│   │   ├── VisualizationArea.jsx  # Main visualizations
│   │   ├── FileInfoCard.jsx   # File details popup
│   │   ├── SettingsModal.jsx  # Settings dialogs
│   │   ├── Timeline.jsx       # Timeline component
│   │   ├── KeyboardShortcuts.jsx  # Help modal
│   │   └── Tooltip.jsx        # Tooltip component
│   ├── utils/
│   │   └── audioManager.js    # Audio feedback system
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── public/                   # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Dependencies
└── README.md               # This file
```

## 🎨 Design Principles

Cartographer follows these design principles:

1. **Clarity Over Density** - Show only what's necessary
2. **Visual Hierarchy** - Important elements stand out
3. **Smooth Interactions** - Every action has feedback
4. **Accessibility** - Keyboard-first navigation
5. **Performance** - Instant visual responses

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Use meaningful variable names
- Add comments for complex logic
- Test with different repositories
- Ensure keyboard shortcuts work

## 🐛 Known Issues

- Timeline may not work accurately for repositories with fewer than 10 commits
- Very large repositories (10,000+ files) may experience slow load times
- Search is case-sensitive

## 🔮 Future Enhancements

Potential features for future versions:

- [ ] Git blame integration
- [ ] Code complexity metrics
- [ ] Dependency graph visualization
- [ ] Multi-repository comparison
- [ ] Export visualizations as images
- [ ] Dark/light theme toggle
- [ ] More AI providers (OpenAI, Claude, etc.)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Linear** - Design language inspiration
- **GitHub** - Repository data source
- **Google** - Gemini API for AI summaries
- **Vite** - Lightning-fast build tool

## 📞 Support

- **Issues** - [GitHub Issues](https://github.com/your-username/cartographer/issues)
- **Discussions** - [GitHub Discussions](https://github.com/your-username/cartographer/discussions)

---

<div align="center">

**Built with ❤️ for developers who love beautiful tools**

[⭐ Star](https://github.com/your-username/cartographer) · [🍴 Fork](https://github.com/your-username/cartographer/fork) · [🐛 Report Issue](https://github.com/your-username/cartographer/issues)

</div>
