# Accessibility (a11y) and Responsive Design

> Group 2 · Priority MEDIUM · Prep guide Q9, Q13 · Status: new file
> Honest note: describe only the a11y work you've actually done. Don't claim audits you haven't led.

## Say it in 1 minute
"Accessibility starts with semantic HTML: a real button, link, label, heading, or landmark. Then a visible focus style, focus moved and restored for dialogs and client-side route changes, and contrast that meets WCAG 2.2 AA. Colour is never the only signal. ARIA fills a gap a native element cannot, and a div with a button role usually means the element should have been a button. I check with axe or Lighthouse, a keyboard-only pass, and a screen reader on the important flows. Role queries in React Testing Library keep some of that in the unit tests. Responsive work is mobile first: fluid flex and grid, relative units, clamp for type, container queries, and images with srcset plus width and height. Image sizing and lazy loading were a large part of the OneHome performance work too."

---

## 1. Accessibility core concepts

### WCAG 2.2: POUR
- **Perceivable**: text alternatives, captions, contrast (AA: **4.5:1** normal text, **3:1** large text and UI components), don't rely on colour alone.
- **Operable**: everything works by keyboard, no keyboard traps, visible focus, enough time, no seizure-inducing flashes. 2.2 additions: **focus not obscured**, **target size minimum 24×24 px**, alternatives to dragging, accessible authentication (no cognitive tests).
- **Understandable**: labels and instructions, clear error messages, predictable behaviour, `lang` attribute.
- **Robust**: valid semantics that work with assistive tech (name, role, value).
- Legal context in the EU: the **European Accessibility Act** has applied since **28 June 2025** to many consumer digital products and services (e-commerce, banking, e-books, transport). It references EN 301 549, which maps to WCAG.

### Semantic HTML first
```tsx
// ❌
<div className="btn" onClick={save}>Save</div>
// ✅ focusable, Enter/Space work, announced as "button"
<button type="button" onClick={save}>Save</button>

<header>, <nav aria-label="Main">, <main>, <aside>, <footer>   // landmarks
<h1> → <h2> → <h3>                                            // logical heading order, one h1 per page
<a href="/listings/42">  for navigation · <button> for actions
```

### Forms
```tsx
const id = useId();
<label htmlFor={`${id}-email`}>Email</label>
<input id={`${id}-email`} type="email" autoComplete="email"
       aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} />
{error && <p id={`${id}-err`} role="alert">{error}</p>}
```
- Placeholder isn't a label. Group radios with `<fieldset><legend>`. On submit errors, move focus to the first invalid field or an error summary.

### ARIA: the rules
1. Don't use ARIA if a native element exists ("No ARIA is better than bad ARIA").
2. Don't change native semantics (`<h2 role="button">` ❌).
3. Interactive ARIA widgets must be keyboard operable.
4. Don't use `role="presentation"` or `aria-hidden="true"` on focusable elements.
5. Every interactive element needs an accessible name.
- Useful attributes: `aria-label`/`aria-labelledby`, `aria-describedby`, `aria-expanded`, `aria-controls`, `aria-current="page"`, `aria-live="polite"` (status messages), `role="alert"` (assertive), `aria-busy`.

### Keyboard and focus
- Tab order follows the DOM. Avoid positive `tabindex`. `tabindex="0"` makes something focusable, `-1` makes it programmatically focusable.
- **Never remove the focus outline** without a replacement. Use `:focus-visible`.
- **Modals**: use native `<dialog>` with `showModal()` (it handles focus trapping, Esc and inertness), or trap focus manually. Return focus to the trigger on close.
- **SPA route change**: move focus to the new page's `<h1>` or announce the title via a live region (screen readers don't notice client-side navigation).
- "Skip to content" link at the top.

### Images and media
- Informative images get meaningful `alt`. Decorative ones get `alt=""`. Icon-only buttons get `aria-label`.
- Video: captions, transcripts, keyboard-accessible player controls, no autoplay with sound. Relevant to the JD's media nice-to-have.
- Respect `prefers-reduced-motion`.

### Testing a11y
- Automated: **axe** (browser extension, `jest-axe`, `@axe-core/playwright`), Lighthouse, ESLint `eslint-plugin-jsx-a11y`. These catch about 30–40% of issues.
- Manual: keyboard-only pass, screen reader (VoiceOver on macOS/iOS, NVDA on Windows, TalkBack on Android), 200% zoom and 400% reflow, contrast checker.
- RTL `getByRole` fails if the element has no accessible role or name, so it's a free a11y check.

---

## 2. Responsive design core concepts

