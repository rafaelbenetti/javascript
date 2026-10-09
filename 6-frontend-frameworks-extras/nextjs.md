# ⚛️ Next.js Prep — Top 20 Interview Q&A

> Group 6 · Corrected version of the former `other/nextjs.md` · Priority MEDIUM (React is in the stack; Next is the usual production framework around it)
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original
> Related: [react.md](../2-react-frontend/react.md) (Q33/Q34 are the short version of this file)

## What was fixed (changelog)
1. **Data functions are Pages Router.** ✏️ `getServerSideProps`, `getStaticProps`, `getInitialProps` and `getStaticPaths` do not exist in the App Router. `getServerSideProps` is legacy: still correct inside `pages/`, not the API you reach for in new code. The App Router fetches in an async Server Component.
2. **Two routers, not "Next 12 vs Next 13".** ✏️ The Pages Router is still supported. The App Router (`app/`) has been the default for new apps since Next 13 and is still the current model in **Next 16** (latest stable **16.4**, Oct 2026). Next 17 is not released. Cache Components are planned to become the framework default there.
3. **Caching changed twice.** ✏️ Next 14 cached `fetch` by default. **Next 15** made `fetch`, GET Route Handlers, and client page navigations **uncached by default**. **Next 16** adds opt-in **Cache Components** (`"use cache"`, `cacheLife`, `cacheTag`). **16.4** turns that on for new `create-next-app` projects. `export const dynamic` / `revalidate` / `fetchCache` error once `cacheComponents` is enabled.
4. **Server Actions** ➕ were missing. `'use server'` functions are the mutation path. They are public POST endpoints. Validate and authorize inside them.
5. **Request APIs are async since Next 15.** ✏️ `params`, `searchParams`, `cookies()` and `headers()` return Promises. Forgetting `await` is the usual upgrade failure.
6. **Route Handlers, metadata, middleware.** ✏️ App Router endpoints live in `route.ts` (`export async function GET`), not only `pages/api`. Metadata is `export const metadata` / `generateMetadata`, not `next/head`. In Next 16 the `middleware.ts` filename is **deprecated** in favor of `proxy.ts`.
7. **Auth.js.** ✏️ The library formerly called NextAuth.js is Auth.js. The import is still `next-auth` in many apps.
8. **➕ Added** the 30-second summary, a caching section, and traps.

## ➕ Say it in 30 seconds
"Next.js is a React framework with file-system routing. New work uses the App Router: components are Server Components by default, they can be `async` and fetch on the server, and a file with `'use client'` is the client boundary. Mutations go through Server Actions. `getServerSideProps` is the old Pages Router. Caching is the part people get wrong: Next 14 cached fetches by default, Next 15 stopped, and Next 16 makes caching explicit with `'use cache'` inside Cache Components. `params` and `cookies()` are Promises since Next 15. I'd deploy with `next build` and `next start`, on Vercel or in a container."

---

## 📖 Quick Overview

- **What is Next.js?** → React framework for **server rendering**, **static generation**, and **route handlers**. ✏️ Not only SSR. A route can be static, dynamic per request, or cached and revalidated.
- **Rendering modes:**
  - **SSR** (Server-Side Rendering) → HTML built on each request. ✏️ In the **Pages Router** that is `getServerSideProps` (**legacy**). In the **App Router** it is an async Server Component that reads `cookies()` / `headers()` or does an uncached fetch.
  - **SSG** (Static Site Generation) → pre-rendered at build time. ✏️ Pages: `getStaticProps`. App Router: a Server Component that only reads cached data, or a `"use cache"` function when Cache Components are on.
  - **ISR** (Incremental Static Regeneration) → update static pages after build. ✏️ Pages: `revalidate` on `getStaticProps`. App Router before Cache Components: `next: { revalidate }`. With Cache Components: `cacheLife`.
  - **CSR** (Client-Side Rendering) → classic React behavior, inside a Client Component.
- **Routing**: ✏️ **App Router** (`app/page.tsx`) is the current default. **Pages Router** (`pages/`) still works and can live in the same project. Don't describe this as "Next 12 vs Next 13".
- **API Routes**: ✏️ Pages: `pages/api`. App Router: **Route Handlers** in `app/api/.../route.ts`.
- **Styling**: CSS modules, Tailwind, global CSS. ✏️ CSS-in-JS (styled-components) and Server Components get along badly. Don't promise "streaming CSS-in-JS" as a smooth default.
- **Deployment**: Optimized for **Vercel**, but works with AWS, Docker, etc. `next build && next start`.
- **Request interception**: ✏️ Next 16 deprecates `middleware.ts` in favor of **`proxy.ts`** (the export is renamed `proxy` too). It runs before the route, for redirects and coarse auth gates, and it **defaults to the Node.js runtime**. Not a full backend.

