# Data Structure Visualizer

An application for visualizing data structures and algorithms. Write JavaScript code in the editor and watch your algorithms come to life with real-time animated visualizations.

**[Live Demo](https://danielterwiel.github.io/vis/)**

_NOTE_: This project is still in development and may contain bugs or incomplete features.

_NOTE_: This project is was my first iteration using Ralph Wiggum, so it's not perfect.

## Features

- **Interactive Code Editor** - CodeMirror-powered editor with syntax highlighting and autocomplete
- **Real-time Visualization** - D3.js + SVG animated visualizations that respond to your code
- **Multiple Data Structures** - Arrays, Linked Lists, Trees, Graphs, and more
- **Test Cases** - Built-in test cases at 3 difficulty levels (Easy, Medium, Hard)
- **Sandboxed Execution** - Safe code execution with infinite loop protection
- **100% Client-side** - No backend required, runs entirely in your browser

## Tech Stack

- React 19 + Vite 6 + TypeScript
- CodeMirror 6 for code editing
- D3.js for data visualizations
- Framer Motion for animations
- SWC WASM for code transformation
- Zustand for state management

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Validate (lint, format, typecheck, test)
npm run validate

# Build for production
npm run build
```

## Deployment

This project automatically deploys to GitHub Pages on push to `main`. To deploy manually:

1. Enable GitHub Pages in your repository settings
2. Set source to "GitHub Actions"
3. Push to `main` or trigger the workflow manually

## License

MIT
