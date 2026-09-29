# Waypoint · static prototype site

Team smoothOperator · Rootcode Tech-Triathlon 2026 · Designathon

A plain HTML and CSS site with no build step, no npm and no framework. All paths are relative, so it works at a domain root or in a GitHub Pages subfolder.

## What's inside

| Path | What it is |
|---|---|
| `index.html` | Landing page: the problem, how it works, and the four persona prototypes |
| `dispatcher.html` | Kavindi, Dispatcher: DP1 to DP6 in a desktop browser frame |
| `loader.html` | Ruwan, Loader: LD1 to LD6 in an iPad frame (landscape) |
| `driver.html` | Chamara, Driver: DR1 to DR7 in a phone frame |
| `store.html` | Nadeeka, Store manager: SM1 to SM7 in a desktop browser frame |
| `docs.html` | Design documents: cover, three problems, personas, tradeoff, style guide, brand guide, AI disclosure |
| `screens/` | The original 34 `.dc.html` screens from the design file |
| `assets/` | Site styles, the viewer script, the design system CSS, the architecture and deployment diagrams |

Every persona page has a "Back to Waypoint" link to `index.html`, previous and next buttons, a screen list, and arrow-key navigation. On the loader and driver degradation screens (LD4, DR5, DR6), the design rationale is shown in the side panel next to the device.

## Try it locally

```bash
cd waypoint-site
python3 -m http.server 8000
# open http://localhost:8000
```

Use a local server rather than double-clicking `index.html`. Browsers block a page opened from the file system from reading the screen inside its frame, so the device frames can't crop the screens. The landing page itself works either way.

## Deploy on GitHub Pages

1. Create a new GitHub repository and upload everything inside this folder, so `index.html` sits at the top level of the repository.
2. In the repository, go to **Settings → Pages**. Under "Build and deployment", choose **Deploy from a branch**, pick `main` and `/ (root)`, and save.
3. Wait about a minute, then open the address GitHub shows on that page (`https://<your-username>.github.io/<repo-name>/`).

## Deploy on Vercel

1. Push this folder to a GitHub repository (as in step 1 above), or install the Vercel CLI.
2. On vercel.com choose **Add New → Project**, import the repository, set **Framework Preset** to **Other**, and leave the build command and output directory empty.
3. Click **Deploy**. Vercel gives you a `https://<project>.vercel.app` address.

CLI alternative: run `npx vercel` inside this folder and accept the defaults, then `npx vercel --prod`.

## What was changed from the claude.ai design file, and why

The screens are the originals. Only these things were changed or left out, because they depend on claude.ai:

- **Stylesheet path (one line in each screen).** Each screen linked its CSS as `/_blob/4b7b…`, an absolute path to claude.ai's file storage that doesn't exist anywhere else. It now points to `../assets/waypoint-ds.css`, which is the same design system file.
- **`screens/support.js` is an empty stub.** On claude.ai this file is served by the Design canvas runtime. The screens are static HTML and CSS and don't need it, so the stub just prevents a missing-file error.
- **The `artifact-type/` runtime folder is not included.** It is claude.ai's Design canvas app (`app.js`, `dc-runtime.js`, the canvas styles and its reference notes). It provides the pan-and-zoom canvas, sign-in, comments, the shared database and "ask Claude". It only runs inside claude.ai, and none of the screens need it to render.
- **Also left out:** `canvas.json` (the canvas layout), the Design type's `SKILL.md` and `index.html`, and the database, comments and user-profile capabilities declared by the artifact. None of them are used by the screens.
- **Kept but inert:** each screen still contains a `<script type="text/x-dc">` block and the `<x-dc>` and `<helmet>` wrapper tags. Browsers ignore the script type and render the wrapper tags as plain containers, so they do nothing outside claude.ai.

## Needs an internet connection for

Fonts load from Google Fonts (Big Shoulders, Big Shoulders Stencil, IBM Plex Sans, IBM Plex Mono). Without internet the pages fall back to system fonts.

## Test results

Tested with `python3 -m http.server` in Chromium at 1440×900, 820×1180 and 390×844:

- `index.html` loads with no console errors and no failed requests.
- **All 34 screens** were opened one by one through their persona page. Every one rendered with the design system stylesheet applied, no script errors and no missing files: DP1 to DP6 (desktop), LD1 to LD6 (iPad), DR1 to DR7 (phone), SM1 to SM7 (desktop), and the 8 design documents. None failed outside claude.ai.
- Arrow keys move between screens, keyboard focus is visible (3 px outline), and links inside a screen that lead to another persona (for example DR6 to DP6) open the right persona page.
- Opened straight from the file system (`file://`), the landing page works, and the persona pages show a notice asking you to use a local server, because the browser blocks the frame from reading the screen.
- Google Fonts is blocked in the test environment, so fonts were served from a local copy during testing. On GitHub Pages and Vercel they load from Google Fonts as normal.
