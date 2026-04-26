# AIArsenal E2E Tests

Playwright suite covering the critical happy paths.

## Setup (one-time)

```
npm install
npx playwright install chromium webkit
```

## Run

```
npm run test:e2e          # headless, all projects
npm run test:e2e:ui       # interactive UI mode
```

By default the runner spins up `npm run dev` on `localhost:3000`. To
test against a deployed environment instead:

```
PLAYWRIGHT_BASE_URL=https://ai-arsenal-nu.vercel.app npm run test:e2e
```

## What's covered

| File | Covers |
|---|---|
| `e2e/landing.spec.js` | Splash renders, EXPLORE TOOLS dismisses it |
| `e2e/quiz.spec.js` | Full intro → 5-question walk → result redirect; invalid result page |
| `e2e/build.spec.js` | Tool picker adds tools to a stack, save flow; multi-compare with prefilled URL |
| `e2e/api.spec.js` | Sitemap content, /api/votes shape, /api/quiz validation, /api/quiz/og returns an image |

## What's not covered (yet)

- /scaffold AI generation (slow + non-deterministic)
- /ask multi-turn chat (depends on Gemini availability)
- /admin (password-gated)
- /migrate (depends on Gemini)
- Visual regression
