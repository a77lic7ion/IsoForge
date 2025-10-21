# IsoForge - AI-Powered 2D Isometric Asset Generator for Godot

IsoForge is a specialized, web-based tool designed to streamline the creation of 2D isometric game assets for the **Godot game engine**. It leverages the power of generative AI to produce high-quality sprites from text prompts and exports them as engine-ready resources, bridging the gap between creative ideation and practical game development.

The core value proposition is its "ready-to-use" export feature. IsoForge doesn't just generate PNG images; it automatically creates the necessary Godot-specific metadata files (`.tscn` and `.import`), allowing developers to drag and drop the exported `.zip` directly into a Godot project for immediate use without manual import configuration.

![IsoForge Screenshot](https://storage.googleapis.com/aistudio-hosting/readme_assets/isoforge/isoforge-screenshot.png)

## ✨ Core Features

-   **AI Asset Generation**: Utilizes Google's powerful `gemini-2.5-flash-image` model or a local ComfyUI instance to generate high-quality, transparent PNG sprites from simple text descriptions.
-   **Advanced Generation Controls**:
    -   Specify asset types (sprite vs. background), artistic styles (vector, cartoon, HD), and precise camera angles (8 isometric views, top-down, side-scrolling).
-   **Iterative Refinement**:
    -   **Inpainting**: An integrated canvas editor allows you to paint a mask over any part of an asset and regenerate just that area with a new prompt.
    -   **Regenerate & Edit**: Easily get variations of an asset or tweak your initial settings to refine the output.
-   **Godot-Ready Exports**: The "Export as .zip" feature packages the PNG image with its corresponding `.tscn` (Scene file) and `.import` (Godot import settings) files.
-   **Project-Based Workflow**:
    -   **Projects**: Organize your assets into separate projects for different games or collections.
    -   **Session Scratchpad**: A global "session" area acts as a temporary workspace for all newly generated assets.
    -   **Project Library**: Save your best assets from the session directly into the active project's library.
    -   **Full Persistence**: All projects, libraries, and your session are automatically saved to your browser's **IndexedDB**, providing a large, persistent storage space.

## 🛠️ Technology Stack

-   **Frontend**:
    -   **React**: For building a component-based, interactive user interface.
    -   **TypeScript**: For static typing and a more robust codebase.
    -   **Tailwind CSS**: For rapid, utility-first styling.
-   **Generative AI**:
    -   **Google Gemini API**: The core cloud engine for image generation and inpainting.
    -   **ComfyUI**: Support for a self-hosted local backend for ultimate flexibility.
-   **Browser APIs**:
    -   **Canvas API**: Powers the interactive inpainting editor.
    -   **IndexedDB**: For robust, large-scale client-side persistence of all user projects and assets.
-   **Libraries**:
    -   **JSZip**: Used for creating the `.zip` archives for Godot exports.

## 🚀 Getting Started

To run IsoForge locally, follow these steps:

**1. Clone the repository:**
```bash
git clone <repository-url>
cd isoforge-project
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure your API Key:**
IsoForge can use either the Google Gemini API or a local ComfyUI instance for generation.

-   After running the application, click the **settings icon** (⚙️) in the top-right corner.
-   Select your preferred **Generation Provider**.
-   If using **Gemini API**, enter your API key in the provided field. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey). Your key is stored securely in your browser's local storage and is never sent to any server other than Google's.
-   If using **ComfyUI**, ensure your local instance is running and enter its server address (e.g., `http://127.0.0.1:8188`).

**4. Run the development server:**
```bash
npm run dev
```
The application should now be running on your local development server.

## 📂 Project Structure

The codebase is organized to separate concerns, making it modular and maintainable.

```
/
├── public/
│   └── (Static assets like favicons)
├── src/
│   ├── components/       # Reusable React UI components
│   │   ├── AssetCard.tsx
│   │   ├── AssetGrid.tsx
│   │   ├── Header.tsx
│   │   ├── InpaintingEditor.tsx
│   │   └── ...
│   ├── hooks/            # Custom React Hooks
│   │   └── useCanvasDraw.ts
│   ├── services/         # Logic for APIs and browser features
│   │   ├── geminiService.ts
│   │   ├── comfyuiService.ts
│   │   ├── godotExportService.ts
│   │   └── storageService.ts
│   ├── types.ts          # TypeScript type definitions
│   ├── App.tsx           # Main application component and state management
│   └── index.tsx         # Application entry point
├── index.html
├── package.json
└── readme.md
```

### Key Services Breakdown

-   `geminiService.ts`: Handles all communication with the Google Gemini API for both generating new images and performing inpainting edits.
-   `comfyuiService.ts`: Integrates with a local ComfyUI instance via its WebSocket and HTTP API for generation and inpainting.
-   `godotExportService.ts`: Contains the logic for generating the Godot-specific `.tscn` and `.import` file content, creating `.zip` archives, and triggering file downloads.
-   `storageService.ts`: Manages saving and loading all user projects and the global session to and from the browser's **IndexedDB**.