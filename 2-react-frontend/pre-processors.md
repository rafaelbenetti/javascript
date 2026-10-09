# 🎨 SCSS (Sass) Prep — Overview + Top 20 Interview Q&A

> Group 2 · Priority MEDIUM (the JD lists Sass)

## Say it in 1 minute
"Sass, in the SCSS syntax, adds variables, nesting, mixins, functions, and modules to CSS, and all of that is gone once the build emits plain CSS. What I write today is the module system, @use and @forward. Division and colour go through the namespaced built-ins, math.div and color.adjust, from sass:math and sass:color. In React I pair that with CSS Modules, a file like Button.module.scss beside the component, so the class names stay local. Theming that has to change at runtime lives in CSS custom properties, because a Sass variable cannot be updated from the browser. Native CSS now has nesting, custom properties, and container queries, so Sass earns its place as organisation, mixins, and a set of design tokens. On Benwer Cars I used Tailwind, so I can talk about a utility-first stylesheet as a real alternative I have shipped, not as a tool I have only read about."


---

## 📖 Quick Overview

- **What is SCSS (Sass)?**

  - SCSS is a **CSS preprocessor** — it adds **variables, nesting, mixins, inheritance, functions**, then compiles to standard CSS.
  - SCSS = _Sassy CSS_ (newer syntax, closer to CSS).
  - Sass (indented syntax) = older, less common today.

- **Key Features:**

  - **Variables** → reuse colors, sizes.
  - **Nesting** → cleaner, structured CSS.
  - **Mixins** → reusable chunks of CSS.
  - **Extend/Inheritance** → share style rules.
  - **Partials & Imports** → modularize styles.
  - **Operators & Functions** → math, color manipulation.

- **Benefits:**
  - DRY (don’t repeat yourself).
  - Scalable, maintainable styles.
  - Works with modern frameworks (Angular, React, Next.js).

---

## ❓ Top 20 Questions & Answers

### 1) What is SCSS and how does it differ from Sass?

- **SCSS** → newer syntax, looks like CSS (`{}` + `;`).
- **Sass** → indentation-based, no braces/semicolons.  
  👉 Most projects today use **SCSS** for better compatibility.

---

### 2) What are variables in SCSS?

- Store reusable values.

```scss
$primary-color: #0070f3;
body {
  color: $primary-color;
}
```

---

### 3) What are mixins?

- Reusable blocks of CSS with parameters.

```scss
@mixin flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  @include flex-center;
}
```

---

### 4) What is the difference between `@mixin` and `@extend`?

- **Mixin** = reusable snippet, can take arguments.
- **Extend** = inheritance, shares selectors.

```scss
%btn {
  padding: 10px;
}
.btn-primary {
  @extend %btn;
  background: blue;
}
```

---

### 5) How does nesting work in SCSS?

- Nest selectors inside parents.

```scss
.nav {
  ul {
    list-style: none;
  }
  li {
    display: inline;
  }
}
```

---

### 6) What are partials in SCSS?

- Files starting with `_` (not compiled directly).
- Example: `_variables.scss` loaded into `main.scss` with:

```scss
// @import is deprecated (Dart Sass 1.80+), use the module system
@use "variables" as vars;      // namespaced: vars.$primary
// or re-export a group of partials from an index file:
// _index.scss →  @forward "variables"; @forward "mixins";
```

---

### 7) How do you organize SCSS in large projects?

- Use **7–1 architecture**:
  - `base/`, `components/`, `layout/`, `pages/`, `themes/`, `utils/`, `vendors/`, + `main.scss`.
- Promotes scalability and modularity.

---

### 8) How do operators work in SCSS?

- Math directly in styles.

```scss
// slash division is deprecated ("/" is a separator in modern CSS, e.g. grid-area: 1 / 3)
@use "sass:math";
.container {
  width: math.div(100%, 3);
}
```

---

### 9) How do SCSS functions work?

-  Built-in, now namespaced in modules: `color.adjust()`, `color.scale()`, `color.mix()`, `math.div()`, `math.round()`, `map.get()`, `list.nth()`. (Global `darken()`/`lighten()`/`mix()` are deprecated.)
- Custom:

```scss
// math.div instead of "/"
@use "sass:math";
@function pxToRem($px) {
  @return math.div($px, 16) * 1rem;
}
h1 {
  font-size: pxToRem(32);
}
```

---

### 10) What is the difference between `@use` and `@import`?

- `@import` → old, loads files multiple times, pollutes global scope.
- `@use` → modern, scoped, prevents conflicts.

```scss
@use "colors" as c;
h1 {
  color: c.$primary;
}
```

---

### 11) How do you conditionally apply styles in SCSS?

- Use `@if`, `@else`.

