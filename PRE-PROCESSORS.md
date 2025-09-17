# 🎨 SCSS (Sass) Prep — Overview + Top 20 Interview Q&A

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
- Example: `_variables.scss` imported into `main.scss` with:

```scss
@import "variables";
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
.container {
  width: (100% / 3);
}
```

---

### 9) How do SCSS functions work?

- Built-in (e.g., `darken()`, `lighten()`, `mix()`).
- Custom:

```scss
@function pxToRem($px) {
  @return $px / 16 * 1rem;
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
.button {
  background: lighten(#0070f3, 20%);
}
.alert {
  background: mix(red, yellow, 50%);
}
```

---

### 16) How do you structure responsive design with SCSS?

- Use mixins with media queries.

```scss
@mixin respond($breakpoint) {
  @if $breakpoint == mobile {
    @media (max-width: 600px) {
      @content;
    }
  }
}
.container {
  @include respond(mobile) {
    width: 100%;
  }
}
```

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

---

### 20) What are common SCSS pitfalls?

- Over-nesting (leads to deep selectors).
- Mixing too much logic → hard to maintain.
- Using too many `@extends` → selector bloat.

---