---

## ❓ Top 20 Questions & Answers

### 1) What is Next.js and why use it over React?

- React = library for UI, no routing/SSR built-in.
- Next.js = full framework with **server rendering, file routing, route handlers, image optimization**.
- ➕ Current model: **Server Components** by default, **Server Actions** for mutations, explicit caching (see the caching section).
- Benefits: SEO, less client JS, a place to keep secrets off the browser.

---

### 2) Explain the difference between SSR, SSG, CSR, and ISR.

- **SSR**: HTML on each request (dynamic, fresh data). ✏️ App Router: uncached Server Component, not automatically `getServerSideProps`.
- **SSG**: HTML at build time (fast, static, stale until the next build unless you revalidate).
- **ISR**: serve the static page, rebuild in the background after a lifetime. The next request after the rebuild sees new data. A request during the rebuild still gets the old page.
- **CSR**: browser renders after JS loads and fetches JSON. Worse for first paint and SEO. Right for data that is user-specific and shouldn't be in the HTML.

---

### 3) How does routing work in Next.js?

- ✏️ **Pages Router** (still supported): `pages/about.tsx` → `/about`. Dynamic: `pages/posts/[id].tsx`. Catch-all: `pages/[...slug].tsx`.
- ✏️ **App Router** (default for new apps since Next 13, current in Next 16): `app/about/page.tsx`. A `layout.tsx` wraps every child route and preserves state across navigations. `loading.tsx` and `error.tsx` are the Suspense and error boundary for that segment.
- Dynamic: `app/posts/[id]/page.tsx`. Catch-all: `app/[...slug]/page.tsx`. Route groups `(marketing)` don't affect the URL.
- ➕ Since **Next 15**, `params` and `searchParams` are **Promises**:

```tsx
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <h1>{id}</h1>;
}
```

---

### 4) What are Next.js API routes?

- ✏️ **Pages Router (legacy shape):** one handler for every method in `pages/api/user.ts`:

```js
export default function handler(req, res) {
  res.status(200).json({ name: "John" });
}
```

- ✏️ **App Router (current): Route Handlers.** `app/api/user/route.ts` exports a function per method. GET is **not cached by default since Next 15**.

```ts
export async function GET() {
  return Response.json({ name: "John" });
}
```

- Useful for a small BFF, webhooks, and auth callbacks. A mutation the UI triggers is usually a **Server Action** instead of a route you `fetch` from a Client Component.

---

### 5) What is the difference between `getStaticProps`, `getServerSideProps`, and `getInitialProps`?

- All three are **Pages Router** APIs. ✏️ **`getServerSideProps` is legacy** for new work. There is no App Router equivalent with that name.
- `getStaticProps`: build time → props injected at compile. `revalidate` turns it into ISR. App Router replacement: a cached fetch, or `"use cache"`.
- `getServerSideProps`: runs **on every request**, on the server only. App Router replacement: an async Server Component. Reading `cookies()` or `headers()` (both async since Next 15) opts that render into dynamic.
- `getInitialProps`: older still. Runs on the server **and** the client on client navigations, and it disables automatic static optimization. Don't add it.
- `getStaticPaths` (Pages) ↔ `generateStaticParams` (App Router). Unknown ids at runtime: `dynamicParams`. `notFound()` and `redirect()` replace the `{ notFound: true }` / `{ redirect }` return values.

---

### 6) How does Next.js handle API caching with ISR?

- ✏️ That description is the **Pages Router**: `getStaticProps` returns `revalidate: 60`.
- App Router **without** Cache Components: `fetch(url, { next: { revalidate: 60 } })`, or `export const revalidate = 60` on the segment. ✏️ In **Next 15+** a bare `fetch()` is **not** cached, so you must opt in. In Next 14 a bare `fetch()` was cached, which is why upgrades "randomly" went dynamic.
- App Router **with** Cache Components (Next 16, on by default for new apps in 16.4): those `revalidate` / `dynamic` exports are removed. Lifetime is `cacheLife` inside a `"use cache"` function. See the caching section below.
- After the lifetime, the next request can trigger a background rebuild. The request that triggered it still gets the previous result (stale-while-revalidate), unless you used `updateTag` in a Server Action and need read-your-writes.

