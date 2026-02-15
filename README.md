# Circuit Forge

A progressive web app (PWA) for high-intensity interval training (HIIT) at home. No equipment required — bodyweight and a chair are enough. Circuit Forge builds personalized circuits, rotates muscle groups across sessions, and works offline.

## Features

- **Smart workout generation** — Picks 3 muscle groups per session (2 from last workout + 1 new) for balanced load and variety
- **Configurable sessions** — Set exercise duration, exercises per cycle, and number of cycles
- **Exercise database** — Built-in exercises; add, edit, and remove your own (stored locally)
- **Voice cues (TTS)** — Countdowns and exercise announcements via browser Web Speech API
- **PWA** — Install on your device, use offline
- **Mobile-friendly** — Responsive UI and touch-friendly controls

## Tech stack

- **React 19** + **TypeScript**
- **Vite**
- **Tailwind CSS** (via CDN in dev)
- **localStorage** for settings, profile, workout history, and custom exercises

## Quick start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/circuit-forge.git
cd circuit-forge

# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Preview production build locally:**

```bash
npm run preview
```

## Deploy (GitHub Pages)

On every push to `main`, the [GitHub Actions workflow](.github/workflows/deploy-pages.yml) builds and deploys to GitHub Pages.

1. In the repo: **Settings → Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**
3. After the first successful run, the app is available at:
   `https://<owner>.github.io/<repo-name>/`

## Project structure

| Path | Description |
|------|-------------|
| `components/` | UI: setup, workout, settings, exercise database, timer, buttons |
| `services/` | Data, settings, profile, workout history, TTS, workout generator |
| `constants.ts` | Exercise seed data, defaults, types |
| `docs/` | [Architecture](docs/architecture.md), [Tasks](docs/tasks.md) |

## Documentation

- [Architecture & roadmap](docs/architecture.md) — Design, data model, and future phases (backend, native apps, social features)
- [Tasks](docs/tasks.md) — Current tasks and known issues

## License

See [LICENSE](LICENSE) in this repository (if present).
