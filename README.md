# Flippy

A memory matching tile game. Flip cards to find matching colors and clear the board in the fewest flips.

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project → import your repo
3. Vercel will auto-detect the settings from `vercel.json` — just click Deploy

Every subsequent push to `main` auto-deploys.

## Project Structure

```
flippy/
├── index.html        # Shell HTML + DOM structure
├── src/
│   ├── main.js       # All game logic (ES module)
│   └── style.css     # All styles
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

## Roadmap

- [ ] PWA / installable on mobile
- [ ] Sound effects
- [ ] Difficulty levels (more colors, time pressure)
- [ ] Capacitor wrapper for App Store / Play Store
