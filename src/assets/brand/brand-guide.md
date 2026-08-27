# Brand Guide — Jaro

*Warm, human, quietly confident. A product person who connects things — systems, people, ideas.*

This guide covers two connected identities that share one visual system: the **startup product advisory** (main positioning, warm neutral + teal palette) and **the personal blog** ("Field notes from a curious life" — books, product/course reviews, self-experiments, dance and boxing observations). They share the same mark, fonts, and construction logic; the badge system in Section 6 is currently scoped to the blog identity specifically.

---

## 1. Brand essence

**One sentence:** The startup product advisor who actually goes and finds the answer instead of guessing — approachable enough to grab a coffee with, sharp enough to trust with your funnel.

**Personality traits:** curious, direct, self-aware, a little playful, allergic to corporate speak.

**Visual throughline:** connection. Integrations connect systems. DJing connects a room. Boxing connects discipline to calm under pressure. The mark, the motifs, and the tone should all quietly reinforce "this person connects things that don't obviously belong together."

---

## 2. Color palette

Warm neutral base (for approachability) + one confident cool accent (for the "sharp operator" edge). This combo — warm foundation, cool accent — is what makes it feel human *and* credible at once, instead of picking one or the other.

| Role | Name | Hex | Usage |
|---|---|---|---|
| Background | Warm Sand | `#FAF6F0` | Page background, light mode |
| Background (dark mode) | Deep Charcoal | `#161513` | Page background, dark mode |
| Text primary | Ink | `#1E1B18` | Body copy, headings (light mode) |
| Text primary (dark mode) | Warm White | `#F5F1EA` | Body copy, headings (dark mode) |
| Text secondary | Warm Grey | `#6B6660` | Captions, metadata, secondary copy |
| Accent (primary) | Confident Teal | `#1CA9C9` | CTAs, links, icon accents, highlights |
| Accent (hover/deep) | Deep Teal | `#0E7A93` | Hover states, pressed buttons |
| Support neutral | Sand Line | `#E8E0D4` | Dividers, borders, subtle section breaks |

**Rule of thumb:** teal should never cover more than ~10% of any given screen. It's a spotlight, not a wash — use it for the thing you want someone to click or notice, not backgrounds or large blocks.

```css
:root {
  --bg: #FAF6F0;
  --bg-dark: #161513;
  --text: #1E1B18;
  --text-dark: #F5F1EA;
  --text-secondary: #6B6660;
  --accent: #1CA9C9;
  --accent-deep: #0E7A93;
  --line: #E8E0D4;
}
```

---

## 3. Typography

Clean sans-serif for structure and credibility, with a handwritten accent font used sparingly for personality — annotations, small callouts, a scribbled underline, a section label. Never use the handwritten font for body copy or anything that needs to be easily read at length.

| Role | Font | Notes |
|---|---|---|
| Headings & body | **Inter** (or **General Sans** if you want something slightly warmer) | Free on Google Fonts / Fontshare. Use weights 400 (body), 500 (subheads), 700 (headlines). |
| Wordmark & monogram letters | **Poppins**, weight 700 | Google Fonts. Used for "Jaro" in the header lockup and for the J/T letters in the mark and badges — its rounded terminals match the mark's rounded stroke caps, which is why it was chosen over Inter for this specific use. |
| Handwritten accent | **Caveat** or **Kalam** | Google Fonts, free. Use ONLY for: small annotations next to a stat, a scribbled arrow/underline SVG, a short personal aside ("yes, really" style), a signature-style sign-off, or the badge tagline (see Section 6). |

**Sizing scale (rem, mobile-first, scale up ~1.25x for desktop):**
- Body: 1rem / line-height 1.6
- H3: 1.25rem
- H2: 1.75rem
- H1: 2.5rem (desktop: 3.5–4rem)
- Handwritten accents: 1.1–1.5rem, always paired next to — never replacing — a clean-type element

```css
--font-body: 'Inter', system-ui, sans-serif;
--font-accent: 'Caveat', cursive;
```

---

## 4. Logo / mark

**Concept:** a waveform pulse — seven vertical bars rising and falling around one taller accent bar. Reads as sound (a nod to DJing), a signal spike (the exact moment something changes for a user), and a heartbeat, all at once. This is the finalized primary mark, replacing earlier node-graph concepts explored during design.

**Construction:**
- Seven bars, evenly spaced on a consistent grid (spacing = one unit; see file for exact values), rounded caps on every stroke
- All bars in Ink except the center bar, which is Confident Teal — this is the brand's signature "spotlight" moment
- Same stroke weight used throughout any extended version (e.g., letters added around it) so nothing reads as bolted-on

**Files:** `mark-accent.svg` (ink + teal, light backgrounds), `mark-mono.svg` (single-color, for contexts needing one ink only), `mark-dark-bg.svg` (reversed for dark backgrounds), `favicon.svg` (simplified 5-bar version tuned for legibility at 16–32px).

**Note:** `logo-lockup.svg` (mark + "Jaro" wordmark) is deprecated — the circular badge (Section 6) is now the primary sitewide logo, used in the header via `badge-header.svg` / `badge-header-dark.svg`. This flat pulse mark still has a role as the favicon and as a recurring section-divider motif (Section 7), just not as the header logo.

**Sizing:** the mark should read clearly at 24px (favicon) and scale cleanly up to a large hero mark. At favicon size, keep to the plain pulse only — any letters folded into it (see Section 6) will blur into illegibility that small.

---

## 6. Badge / seal system

