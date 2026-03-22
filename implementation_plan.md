# Implementation Plan: Cartographer Phase 1 (MVP)

The goal of Phase 1 is to establish the 3D visualization foundation and GitHub connectivity.

## Proposed Changes

### 🏗️ Core Infrastructure
#### [NEW] `index.html`
- Basic setup with a full-screen canvas for Three.js.
#### [NEW] `src/engine/SceneManager.js`
- Initialization of the Three.js scene, camera, and renderer.
- OrbitControls setup.
#### [NEW] `src/api/github.js`
- OAuth handling and recursive file tree fetching.

### 📐 Visualization Layer
#### [NEW] `src/engine/GridGenerator.js`
- Logic to map file metadata (size, language) to 3D box geometries.
#### [NEW] `src/styles/vibe.css`
- Custom CSS for the "Cyberpunk Scientific" HUD and overlay.

## Verification Plan

### Automated Tests
- No automated tests for MVP; focus is on visual verification.

### Manual Verification
1.  **GitHub Connection:** Log in via GitHub and verify the file tree is fetched correctly.
2.  **Grid Rendering:** Verify that files are rendered as 3D boxes with heights proportional to their line counts.
3.  **Navigation:** Verify smooth orbit/zoom controls across the grid.
4.  **Aesthetics:** Verify the dark-mode theme and glowing accents match the "vibe" guide.
