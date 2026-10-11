# Completed

## Product foundation

- [x] NO-KIT product direction and Touch Grass philosophy documented
- [x] Wind Hacker defined as the default judge/demo path
- [x] No-account, local-first MVP decision made
- [x] Safety boundaries defined: no fire, weapons, mains electricity, dangerous chemistry, unsafe ingestion, or dangerous heights

## Frontend and UX

- [x] React + Vite + TypeScript scaffold
- [x] Mobile-first responsive layout
- [x] Home, scan, challenge, mission, build, attempt, outside, result, discovery, and shelf states
- [x] Reusable tactile button, chip, card, camera, hint, result, and shelf patterns
- [x] Playful visual system with blue sky, warm paper, citrus, coral, teal, lime, and magenta
- [x] Reduced-motion support and keyboard focus states
- [x] React root mount fixed after blank-screen QA failure
- [x] Optional local multi-instrument music with autoplay fallback and restartable toggle
- [x] Local progress persistence
- [x] Responsive website shell with PLAY, EXPLORE, JOURNAL, and MY SHELF navigation
- [x] Explore surface with curated challenge cards
- [x] Journal surface with saved prediction/observation summary

## Image input

- [x] Mobile camera capture input
- [x] Gallery upload input
- [x] Client-side JPEG compression
- [x] Material image preview
- [x] Remove and retry photo action
- [x] Loading/scanning state
- [x] Error state with Demo Mode fallback
- [x] Editable detected chips
- [x] Manual add-material action

## Backend and AI

- [x] FastAPI Web Service
- [x] CORS configuration
- [x] `GET /health`
- [x] Pydantic request/response validation
- [x] `AIProvider` abstraction
- [x] `DemoProvider`
- [x] OpenAI-compatible open-weight provider adapter
- [x] Configurable `AI_BASE_URL`, `AI_API_KEY`, `VISION_MODEL`, `TEXT_MODEL`, and `AI_PROVIDER`
- [x] Structured material detection response
- [x] Challenge generation endpoint
- [x] Attempt evaluation endpoint
- [x] Socratic hint endpoint
- [x] Discovery explanation endpoint
- [x] Hidden-solution protection in public challenge responses
- [x] Timeout, invalid JSON, unavailable endpoint, and unreadable-image handling

## Reasoning and challenge library

- [x] Material normalization and aliases
- [x] Physical property inference
- [x] Feasibility scoring
- [x] Safety filtering
- [x] Learning-value scoring
- [x] Touch Grass/outdoor scoring
- [x] Best-three challenge selection
- [x] Wind Hacker
- [x] Shadow Clock
- [x] Rain Measurer
- [x] Tree Height
- [x] Bridge Breaker
- [x] Sound Phone
- [x] Water Filter Experiment with `DO NOT DRINK` safety copy
- [x] Paper Glider
- [x] Fifteen material-combination ranking smoke tests

## Deployment and documentation

- [x] Render Web Service definition for the API
- [x] Render Static Site definition for the frontend
- [x] Frontend `VITE_API_URL` configuration
- [x] `.env.example`
- [x] Production build command
- [x] README product and architecture documentation
- [x] README complete tech stack, repository map, API contracts, data flow, deployment, QA, and definition of done
- [x] README-linked original Home, Explore, and Journal UI preview assets
- [x] Original craft-scene website artwork with children and reused materials
- [x] Full-screen interactive Grass Mode red-herring experience with touchable grass blades
- [x] Dense 108-blade Grass Mode field with pointer wind, idle sway, and touch reactions
- [x] Grass Mode now fills the complete viewport with distributed blades and layered grass texture
- [x] Grass Mode upgraded with layered farmland texture, varied blade depth, realistic shading, and continuous wind response
- [x] README Grass Mode preview asset and interaction documentation
- [x] README Render deployment steps
- [x] README API contracts and safety model
- [x] Architecture notes
- [x] Production bundle secret scan
- [x] Clean frontend production build verified

# In Progress

## Complete learning loop

- [x] Add prediction entry before Outside Mode
- [x] Add observation entry after Outside Mode
- [x] Save predictions, observations, attempts, hints, and timestamps to the local journal
- [ ] Show the journal timeline on My Shelf

## API-connected experience

- [ ] Connect challenge cards to `POST /api/challenges`
- [ ] Connect attempt photo to `POST /api/attempt/evaluate`
- [ ] Connect build hints to `POST /api/hint`
- [ ] Connect discovery explanation to `POST /api/discovery`
- [ ] Keep Wind Hacker Demo Mode deterministic while live provider responses are optional

# Next

## Product completeness

- [ ] Add challenge cards for all eight curated challenges using shared components
- [ ] Add challenge-specific mission copy, outside instructions, and success criteria
- [ ] Add challenge-specific completion cards to My Shelf
- [ ] Add build journal summary: time, attempts, hints, materials, prediction, observation
- [ ] Add a clear reset-demo action for judges
- [ ] Add a shareable local build card without requiring authentication

## PWA and mobile quality

- [ ] Add web app manifest and install metadata
- [ ] Add service worker for cached Demo Mode shell
- [ ] Test camera permissions on iOS Safari and Android Chrome
- [ ] Test image compression with large, corrupt, and unsupported files
- [ ] Test 320px, 390px, 768px, and desktop layouts
- [ ] Add browser screenshot regression checks when a browser runtime is available

## AI quality

- [ ] Add provider response fixtures for valid and invalid JSON
- [ ] Add challenge safety regression tests
- [ ] Add prompt/version metadata to provider logs without storing images
- [ ] Add model confidence thresholds and “I could not identify this” handling
- [ ] Add rate and payload limits for public deployment
- [ ] Add live provider smoke test with a free/open-weight endpoint when credentials exist

## Deployment quality

- [ ] Deploy the API to Render and verify `/health`
- [ ] Deploy the Static Site to Render with `VITE_API_URL`
- [ ] Verify production CORS from the deployed frontend origin
- [ ] Verify Demo Mode with no API credentials
- [ ] Verify no secrets in the built bundle after deployment configuration
- [ ] Add deploy rollback notes for the hackathon team

# Blockers

- None for the Demo Mode experience.
- Live AI requires a reachable OpenAI-compatible open-weight endpoint and optional server-side credentials.
- Browser screenshot automation is blocked in the current container by missing Chromium system libraries.

# Nice to Have

- [ ] Optional challenge timer
- [ ] More expressive object illustrations per challenge
- [ ] Sound effects for discovery and button presses
- [ ] Exportable build journal
- [ ] Offline-first challenge packs
- [ ] Teacher/facilitator mode without introducing accounts

# Failures And Fixes

- Python 3.14 could not build old pinned `pydantic-core`; dependency ranges were updated to releases with Python 3.14 wheels.
- Render execution differs between repository-root imports and `server/` root imports; backend imports support both.
- Ranking initially scored unrelated materials; explicit feasibility and safety filtering were added.
- Public challenge responses risked exposing `hiddenSolution`; `PublicChallenge` now omits it.
- React was defined but never mounted, producing a blue blank page; the root mount was added.
- Music could not restart after stopping because the audio context lifecycle was not reset; stop now closes and clears it.
- Unmuted autoplay is browser-controlled; NO-KIT attempts load-time playback and falls back to the first user gesture.
- The first-gesture listener was previously removed after a failed autoplay attempt; it now stays active until `AudioContext.resume()` succeeds.
- Music button clicks were being swallowed by pointerdown coordination; the button now owns a simple start/stop click path.