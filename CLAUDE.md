# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a hybrid Unity/Next.js project that combines Unity 3D content with web deployment through Needle Engine. The repository contains:

- `minixr1/`: Unity project with 3D content and scenes
- `minixr1_Needle/`: Next.js web application that renders Unity content in the browser using Needle Engine

## Core Architecture

The project uses Needle Engine to bridge Unity and web technologies:

1. **Unity Side (minixr1/)**:
   - Unity scenes are exported as GLB files
   - C# components are transpiled to TypeScript
   - Assets are processed through Needle's build pipeline

2. **Web Side (minixr1_Needle/)**:
   - Next.js application with React components
   - Custom Needle Engine component (`src/needleEngine.tsx`) renders Unity content
   - Auto-generated TypeScript bindings in `src/generated/`
   - Tailwind CSS for styling

3. **Build Pipeline Integration**:
   - `needle.config.json` configures asset paths and build directories
   - Unity content is built into `dist/` directory
   - Next.js handles web bundling with Needle Engine integration

## Common Development Commands

Navigate to `minixr1_Needle/` directory for all web development commands:

```bash
cd minixr1_Needle
```

### Development
```bash
npm run dev          # Start development server with HTTPS
npm run build        # Build production bundle and process GLB files
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Key Build Process
The build command (`npm run build`) runs two steps:
1. `next build` - Creates Next.js production build
2. `npx @needle-tools/gltf-build-pipeline transform ./dist` - Processes Unity GLB files

## Development Workflow

1. **Unity Changes**: Make changes in Unity project (`minixr1/`)
2. **Auto-Generation**: Needle Engine automatically generates TypeScript bindings
3. **Web Development**: Develop React components in `minixr1_Needle/src/`
4. **Testing**: Use `npm run dev` to test locally with HTTPS
5. **Deployment**: Build and deploy to Needle Cloud via GitHub Actions

## File Structure Significance

- `minixr1_Needle/src/needleEngine.tsx`: Main component that renders Unity content
- `minixr1_Needle/src/generated/`: Auto-generated TypeScript from Unity components
- `minixr1_Needle/needle.config.json`: Needle Engine configuration
- `minixr1_Needle/next.config.js`: Next.js configuration with Needle plugin
- `minixr1/Assets/Scenes/`: Unity scenes that get exported to web

## Deployment

The project uses GitHub Actions for automated deployment:
- **Main branch**: Deploys to production via `deploy.yml`
- **Test branch**: Deploys to staging environment via `test.yml`
- Both workflows deploy to Needle Cloud using `NEEDLE_CLOUD_TOKEN` secret

## Unity-Web Integration Points

- Unity C# scripts are automatically transpiled to TypeScript
- Unity scenes are exported as GLB files and loaded by the web component
- The `firstpersoncontroller` dependency links Unity's FirstPersonController package
- Generated code in `src/generated/gen.js` contains exported Unity assets

## Development Environment Setup

1. Unity project should be opened in Unity Editor
2. Node.js development happens in `minixr1_Needle/` directory
3. Use HTTPS development server for proper WebGL/WebXR testing
4. Ensure `NEEDLE_CLOUD_TOKEN` is configured for builds that include cloud features
- Unityのsceneファイルは、CLIから修正するのが難しいので、Unity Editor上で修正するようユーザーに指示せよ。