---

### 7) What is the App Router in Next.js 13?

- ✏️ Not a Next 13 curiosity. It is the current router through Next 16.
- Uses the `app/` directory with **React Server Components**.
- Layouts, streaming (`loading.tsx`, Suspense), parallel routes (`@slot`) and intercepting routes.
- Server Components are the default. `'use client'` at the top of a file opts that file, and the modules it imports, into the client bundle. `children` passed into a client layout can still be Server Components, because they are rendered on the server and passed as already-rendered nodes.
- Example: `app/dashboard/page.tsx`.

---

### 8) What are React Server Components (RSC) in Next.js?

- Server Components run **on the server only** and ship no component JS for themselves. They can `await` data, read secrets, and talk to the database.
- They cannot use `useState`, `useEffect`, browser APIs, or event handlers. Those belong in a Client Component (`'use client'`).
- Props passed from a Server Component to a Client Component must be serializable. Functions, class instances and Dates that you expected to stay Dates will not cross that boundary (Dates become strings unless you pass a timestamp).
- ➕ **Server Actions** are the other direction: a function marked `'use server'` that a form or Client Component calls. Next sends a POST. Treat it as a public endpoint.

```ts
"use server";
export async function saveListing(formData: FormData) {
  const title = String(formData.get("title") ?? "");
  // authorize and validate here. Do not trust the caller.
  await db.insert({ title });
  revalidatePath("/listings");
}
```

---

### 9) How does Next.js optimize images?

- `<Image />` from `next/image` → lazy loading, responsive `sizes`, automatic WebP/AVIF, and a required width/height or `fill` so layout doesn't shift.
- ✏️ `next/legacy/image` and the `images.domains` config are deprecated in Next 16. Use `next/image` and `images.remotePatterns`.
- Optimized on demand via the Image Optimization API. That API has to run somewhere (Vercel, or a custom loader for S3/CloudFront). A static `next export` does not resize images by itself.

---

### 10) What are Next.js Middleware functions?

- Run **before** the route renders. Used for redirects, rewrites, and a coarse auth gate (presence of a cookie, not a full database session check).
- ✏️ **Next 16 deprecates the `middleware.ts` filename.** Rename the file to `proxy.ts` and the exported function from `middleware` to `proxy`. Existing `middleware.ts` files still run. Since 16, proxy **defaults to the Node.js runtime**, so "it always runs at the edge" is out of date. It is a boundary in front of the route, not a place for slow I/O.
- A `matcher` keeps it off `/_next` and static files.

