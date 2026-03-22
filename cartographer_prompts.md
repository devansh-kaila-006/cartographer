# 🖋️ Project Cartographer: Prompt Suite

These prompts are engineered for high-fidelity LLM interactions (GPT-4, Claude 3.5 Sonnet, etc.) to build and power the project's core features.

---

### 1. 🎨 UI/UX Design System
**Purpose:** Generate CSS variables and glassmorphic designs for the "Cyberpunk Scientific" interface.

> Act as a Lead Product Designer. Create a UI design specification for a "Cyberpunk Scientific" interface. 
> **Visual Aesthetic:** "Premium Data-Visualization." Use deep-ocean blues (`#0a0f1c`) with neon cyan (`#00f3ff`) and electric violet (`#bd00ff`) accents.
> **Requirements:** 
> - **Glassmorphism:** `backdrop-filter: blur(12px)` with 5-8% opacity backgrounds and 1px borders.
> - **Lighting:** External neon glows and internal inset glows to create depth.
> - **Typography:** JetBrains Mono for data; Inter for headers.

---

### 2. ⚛️ "Quantum View" Code Analyzer
**Purpose:** System prompt for the LLM analyzing AST nodes/code clusters.

> You are the "Quantum Analyzer" for Project Cartographer. Analyze the provided code cluster and return high-value architectural metadata in JSON:
> ```json
> {
>   "architectural_role": "e.g., Data Controller, View Component",
>   "complexity_score": "integer 1-100",
>   "summary": "Strictly 10 words or less describing functionality",
>   "dependencies": ["array of key modules"]
> }
> ```
> **Tone:** Precise, technical, no conversational filler.

---

### 3. 🔍 Semantic Search Coordinator
**Purpose:** Map natural language queries (e.g., "Where is auth?") to technical coordinates.

> Convert the user query: "{USER_QUERY}" into technical search parameters for a 3D grid.
> **Output (JSON):**
> ```json
> {
>   "target_concept": "e.g., Authentication",
>   "search_keywords": ["likely", "technical", "terms"],
>   "search_scope": "e.g., Backend Controllers"
> }
> ```

---

### 4. 📐 Three.js Grid Scaffolding
**Purpose:** Generate the foundation for the isometric 3D grid.

> Act as a Senior Three.js Engineer. Write a class `CartographerGrid` that:
> 1. Initializes an `OrthographicCamera` for an isometric view.
> 2. Implements a styled `GridHelper` as a dark technical blueprint.
> 3. Maps 2D coordinates (X, Y) to 3D world space for building placement.
> 4. Implements smooth pan and zoom controls (restrict rotation).

---

### 5. 🎞️ Git History "Chrono-Slider"
**Purpose:** Logic for animating buildings rising/falling during timeline scrubbing.

> Write the animation logic for `updateGridState(files, timestamp)`. 
> - If `timestamp >= createdAt`: Scale the mesh Y-axis from 0 to 1 with an `elastic.out` easing.
> - If `timestamp > deletedAt`: Scale Y-axis from 1 to 0 with a `linear` ease-in.
> **Performance:** Ensure logic runs per-frame without re-instantiating meshes.

---

> [!TIP]
> Use these prompts with **Claude 3.5 Sonnet** for the best code generation and architectural analysis results.