### Mobile-first CSS
```scss
.listing-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;                                   // mobile default
  @media (min-width: 48rem) { grid-template-columns: repeat(2, 1fr); }
  @media (min-width: 64rem) { grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr)); }
}
```
- Viewport meta: `<meta name="viewport" content="width=device-width, initial-scale=1">`. Never disable zoom.
- Units: `rem` for type and spacing (respects user font size), `%`/`fr`/`vw` for layout, `ch` for readable line length.
- **Fluid type**: `font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);`
- **Container queries** (baseline in all modern browsers since 2023): components respond to their container, not the viewport.
```css
.card-wrapper { container-type: inline-size; }
@container (min-width: 30rem) { .card { display: flex; } }
```
- Flexbox for one-dimensional layouts, Grid for two-dimensional. `gap` everywhere.
- Media features: `prefers-color-scheme`, `prefers-reduced-motion`, `hover: hover`/`pointer: coarse` (touch targets).

### Responsive images (performance + layout stability)
```html
<img src="listing-800.jpg"
     srcset="listing-400.jpg 400w, listing-800.jpg 800w, listing-1600.jpg 1600w"
     sizes="(min-width: 64rem) 33vw, 100vw"
     width="800" height="600"            <!-- reserves space → no CLS -->
     loading="lazy" decoding="async" alt="Two-bedroom flat living room">
<!-- the hero/LCP image: loading="eager" fetchpriority="high", never lazy -->
<picture>
  <source type="image/avif" srcset="hero.avif"><source type="image/webp" srcset="hero.webp">
  <img src="hero.jpg" alt="..." width="1600" height="900" fetchpriority="high">
</picture>
```
This connects to the OneHome performance story: correctly sized and lazy-loaded images contributed to the ~40% speed-up. Core Web Vitals: **LCP** < 2.5 s, **INP** < 200 ms (replaced FID in March 2024), **CLS** < 0.1.

---

## 3. Interview questions (spoken model answers)

**Q: How do you make a web app accessible?**
"Semantic HTML first, because it gives keyboard support and screen-reader roles for free. Every input gets a label, images get proper alt text, headings are in order, and there are landmarks. Everything is keyboard-operable with a visible focus style. Modals trap and restore focus, and route changes move focus. Contrast meets AA, and colour is never the only signal. ARIA only fills the gaps, for example `aria-expanded` on a disclosure or a live region for async messages. Then I test: axe in CI and in the browser, a keyboard-only pass, and a screen reader on the critical flows. **[Add a real example of a11y work you did, if any.]**"

**Q: What's ARIA and when should you not use it?**
"Accessible Rich Internet Applications: attributes that add roles, states and names for assistive tech. The first rule is not to use it when a native element does the job. A `div` with `role=button` still needs `tabindex`, Enter and Space handling and focus styles, which a `<button>` gives you for free. Wrong ARIA is worse than none."

**Q: How do you handle focus in a SPA?**
"On route change I move focus to the main heading, or announce the new page through a polite live region, because screen readers don't notice client-side navigation. For dialogs I use the native `<dialog>` with `showModal()` or a tested library, trap focus inside, close on Escape, and return focus to the button that opened it."

**Q: How do you approach responsive design?**
"Mobile-first: base styles for small screens, then `min-width` media queries. Fluid Grid/Flex layouts, rem units, `clamp()` for fluid type, and container queries so components adapt to where they're placed. Images use `srcset`/`sizes` with explicit width and height to avoid layout shift, and I lazy-load everything except the LCP image. I test on real devices and in DevTools, including zoom and reflow."

**Q: What are Core Web Vitals and how do you improve them?**
"LCP for loading, INP for responsiveness, CLS for visual stability. LCP: optimise and preload the hero image, reduce render-blocking JS and CSS, use SSR or a CDN. INP: break up long tasks, cut JS, defer non-urgent updates (`useTransition`), avoid heavy re-renders. CLS: give dimensions to images and embeds, reserve space for dynamic content, use `font-display`. On OneHome, image sizing and lazy loading plus cutting first-load JS were key parts of the ~40% improvement."

---

## 4. Traps and gotchas
- `outline: none` with no `:focus-visible` replacement breaks keyboard users.
- `onClick` on a `div`/`span`: no keyboard, no role.
- Placeholder used as a label. It disappears and has low contrast.
- `aria-label` on a non-interactive `div` is often ignored.
- Lazy-loading the LCP image makes it slower.
- `user-scalable=no` / `maximum-scale=1` blocks zoom and fails WCAG.
- Hiding content with `display:none` hides it from screen readers too. Use a visually-hidden class for screen-reader-only text.
- Auto-playing carousels without pause controls.
- Saying "we're accessible because Lighthouse shows 100". Automated tools catch only part of the issues.
