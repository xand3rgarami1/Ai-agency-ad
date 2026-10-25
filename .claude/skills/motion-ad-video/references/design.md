# Design and motion reference

Read this before planning scenes and again while reviewing contact sheets.

## Contents
1. Canvas and safe zones
2. Typography
3. Colour
4. Motion vocabulary
5. Pacing and transitions
6. Mock software UI
7. Honesty rules for ad content
8. Reviewing frames

## 1. Canvas and safe zones

- 1080×1920, 30 fps. Design in absolute pixels; every number in the template assumes this size.
- Reels/TikTok/Shorts cover the top ~220 px (status, tabs) and bottom ~380 px (caption, buttons)
  plus a strip on the right. Keep headlines between y≈170 and y≈1550 and the CTA and logo
  centred above y≈1600. Decoration can go anywhere.
- One idea per screen. Four mock windows is the ceiling for a "busy" shot; more turns into noise
  on a phone.

## 2. Typography

- Fonts: `Inter Display` (headlines, 800–900, tracking −0.035 to −0.045em), `Inter` (UI and body),
  `JetBrains Mono` (data, kickers, counters). Check `fc-list` first; if they're missing, install
  them (OFL) or pick installed equivalents and update `FONTS` in `brand.ts`.
- Scale at 1080 wide: hero 190–210, headline 100–150, setup line 54–84, UI 26–30. Nothing that
  carries meaning goes below 26 px; it's unreadable on a phone.
- **Break headline lines yourself.** Auto-wrap at 100 px+ produces orphans like
  "can't keep / up". Give each line its own `KineticWords` with a slice of the narration words.
  Width estimate for Inter Display Black uppercase: about 0.66 × font-size per character. A line
  must fit 940 px (60 px margins).
- Stacked one-to-two-word lines ("LEADS / SLIPPING / THROUGH.") read faster than one long line and
  look deliberate.
- Use typographic apostrophes (’) on screen. `lineWords()` converts them; literal strings in
  scenes need `’`.
- Hierarchy per beat: a small setup line in a muted colour (text2), then the payload word(s) heavy.
  Emphasis colour goes on one word, not the whole line.

## 3. Colour

- Black background, white type, one accent. Use the accent for meaning, not decoration: highlights,
  active/connected states, workflow paths, CTA, the period of the last line.
- The "problem" half of the ad stays greyscale; the accent arrives with the solution. That contrast
  carries the story without extra effects.
- Glows stay soft (box-shadow 30–60 px at ≤0.5 alpha). A subtle grain (opacity ≈0.045) and
  vignette help depth; stronger grain balloons the file size.

## 4. Motion vocabulary (all in `src/components`)

| Effect | Component | Use for |
|---|---|---|
| Blur-rise reveal per word, timed to the voice | `KineticWords` | most spoken copy |
| Tracking collapse + scale + blur "slam" | `Slam` | the one or two words that must hit |
| Slide up from a mask | `MaskLine` | calm, restrained reveals |
| Stacked left-aligned headline with index | `StackHeadline` | rapid problem beats (01/03 …) |
| Scene enter/exit: `blurZoom`, `rise`, `fade` / `zoomThrough`, `recede` | `Scene` | every cut |
| Drawn bezier path + glow + travelling pulses | `Connector` | data moving between systems |
| Dashed path that never meets | `Connector dashed` | "disconnected" state |
| Window chrome with title, icon, badge, active glow | `Panel`, `Badge`, `Status` | all mock UI |

Ease-out (`EASE_OUT`, bezier 0.16,1,0.3,1) for entrances, `EASE_IN` for exits, `EASE_IN_OUT` for
moves. Entrances 0.3–0.45 s, exits 0.15–0.25 s. Words appear ~0.08 s before they're spoken so the
eye leads the ear slightly.

Everything must be a pure function of the frame: no `Math.random()`, no `Date`; use `rand(seed)`
from `anim.ts`. That keeps renders deterministic and lets Remotion render frames in parallel.

## 5. Pacing and transitions

- Cut on words. Scene boundaries are anchors into the narration (`timeline.json`), so they stay
  locked when the voice changes.
- Rhythm used in the reference-style ad: hook in the first 0.3 s (a line of light on frame 0, first
  word by ~0.2 s), a heavy slam at ~1.5 s, quick cuts (1.3–2 s) through the problem beats, a riser
  and a drop into the solution, a calmer dashboard beat, and a static end card held ≥2 s.
- Storyboard times in a brief are usually nominal. Natural narration rarely fits them exactly;
  follow the voice and tell the user which times moved.
- Transitions: zoom-through (scale up + blur) for momentum, `rise` with a hard cut for problem
  beats, `recede` (scale down + fade) out of the solution, fade to black before the CTA.

## 6. Mock software UI

- Build it from components and SVG, never from generated images: every string must be real,
  spelled correctly, and legible.
- Use believable, generic content: "Order #10482", "Bottled water, 24 pk", "Invoice created",
  "Sync failed". Avoid names that could belong to a real local business or person.
- "Chaos" reads as duplicated rows, "Unassigned", "Waiting 72h", "Entered again · 3×", a growing
  task count, a "Sync failed" toast. "Order" reads as aligned panels, purple connections,
  checkmarks completing, a steady stream of pulses.
- Charts: draw the shape (a line rising) without axis values, so no number is claimed.

## 7. Honesty rules for ad content

- No invented statistics, testimonials, customer logos, URLs or brand marks. If the brief doesn't
  supply a logo or URL, show a clearly marked placeholder (or hide the line) and say so.
- Say what's synthetic: TTS voices, generated music.

## 8. Reviewing frames

Render stills with `node scripts/stills.mjs <dir> <sec> <sec> …` (one bundle, many frames; much
faster than repeated `remotion still`) and tile them:

```bash
ffmpeg -y -pattern_type glob -i '<dir>/t*.png' -vf "scale=360:-1,tile=5x5" <dir>/sheet.png
```

Pick times inside every beat: mid-word reveals, right after each cut, and the final frame. Look
for: clipped or orphaned words, text under the platform's overlays, overlapping panels hiding
important text, blank frames between scenes, anything that looks unfinished. Then open 2–3 frames
at full size to check small UI text.
