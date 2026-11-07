# We The Folks: Junior Frontend Engineer task

Both variants are built:

- **Variant A, Gut Run:** a mobile tap-to-jump game, in `game/`.
- **Variant B, Fireplace:** a three-part animated desktop skin, in `fireplace/`.

The reasoning behind the main choices is in [DECISIONS.md](DECISIONS.md). [demo.mp4](demo.mp4) is a 48-second screen recording of both, with no sound.

## Run it

From the repository root:

```bash
npx serve
```

Then open the address it prints, usually:

- Game: <http://localhost:3000/game/>
- Fireplace: <http://localhost:3000/fireplace/preview.html>

It needs a local server, because ES modules and Web Audio don't work from `file://`. There's no build step.

`serve.json` stops `serve` from rewriting the fireplace's `.html` addresses. Those redirects drop the query string, which would switch off `?debug=1` inside the preview's iframes.

To play on a phone, connect it to the same Wi-Fi and open the Network address `npx serve` prints, plus `/game/`.

### Debug views

| URL | Shows |
|---|---|
| `/game/?debug=1` | Obstacle and player hitboxes |
| `/fireplace/preview.html?debug=1` | `layout.png` at 50% opacity over all three parts |

## Weight

| Variant | Shipped files, including GSAP | Limit |
|---|---|---|
| Game | 1.51 MB | 3 MB |
| Fireplace, all three parts | 1.42 MB | 3 MB |

Together they're 2.93 MB. `fireplace/debug/layout.jpg` (0.31 MB) and `tools/` are development aids and aren't part of the ad.

What I compressed:

- **Sound effects:** re-encoded from 320 to 128 kb/s, from 884 KB to 355 KB.
- **Product packs:** PNG to WebP at quality 90, from 614 KB to 57 KB.
- **Fireplace backgrounds:** JPEG at quality 82.
- **Left as supplied:** the music, already 64 kb/s, and the remaining PNGs, where a lossless pass saved almost nothing.

## Testing

| Where | What |
|---|---|
| Xiaomi Redmi Note 13 | Played by hand: layout, audio, mute, pause, endcards, CTAs |
| Edge, automated with Playwright | Six phone viewports from 320x460 to 430x932, seven replays, pause, every clickout, reduced motion |
| Chrome | Fireplace preview |

**Not tested:** a real iPhone and Firefox. iPhone Safari is the biggest gap, because it's the strictest browser about starting audio.

The test scripts were throwaway and aren't in the repository.

## Known issues and shortcuts

- **Fireplace vs layout:** the moss differs slightly, the cost of a continuous background. The panel and CTA colours are slightly off, and a faint soft area sits above the right pack.
- **Game endcards:** the copy has slightly wider letter-spacing than the designs, because it's baked into the PNGs.
- **Pause:** it reacts to tab changes only, so a game scrolled out of view keeps running.
- **Sync:** a fireplace part that loads after the 2.5 second timeout plays its intro late.
- **Delivery:** the three creatives share one CSS and JS file, which real ad delivery would package separately.
- **Asset script:** `tools/prepare_fireplace_assets.py` expects the original assets in `../variant-b-fireplace/`.

## With more time

- Test on a real iPhone and fix anything Safari does differently.
- Pause the game with an `IntersectionObserver` when it's scrolled off screen.
- Package each creative as a standalone ad with its CSS and JS inlined.
- Ask the design team for transparent `hl`, `box` and `cta` layers, a product layer and the correct headline, then remove the CSS workarounds.
- Keep the Playwright checks in the repository and run them on every push.

## Questions for the team

I used the assets as supplied and made these assumptions:

1. **Headline:** the asset says "STARK BEI", the layout "NATÜRLICH STARK BEI". Which is right?
2. **Product layer:** there wasn't one, so I cut the packs out of the backgrounds.
3. **"tab to run":** is this a typo in `gesture.png`?
4. **Win sounds:** I play the applause and cheer together. Was only one intended?
5. **3 MB limit:** I treated it as per variant, though both fit together too.

## How I used AI

I used Claude Code throughout, with Playwright for browser checks. It helped me plan the work, measure the designs, write most of the code, compress the assets and draft these documents. I made the decisions on feel and scope, playtested the game and tuned it, including the timing, the volume and the wait before the win endcard.

It was wrong several times. The clearest case was the fireplace's background zoom. It built the shared zoom origin correctly, but didn't account for the images having no photo beyond their edges, so black bands appeared beside the seams while the zoom ran. Its check only compared the final frame, where the bands don't exist, so the bug passed. A later seam test exposed it, and the fix was to export each background slightly larger than its creative and to test the first frame as well.