```scss
$theme: dark;
body {
  @if $theme == dark {
    background: black;
  } @else {
    background: white;
  }
}
```

---

### 12) What are SCSS loops?

- `@for`, `@each`, `@while`.

```scss
@for $i from 1 through 3 {
  .m-#{$i} {
    margin: #{$i}rem;
  }
}
```

---

### 13) What’s the difference between SCSS and CSS variables?

- **SCSS variables** → compile-time (don’t exist in runtime CSS).
- **CSS variables** → runtime, live in the browser, support dynamic theming.  
  👉 Often used **together**.

---

### 14) How do you debug SCSS?

- Use `@debug` and `@warn`.

```scss
@debug $primary-color;
```

---

### 15) How do you use color functions in SCSS?

- Examples:

```scss
// global lighten()/mix() are deprecated → sass:color module
@use "sass:color";
.button {
  background: color.adjust(#0070f3, $lightness: 20%);   // like old lighten()
  // color.scale(#0070f3, $lightness: 20%) scales relative to the remaining range (often nicer)
}
.alert {
  background: color.mix(red, yellow, 50%);
}
```

---

### 16) How do you structure responsive design with SCSS?

- Use mixins with media queries.

```scss
// mobile-first (min-width) with a breakpoint map, instead of a max-width special case
@use "sass:map";
$breakpoints: (md: 48rem, lg: 64rem, xl: 80rem);

@mixin up($bp) {
  @media (min-width: map.get($breakpoints, $bp)) { @content; }
}
.container {
  width: 100%;                  // mobile default
  @include up(lg) { max-width: 72rem; margin-inline: auto; }
}
```
- For components, consider **container queries** (`@container (min-width: 30rem)`), which work fine inside Sass.

---

### 17) How do placeholders (%) work in SCSS?

- Like abstract classes in OOP → can’t compile on their own.

```scss
%card {
  box-shadow: 0 2px 4px #aaa;
}
.product {
  @extend %card;
}
```

---

### 18) How does SCSS improve maintainability?

- Modularity, DRY principles, theming, scoped variables.
- Easier for large teams than plain CSS.

---

### 19) How do you compile SCSS?

- With CLI: `sass style.scss style.css`.
- With build tools: Webpack, Vite, Angular CLI, Next.js config.
- Use **Dart Sass** (`sass` npm package, or `sass-embedded` for speed). **LibSass / `node-sass` are deprecated**, and Ruby Sass is long dead. Webpack: `sass-loader` → `css-loader` → `MiniCssExtractPlugin.loader`. Vite: just install `sass`.

---

### 20) What are common SCSS pitfalls?

- Over-nesting (leads to deep selectors).
- Mixing too much logic → hard to maintain.
- Using too many `@extends` → selector bloat.
- Still using `@import` / `/` division / global color functions → deprecation warnings now, and errors in future Dart Sass versions.

---

### 21) How do you use Sass in React?

```scss
// Button.module.scss
@use "../styles/tokens" as t;
.button { padding: t.$space-2 t.$space-4; border-radius: t.$radius; }
.primary { background: var(--color-primary); }
```
```tsx
import styles from "./Button.module.scss";
<button className={`${styles.button} ${styles.primary}`}>Save</button>
```
- **CSS Modules** generate unique class names, so styles are scoped and there are no global collisions. Alternatives: global Sass + BEM, CSS-in-JS (styled-components, now less favoured with Server Components), Tailwind (used on Benwer Cars).

### 22) What is BEM?
Block__Element--Modifier: `.card`, `.card__title`, `.card--featured`. It gives flat, low-specificity selectors and readable intent. With Sass: `.card { &__title {} &--featured {} }`. Less needed with CSS Modules.

### 23) Sass vs modern native CSS?
Native CSS now has **custom properties** (runtime theming), **nesting** (baseline since 2023), `@layer` (cascade control), container queries, `color-mix()`, `:has()`. Sass still adds compile-time logic, mixins, loops, maps and modules. Common setup: Sass for structure and tokens, CSS variables for themes like dark mode.

### 24) How do you manage design tokens?
A single source (JSON → Style Dictionary) generating Sass variables **and** CSS custom properties. Components use tokens (`$space-2`, `var(--color-primary)`), never raw hex values. Theming switches the CSS variables at runtime.

---

## Traps and gotchas
- Deep nesting (>3 levels) causes specificity wars and brittle selectors.
- `@extend` across media queries doesn't work, and it bloats selectors. Prefer mixins or placeholders sparingly.
- Sass variables can't change at runtime (dark mode needs CSS variables).
- `@use` must come before other rules, and members are namespaced. Partials loaded with `@use` are only included once.
- Saying "`@import` is the way to split files" dates you.

---
