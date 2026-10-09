# ⚛️ Next.js Prep — Top 20 Interview Q&A

---

## 📖 Quick Overview

- **What is Next.js?** → React framework for **server-side rendering (SSR)**, **static site generation (SSG)**, and **API routes**.
- **Rendering modes:**
  - **SSR** (Server-Side Rendering) → HTML built on each request (`getServerSideProps`).
  - **SSG** (Static Site Generation) → pre-rendered at build time (`getStaticProps`).
  - **ISR** (Incremental Static Regeneration) → update static pages after build (`revalidate`).
  - **CSR** (Client-Side Rendering) → classic React behavior.
- **Routing**: File-based routing under `/pages` (Next 12) or **App Router** with `/app` (Next 13+).
- **API Routes**: Create backend endpoints inside `/pages/api` or `/app/api`.
- **Styling**: CSS modules, Tailwind, styled-components.
- **Deployment**: Optimized for **Vercel**, but works with AWS, Docker, etc.
- **Edge functions & middleware**: Run logic at CDN edge for auth, redirects.

---

## ❓ Top 20 Questions & Answers

### 1) What is Next.js and why use it over React?

- React = library for UI, no routing/SSR built-in.
- Next.js = full framework with **SSR, SSG, API routes, routing, performance optimizations**.
- Benefits: SEO, better initial load, API + frontend in one project.

---

### 2) Explain the difference between SSR, SSG, CSR, and ISR.

- **SSR**: Render page on every request (dynamic, fresh data).
- **SSG**: Build pages at compile time (fast, static).
- **ISR**: Rebuild static pages in background after X seconds.
- **CSR**: Browser renders via React after fetching JSON data.

---

### 3) How does routing work in Next.js?

- **Pages Router (Next 12)**: file under `/pages/about.js` → `/about`.
- **App Router (Next 13)**: use `/app/about/page.tsx`.
- Dynamic routes: `[id].tsx`.
- Catch-all: `[...slug].tsx`.

---

### 4) What are Next.js API routes?

- Build backend endpoints inside `/pages/api`.
- Example: `/pages/api/user.js`:

```js
export default function handler(req, res) {
  res.status(200).json({ name: "John" });
}
```

- Useful for small BFFs, auth, form handlers.

---

### 5) What is the difference between `getStaticProps`, `getServerSideProps`, and `getInitialProps`?

- `getStaticProps`: build time → props injected at compile.
- `getServerSideProps`: runs **on every request**.
- `getInitialProps`: legacy, runs on both client/server (not recommended).

---

### 6) How does Next.js handle API caching with ISR?

- `getStaticProps` can define `revalidate: 60`.
- After 60 seconds, page will rebuild in background.
- Next request after rebuild sees updated data.

---

### 7) What is the App Router in Next.js 13?

- Uses `/app` directory with **React Server Components (RSC)**.
- Provides layouts, streaming, parallel routing.
- Example: `/app/dashboard/page.tsx`.

---

### 8) What are React Server Components (RSC) in Next.js?

- Run **on server by default**.
- Reduce JS sent to client.
- Can fetch data directly without exposing fetch calls to client.

---

### 9) How does Next.js optimize images?

- `<Image />` component → lazy loading, responsive sizes, automatic WebP/AVIF.
- Optimized on-demand via Image Optimization API.

---

### 10) What are Next.js Middleware functions?

- Run **before request is completed**, at the edge.
- Used for redirects, auth, logging.
- Example: `/middleware.ts`:

```ts
export function middleware(req) {
  return NextResponse.redirect(new URL("/login", req.url));
}
```

---

### 11) How does Next.js handle environment variables?

- Define in `.env.local`, `.env.production`.
- Prefix with `NEXT_PUBLIC_` for frontend exposure.
- Example: `process.env.NEXT_PUBLIC_API_URL`.

---

### 12) How do you add authentication in Next.js?

- Approaches:
  - NextAuth.js (popular auth library).
  - Middleware for protecting routes.
  - JWTs stored in cookies or sessions.

---

### 13) What’s the difference between Next.js and Gatsby?

- **Next.js** → hybrid SSR/SSG/ISR, better for apps.
- **Gatsby** → SSG-first, best for content-heavy static sites.
- Next.js = more flexible, enterprise-ready.

---

### 14) How do you handle dynamic imports in Next.js?

- Use `next/dynamic` for code splitting.

```js
const HeavyComp = dynamic(() => import("../components/HeavyComp"), {
  ssr: false,
});
```

---

### 15) How do you handle global state in Next.js?

- Options: React Context, Redux Toolkit, Zustand, Recoil.
- With App Router → **Server Components + Client Components** can split logic.

---

### 16) What is Incremental Adoption in Next.js 13?

- Migrate gradually from `/pages` to `/app`.
- Both routers can exist in same project.

---

### 17) How do you handle SEO in Next.js?

- Add `<Head>` from `next/head` or metadata in App Router.
- Use SSG/ISR for crawlable HTML.
- Create sitemap & structured data.

---

### 18) How do you deploy Next.js apps?

- **Vercel** (native).
- **Custom**: Docker, AWS Amplify, Netlify, Cloudflare Pages.
- `next build && next start` for production.

---

### 19) How does Next.js handle CSS and styling?

- Options: CSS modules, global CSS, Tailwind, styled-components.
- In App Router: supports **CSS-in-JS** with streaming.

---

### 20) What are common use cases for Next.js?

- SEO-friendly sites (blogs, e-commerce).
- Dashboards with hybrid SSR/CSR.
- BFF (with API routes).
- Serverless apps (on Vercel, AWS Lambda).

---