The circular J/T badge is now the **primary sitewide logo** (header, nav, favicon-adjacent placements), not just a Field Notes-specific mark. Styled after wax-seal and stamp badges (reference: Camp Fuego Cartel).

**Two variants, used situationally:**
- **Centered** — J and T flank the pulse symmetrically, equal spacing on both sides. Use anywhere legibility at a glance matters most: header, nav, favicon, anything small or fast-scanned. This is the default/primary variant.
- **Diagonal (ascending)** — J sits bottom-left, T sits top-right, pulse rotated to run along that same diagonal. The diagonal deliberately runs bottom-left to top-right (not the reverse) so it reads as an ascending/growth trajectory rather than a decline. Use for bigger, slower moments: hero placements, the About page, print or sticker use.

**Construction:**
- Circle ring: 2.5px stroke
- J and T: Poppins Bold (700) — real typeface glyphs, not hand-drawn paths
- Pulse: same construction as the flat mark, outer bars in the primary text color, `#1CA9C9` (Confident Teal) for the center bar only — the one deliberate point of color in an otherwise monochrome badge
- Tagline (Field Notes contexts only): "Field notes from a curious life," set in Caveat, arced along the top just outside the ring. Caveat loses some clarity when curved at very small sizes — keep the tagline for larger placements and drop to a plain badge (no tagline) for anything getting shrunk small

**Color handling — two different use cases:**
- **Header/nav logo** (`badge-header.svg`, `badge-header-dark.svg`): uses Ink / Warm White per the standard light/dark palette, since this is a reactive UI element that must survive the dark-mode toggle
- **Field Notes / print / stamp contexts** (`badge-centered.svg`, `badge-diagonal.svg`, and their `-plain` variants): hardcoded `#000000`, since these are treated as fixed image assets (like a real stamp only comes in one ink color), not reactive UI

**Files:**
- `badge-header.svg` / `badge-header-dark.svg` — primary logo, no tagline, theme-reactive colors, light/dark pair
- `badge-centered.svg` / `badge-diagonal.svg` — with tagline, fixed black, for Field Notes hub / About / print
- `badge-centered-plain.svg` / `badge-diagonal-plain.svg` — without tagline, fixed black, for small fixed-image placements

---

## 7. Personal motifs (subtle nods, not a system)

Small line-icon accents, used sparingly — a footer, a divider, next to the "outside of work" section. Same thin-line construction as the logo mark, always in Ink or Warm Grey (not teal, to keep teal reserved for actions/CTAs).

- A simple line-drawn music note or turntable mark → near Salsa/DJ mentions
- A simple line-drawn glove or boxing wrap mark → near boxing mentions
- The pulse mark itself can recur as a section divider — this is the strongest recurring device since it's already your logo

**Guardrail:** no more than one motif per screen/section. If it starts feeling like a sticker sheet, pull back.

---

## 8. Photography

You said your current photos need an upgrade — worth prioritizing before launch since photography carries a lot of the "warm & approachable" mood that copy and color alone can't fully deliver.

**What to get, in priority order:**
1. One strong headshot, natural light, genuine (not stiff/corporate) expression, warm-neutral or plain background so it sits naturally on the Warm Sand palette
2. One or two candid/action shots that hint at personality without needing full context — a DJ booth or dance-floor moment, a boxing gym moment. These don't need to be posed; a bit of grain or motion blur reads as more authentic than a staged shot
3. Optional: a "working" shot — at a laptop, whiteboard, coffee shop — useful for the advisory/services section

**Treatment:** keep a consistent light, warm color grade across all photos (slightly warm white balance, moderate contrast) so they feel like one coherent set rather than photos pulled from different eras/apps.

---

## 9. Layout principles

- **Editorial rhythm, not a rigid grid.** Vary section widths and alignment slightly — a full-bleed photo moment, then a narrow centered text block, then a two-column stat callout. Predictable-but-not-uniform is the goal.
- **Generous whitespace.** Let sections breathe; this is what makes "warm & approachable" feel premium instead of cluttered.
- **8px spacing scale.** Use multiples of 8px (8, 16, 24, 32, 48, 64, 96) for all margins/padding — keeps the "clean" half of the brand intact even with editorial layout variation.
- **Dark mode:** swap background/text pairs per the palette table; keep teal accent identical in both modes (it holds up fine on both Warm Sand and Deep Charcoal).

---

## 10. Voice-to-visual consistency check

Your copy already nails "warm, direct, self-aware, no corporate speak." Make sure the visuals don't accidentally contradict that:

- ❌ Stock photography, generic icon packs, gradient blobs, glassmorphism — reads corporate-SaaS, fights the voice
- ❌ Overly polished 3D renders or AI-generated hero art — same issue
- ✅ Real photos, thin hand-drawn-feeling linework, warm neutral tones, teal used like a highlighter rather than a paint bucket

---

## Quick reference (copy-paste for Cursor)

```css
:root {
  /* Colors */
  --bg: #FAF6F0;
  --bg-dark: #161513;
  --text: #1E1B18;
  --text-dark: #F5F1EA;
  --text-secondary: #6B6660;
  --accent: #1CA9C9;
  --accent-deep: #0E7A93;
  --line: #E8E0D4;

  /* Fonts */
  --font-body: 'Inter', system-ui, sans-serif;
  --font-wordmark: 'Poppins', sans-serif;
  --font-accent: 'Caveat', cursive;

  /* Spacing scale */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-6: 48px;
  --space-8: 64px;
  --space-12: 96px;
}
```
