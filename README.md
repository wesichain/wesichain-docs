# Wesichain Docs

Documentation site for the Wesichain Rust framework, built with Astro.

## Local Development

```bash
npm install
npm run dev
```

Site runs at `http://localhost:4321` by default.

## Build

```bash
npm run build
npm run preview
```

## Content Structure

- `src/pages/` - landing pages and utility routes (`/`, `/benchmarks`, `/crate-selector`)
- `src/content/docs/` - MDX documentation content used by `/docs/*`
- `src/components/` - shared UI components used by pages/layouts
- `public/` - static assets

## Editing Guidelines

- Keep crate versions aligned with the Wesichain workspace release (`0.2.1` at time of writing).
- Prefer references to runnable examples in `wesichain/` when APIs change quickly.
- Avoid documenting the umbrella `wesichain` crate as a primary install path.
