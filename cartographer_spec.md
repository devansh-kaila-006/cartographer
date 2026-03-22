# 🗺️ Project Cartographer: The Living Grid
### Technical Specification & Architectural Blueprint

**Status:** `ARCHITECTURE_DRAFT_V1`
**Classification:** High-Fidelity WebGL Visualization System
**Objective:** Transform static repository data into an explorable, infinite 3D spatial environment.

---

## 🏗️ 1. Architecture & Data Flow

### The Orchestrator (Hybrid Worker Model)
To maintain 60FPS while navigating large codebases, the system uses a graphics-first approach where the main thread is reserved for rendering (Three.js/WebGL) and UI input.

- **Octree Partitioning:** The grid is divided into spatial chunks. Chunks are dynamically loaded/unloaded from GPU memory as they enter/exit the camera's frustum.
- **Worker-Based Parsing:**
    - **Parser Workers:** Fetch and unzip files via GitHub API.
    - **Indexer Workers:** Generate ASTs using Tree-sitter (Wasm) off-thread.
- **Persistence:** Metadata and ASTs are cached in **IndexedDB** for instant re-loads.

### AI Integration
- **Context Injection:** Sends AST snippets or file summaries (not raw code) to LLMs.
- **Summary Layer:** Batches files by "District" (directory cluster) for efficient processing and caching.

---

## 🎨 2. UI/UX Design Specification

### The "Living Grid"
- **Geometry:** 2.5D Isometric/Hexagonal grid of extruded tiles.
- **Topology:** Height = Lines of Code (LOC); Color = Git Churn (Deep Blue stable -> Neon Red hot).
- **Aesthetic:** "Cyberpunk Scientific" – Obsidian backgrounds with Cyan logic streams and Magenta UI accents.

### Camera Transitions
- **The "Swoop":** Parabolic camera movement with dynamic FOV (fisheye to narrow) and micro-shake on arrival.
- **Post-Processing:** Bloom filters, depth of field (blurring non-focused areas), and optional CRT scanlines.

---

## 🛠️ 3. Feature Roadmap

### Phase 1: The Scaffold (MVP)
- GitHub OAuth Integration.
- Basic 3D grid rendering (Level 2: City View) based on file metadata.
- OrbitControls for navigation.

### Phase 2: The Deep Dive (Analysis)
- Multi-threaded parsing with **Tree-sitter**.
- **Level 3: Blueprint View** (Wireframe internal connections).
- Chunked virtualization for large repositories.

### Phase 3: The Intelligence Layer (AI)
- **Level 4: Quantum View** (LLM-generated logic summaries).
- Semantic Search (fly-to-coordinates).
- Code Debt Heatmapping.

### Phase 4: The Polish (The "Vibe")
- **Git Time-Travel Scrubber:** Watch buildings grow/crumble based on commit history.
- Cinematic lightning (Volumetric fog).
- Sound design and haptic feedback.

---

> [!IMPORTANT]
> This architecture ensures that even massive repositories like the Linux kernel or VS Code remain fluid and explorable in a standard web browser.
