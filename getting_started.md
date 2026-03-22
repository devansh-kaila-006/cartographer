# 🚀 Getting Started: Project Cartographer

This document outlines the exact order of execution and the prerequisites you need to build this project.

## 📋 Prerequisites
Before you start, ensure you have the following:

1.  **Node.js & NPM:** Installed on your machine.
2.  **GitHub OAuth App:** Go to [GitHub Developer Settings](https://github.com/settings/developers) and create a New OAuth App to get a `Client ID` and `Client Secret`.
3.  **LLM API Key:** An **OpenAI** or **Anthropic** API key for the "Quantum View" summaries.
4.  **Modern Browser:** WebGL 2.0 support is required (Chrome, Edge, Safari, or Firefox).

---

## 🛠️ Order of Execution

Follow these steps in order to build Cartographer from scratch:

### 1. Project Scaffolding (Day 1)
- **Action:** Initialize a Vite project with React or Svelte.
- **Goal:** Get a "Hello World" Three.js scene running in the browser.
- **Reference:** Use the **Three.js Scaffolding Prompt** from `cartographer_prompts.md`.

### 2. GitHub Connectivity (Day 2)
- **Action:** Implement OAuth login and the `github.js` API wrapper.
- **Goal:** Fetch the file tree of a user's repository and log it to the console.
- **Reference:** See `implementation_plan.md` Phase 1.

### 3. The 2D/3D Grid (Day 3-5)
- **Action:** Map the file tree to 3D geometries (buildings) on the infinite grid.
- **Goal:** Visualize the repository city. Heights should match file sizes.
- **Reference:** Use the **UI/UX Design Prompt** for styling.

### 4. Camera & Interaction (Day 6-7)
- **Action:** Implement the "Swoop" camera transitions and zoom levels.
- **Goal:** Smoothly navigate between the "Galaxy" and "City" views.

### 5. Deep Analysis (Week 2)
- **Action:** Integrate **Tree-sitter** in a Web Worker to parse code structure.
- **Goal:** Unlock the "Blueprint" view (internal function/class geometries).
- **Reference:** See `cartographer_spec.md` Section 1.

### 6. The Intelligence Layer (Week 3)
- **Action:** Connect the LLM for "Quantum View" summaries and Semantic Search.
- **Goal:** Click a building to see an AI-generated logic summary.
- **Reference:** Use the **Quantum View Summary Prompt**.

---

## ✅ Is this all I need?

Yes, with the documents I've provided:
- **`cartographer_spec.md`**: Your technical source of truth.
- **`implementation_plan.md`**: Your development roadmap.
- **`cartographer_prompts.md`**: Your AI-powered build instructions.
- **This Guide**: Your order of operations.

**Are you ready to start with Phase 1: Project Scaffolding?**
