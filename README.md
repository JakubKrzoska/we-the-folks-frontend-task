# We The Folks: Junior Frontend Engineer task

Both variants are built:

- **Variant A, Gut Run:** a mobile tap-to-jump game, in `game/`.
- **Variant B, Fireplace:** a three-part animated desktop skin, in `fireplace/`.

The reasoning behind the main choices is in [DECISIONS.md](DECISIONS.md).

## Run it

From the repository root:

```bash
npx serve
```

Then open the address it prints, usually:

- Game: <http://localhost:3000/game/>
- Fireplace: <http://localhost:3000/fireplace/preview.html>

It needs a local server, because ES modules and Web Audio don't work from `file://`. There's no build step.

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

**Assets and design**

- `gesture.png` says "tab to run", while the brief says "tap to run". The text is baked into the asset, so I left it.
- The top headline asset reads "STARK BEI HUSTENREIZ & HALSSCHMERZEN.", while `layout.png` reads "NATÜRLICH STARK BEI...". I used the asset as supplied, so the banner's text differs from the layout.
- The moss doesn't match `layout.png` exactly, and there are fewer flowers on the right. This is the cost of a continuous background (see DECISIONS.md).
- The packs were cut out of the backgrounds, because there was no separate layer. The moss under them is patched, and a very faint soft area remains just above the right pack, visible only when zoomed in.
- The panel and CTA are slightly off the layout's colours even after a CSS correction.
- Endcard copy has slightly wider letter-spacing than the designs, because it's baked into the PNGs.

**Behaviour**

- Pausing reacts to tab changes only. A game scrolled out of view keeps running.
- If a fireplace part loads after the 2.5 second sync timeout, it plays its intro late.
- Both win sounds play together, and the applause runs for 15 seconds.
- Replay returns to the start screen instead of restarting the run at once.
- On very short screens, the stage is scaled to fit and the gut stops at the stage edge.

**Delivery**

- The three creatives share one CSS and one JS file. Real ad delivery would need each packaged separately.
- Each variant ships its own copy of GSAP, so it can be delivered alone.
- `tools/prepare_fireplace_assets.py` needs the original assets next to the repository, in `../variant-b-fireplace/`.

## With more time

- Test on a real iPhone and fix anything Safari does differently.
- Pause the game with an `IntersectionObserver` when it's scrolled off screen.
- Package each creative as a standalone ad with its CSS and JS inlined.
- Ask the design team for transparent `hl`, `box` and `cta` layers, a product layer and the correct headline, then remove the CSS workarounds.
- Keep the Playwright checks in the repository and run them on every push.

## Questions for the team

I worked from these assumptions, and would adjust them if you see it differently:

1. Is the top headline meant to say "STARK BEI" as in the asset, or "NATÜRLICH STARK BEI" as in the layout?
2. Can you supply the product as a separate layer? I cut it out of the backgrounds myself.
3. Does the 3 MB limit apply per variant or to both together? Both options fit, but I treated it as per variant.
4. Should I keep "tab to run", or is that a typo in the asset?
5. Should the applause and cheer play together on a win, or is only one intended?

## How I used AI

I used Claude Code throughout, with Playwright for browser checks. It helped me plan the work, measure the designs, write most of the code, compress the assets and draft these documents. I made the decisions on feel and scope, playtested the game and tuned it, including the timing, the volume and the wait before the win endcard.

It was wrong several times. The clearest case was the fireplace's background zoom. It built the shared zoom origin correctly, but didn't account for the images having no photo beyond their edges, so black bands appeared beside the seams while the zoom ran. Its check only compared the final frame, where the bands don't exist, so the bug passed. A later seam test exposed it, and the fix was to export each background slightly larger than its creative and to test the first frame as well.
