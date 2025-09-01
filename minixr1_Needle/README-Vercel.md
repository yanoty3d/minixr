# Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Needle Cloud Token** (optional): For advanced Needle Engine features

## Deployment Steps

### Method 1: Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to the Next.js project directory:
```bash
cd minixr1_Needle
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Set project name
   - Configure build settings (should auto-detect)

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Connect your repository to Vercel:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js configuration

### Method 3: Manual Upload

1. Build the project locally:
```bash
npm run build
```

2. Upload the `out` directory to Vercel

## Environment Variables

If you need Needle Cloud features, add the following environment variable in Vercel dashboard:

- Key: `NEEDLE_CLOUD_TOKEN`
- Value: Your Needle Cloud token

## Build Configuration

The project is configured with:
- **Output**: Static export (`output: 'export'`)
- **Build Directory**: `out`
- **Build Command**: `npm run build`
- **Framework**: Next.js

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Check that Unity assets are properly exported to `public/assets/`

### Asset Loading Issues
- Verify asset paths in `needle.config.json`
- Check that GLB files are accessible in `public/assets/`

### Performance Optimization
- Enable Vercel Edge Functions for better performance
- Use Vercel's CDN for static assets
- Consider implementing Vercel Analytics

## Project Structure for Vercel

```
minixr1_Needle/
├── public/assets/          # Unity exported assets (GLB files)
├── src/
│   ├── pages/             # Next.js pages
│   ├── generated/         # Auto-generated Needle code
│   └── needleEngine.tsx   # Main Needle component
├── vercel.json            # Vercel configuration
├── .vercelignore         # Files to ignore during deployment
└── package.json          # Updated with Vercel build scripts
```

## Notes

- The application will be deployed as a static site
- Unity content is rendered client-side using Needle Engine
- WebGL content requires HTTPS (Vercel provides this automatically)
- First load might be slower due to WebGL initialization