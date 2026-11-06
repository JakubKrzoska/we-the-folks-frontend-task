# Decisions

## Both variants

- **Plain HTML, CSS and ES modules, with vendored GSAP.** There's no bundler, so the code you read is the code that runs. GSAP is in the repository so it counts towards the weight and doesn't depend on a CDN.
- **Positions are measured, not judged by eye.** I matched the supplied layers against the design files by pixel, then used image diffs to confirm them.
- **Reduced motion shows the final state.** Both variants reach the same layout without animation.

## Variant A: Gut Run

**Scaling**
- A fixed 360x640 stage is scaled to fit `visualViewport`, so browser toolbars are accounted for and nothing distorts.
- Spare space around the stage is filled with a gradient that continues the screen's colours, so tall phones don't show bars.

**Canvas and DOM**
- Gameplay is drawn on canvas, because it redraws every frame.
- The start screen, endcards and buttons are DOM, because they're mostly static, GSAP can animate them directly, and buttons get real accessible behaviour.
- I didn't use Phaser. The game is small enough that a framework would add weight without saving much code.

**Game structure**
- `game.js` holds the rules and doesn't touch the browser, so I could simulate runs in Node.
- One state machine (start, playing, won, failed) and one `initialState()` reset mean a replay can't leave timers or speed behind.
- Physics uses elapsed time, with the frame time clamped, so it plays the same at any frame rate and doesn't jump after a stall.

**Collision**
- The player is a circle and obstacles are capsules (a line with a radius), fitted to the sprite's pixels. Rectangles would have been unfair on the angled bacteria and text.
- Hitboxes are slightly smaller than the art, so near misses feel fair. `?debug=1` draws them.

**Level design**
- The 15 obstacles come from one fixed list, so each appears exactly once.
- I checked the level by measuring the free corridor at each obstacle, which is at least 213 px. Bots with a slow reaction time gave unreliable results.
- Gravity is reduced at the start of a run, because the player could otherwise die in under a second after one tap.

**Audio**
- Web Audio, for a gapless music loop and separate music and effects volumes.
- The loop is trimmed to its audible range, because MP3 encoding adds silence at both ends.
- Audio unlocks on the first pointer or touch event, and the game still works if a file is missing.

**Pause**
- A hidden tab stops the game, audio and GSAP. On return, a run waits for a tap, so the player isn't dropped straight away.

**Accidental taps**
- Endcard buttons only become clickable after their entrance has finished. Before this, frantic tapping after a crash could open the landing page.

## Variant B: Fireplace

**Background: moss from `bg-big.jpg`, packs from the pre-cut files**

| Option | Matches the layout | Seams |
|---|---|---|
| Pre-cut `bg.jpg` | Yes | Visible joins, and the rock is sliced |
| `bg-big.jpg` | No, its packs differ | One continuous photo |
| Chosen hybrid | Packs and foreground do; the moss differs slightly | One continuous photo |

The brief asks for one surface, and a mismatch at a seam is more noticeable than a different moss crop. Taking the packs from the pre-cut files keeps the product in the layout's exact position and size.

`bg-big.jpg` is 16 px wider than the three parts combined. That accounts for the 4 CSS px gaps between parts in the layout, so the slices keep those gaps.

**Product layer**
- There was no separate product image, so `tools/prepare_fireplace_assets.py` cuts each pack out with a polygon and hides the baked-in pack using Poisson-blended moss from elsewhere in the photo.
- It's a script, so the process is repeatable and reviewable.
- The cloned moss comes from areas the ad never shows, so nothing looks repeated.

**Zoom and seams**
- All three parts zoom around one point, the centre of the whole fireplace. If each zoomed around its own centre, the seams would drift apart.
- That origin pulls inner edges away from the centre, so each background extends past its creative: 40 px on the side parts' inner edges and 20 px under the banner. That's enough for the 108% start of the intro.
- The background settles from 108% down to 100%, rather than zooming in as the brief's example suggests, so that the intro lands exactly on the measured layout.
- The after-intro drift goes to 102% and back for the same reason. When looping stops at 30 seconds, the page matches the design exactly.

**Opaque assets**
- `left/hl.png`, `right/hl.png`, `box.png` and `cta.png` have black where they should be transparent. I handled this in CSS, so the supplied files stay untouched:
  - Copy uses `mix-blend-mode: screen`.
  - The panel is cut with `clip-path`.
  - The CTA uses `border-radius`.
- The panel's opacity of 0.93 was fitted against the layout. I'd assumed `screen` blending at first, but measurement ruled it out.
- The layout's panel and CTA are more muted than the PNGs, which have no colour profile, so a small CSS `filter` brings them closer.

**Headline**
- The top headline is one image, so `top.html` shows it three times, each clipped to one line. That allows a line-by-line build with no extra download.

**Sync**
- Each part reports to its host with `postMessage` once its images are decoded, and `preview.html` starts all three from one signal. In testing they started within 1 ms of each other.
- A real publisher page won't know this protocol, so a part stops waiting after 2.5 seconds, and starts at once when opened alone.
- A part that arrives after the timeout plays late, because holding back the other two on a live page would be worse.

**Clickout**
- Each part is a real link, with `href` set from `clickTag`. That gives keyboard support and avoids pop-up blockers, with less code than a click handler.
- The game uses `window.open` instead, because its buttons sit on top of a tap-driven game and need to respect its state.

**Performance**
- Only `transform` and `opacity` are animated.
- The background's `will-change` is removed once its last zoom has finished.
- Images are decoded before the intro starts, so nothing pops in partway through.

## Compression

- Effects went to 128 kb/s, which suits short sounds and saved the most.
- I left the music alone. It's already 64 kb/s, and re-encoding it would lower the quality and risk the loop.
- The packs moved to WebP, since they need transparency and were the largest images. The small text stays sharp at quality 90.