```ts
// proxy.ts — the middleware.ts filename is deprecated in Next 16
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
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
  - ✏️ **Auth.js** (the project formerly named NextAuth.js). The package name is often still `next-auth`.
  - A session cookie checked in a Server Component or in `proxy.ts`. The proxy is a gate, not the place that loads the user from the database.
  - ✏️ JWTs: short-lived access token in memory, refresh token in an **HttpOnly** cookie. Not `localStorage`. See [storage-security.md](../4-architecture-security/storage-security.md).

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

- ✏️ **Pages Router:** `<Head>` from `next/head`.
- ✏️ **App Router (current):** the Metadata API. Static `export const metadata = { title, description }` or async `generateMetadata`. This replaces `next/head` and dedupes tags. Open Graph and canonical URLs live here too.
- Crawlable HTML comes from Server Components (static or dynamic), not from a client-only `useEffect` fetch.
- Add `app/sitemap.ts` and `app/robots.ts`, plus JSON-LD where rich results matter.

---

### 18) How do you deploy Next.js apps?

- **Vercel** (native).
- **Custom**: Docker, AWS Amplify, Netlify, Cloudflare Pages.
- `next build && next start` for production.

---

### 19) How does Next.js handle CSS and styling?

- Options that work cleanly with Server Components: **CSS Modules**, global CSS, Tailwind.
- ✏️ **FIXED:** "App Router supports CSS-in-JS with streaming" oversells it. styled-components needs extra SSR wiring and still fights Server Components. If you don't already have it, don't pick it for a new App Router app.

---

### 20) What are common use cases for Next.js?

- SEO-friendly sites (blogs, e-commerce).
- Dashboards with hybrid server and client rendering.
- BFF (Route Handlers or Server Actions).
- ✏️ A Node server (`next start`) or a serverless host. It is not "serverless only". On AWS that is often a container, not a Lambda, once the server bundle and the image optimizer have to stay warm.

---

## ➕ Caching: Next 14 → 15 → 16

This is the question that separates a current answer from a memorized Next 13 one.

| Version | Default |
|---|---|
| **Next 13 / 14** App Router | `fetch()` **cached** (`force-cache`) unless you passed `cache: 'no-store'` or used `cookies()` / `headers()` / `noStore()`. GET Route Handlers cached unless they opted out. |
| **Next 15** (Oct 2024) | `fetch()`, **GET Route Handlers**, and the **client router cache for page segments** are **uncached**. Opt in with `cache: 'force-cache'` or `next: { revalidate: 60, tags: ['listing'] }`. Layouts are still reused on client navigation. Back/forward restores from cache. `params`, `searchParams`, `cookies()`, `headers()` are Promises. |
| **Next 16** (Oct 2025) | **Cache Components.** Turn on with `cacheComponents: true`. Dynamic code runs at request time. You opt **in** to caching with the `"use cache"` directive on a function, component, or page. The compiler builds the cache key from the arguments you actually use. |
| **Next 16.4** (Oct 2026) | New `create-next-app` projects get Cache Components **on**. Existing apps do not flip until you enable the flag. The framework-wide default is planned for **Next 17**, which is not released. |

```ts
async function getListing(id: string) {
  "use cache";
  cacheLife("hours");          // from 'next/cache'
  cacheTag(`listing:${id}`);
  return db.listing.find(id);
}
```

- `revalidateTag(tag, profile)` is stale-while-revalidate. Inside a Server Action, `updateTag(tag)` expires the tag so the **same** request reads fresh data (read-your-writes). `revalidatePath` still exists.
- Once `cacheComponents` is on, a segment that still exports `dynamic`, `revalidate`, or `fetchCache` **fails the build**. Delete those and move the decision to `"use cache"`. The experimental `ppr` flag was removed. Partial prerendering is part of this model: a static shell streams, cached pieces are holes that fill in, dynamic pieces wait for the request.
- `unstable_cache` was the Next 14/15 escape hatch for non-fetch work (a database call). New code uses `"use cache"` instead.

**Pages Router, unchanged and legacy:** `getStaticProps` + `revalidate`, `getServerSideProps` on every request, `getInitialProps` avoided.

## ➕ Extra questions

### What is a Server Action, in one sentence?
A function marked `'use server'` that the browser invokes with a POST. Next serializes the arguments and the return value. It can run from a `<form action={save}>` with no client JS, or from a Client Component event. It is not a secret RPC. Anyone can POST to it, so authentication and validation live inside the function. Close over no request-specific data from a render. Pass ids as arguments and load the row on the server.

### What did `'use client'` actually do?
It is a boundary, not a hint. That module and its imports are in the client graph. It does not mean "this renders only on the client": client components are still **pre-rendered to HTML on the server**, then hydrated. The thing that never appears in the client bundle is a Server Component that the client module did not import.

### Why did my static page become dynamic?
You called `cookies()`, `headers()`, or `await connection()`, or (on Next 15 without Cache Components) you fetched without opting into a cache. On Next 14 the opposite bug was more common: a fetch you thought was live was cached at build time. Say which version you mean.

## ➕ Traps and gotchas

- Calling `getServerSideProps` "the Next.js way" in 2026. It is the Pages Router way, and it is legacy for new routes.
- Assuming `fetch` cache behavior without naming the version. 14 and 15 are opposites.
- Leaving `export const revalidate` in a file after enabling `cacheComponents`. The build error is intentional.
- Forgetting `await` on `params` or `cookies()`. The types fail, and a cast to silence them returns a Promise to your JSX.
- Importing a Server Action's module into a client file **without** `'use server'` on the function, or passing a non-serializable argument (a function, a Map, a class).
- Putting a secret in `NEXT_PUBLIC_*`. That prefix inlines the value into the browser bundle at build time.
- Auth logic that trusts a JWT decoded in `proxy.ts` and never checks it again in the Server Component or the database write. The proxy is a redirect, not the authorization of the mutation.
- `ssr: false` on `next/dynamic` inside a Server Component. Dynamic with `ssr: false` is a client-only tool. Load that wrapper from a Client Component.
- Expecting styled-components to stream because a blog post in 2023 said the App Router supports it.
