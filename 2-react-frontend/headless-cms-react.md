# Headless CMS Integration with React

> Group 2 · Priority LOW–MEDIUM · Prep guide Q12 (JD: "CMS integration") · Status: new file
> Honest framing: this isn't on Rafael's CV. If true, say: "I haven't owned a CMS integration end to end, but this is how I'd approach it." Bridge: API integration, typed contracts, caching and performance work.

## Say it in 1 minute
"A headless CMS stores structured content and serves it over REST or GraphQL. React decides how it looks. I would model pages, heroes, articles, and video as reusable blocks with the editors in the room. Types generated from the schema turn a renamed field into a compile error. A component map renders each block, with a fallback for an unknown type, and rich text is sanitised. Content is cached at the CDN or generated statically, and publish hits a webhook so we revalidate. Editors get a preview for drafts. I have not owned a CMS integration end to end. The daily work is the same: a typed API, a cache, and a renderer that survives a payload it did not expect."

---

## 1. Core concepts

### Headless vs traditional
- **Traditional (coupled)**: CMS renders HTML (WordPress themes, AEM with HTL templates).
- **Headless**: CMS = content repository + editor UI + API. The front end (React, mobile app) renders it, so one content source can feed many channels (web, iOS, Android, smart TV). That fits a "web and mobile digital media/learning products" JD.
- Examples: **Contentful**, **Strapi** (open source, Node), **Sanity**, **Storyblok** (visual editor), **Contentstack**, **Hygraph** (GraphQL), **Adobe Experience Manager** (headless via Content Fragments + GraphQL; pairs with the JD's Adobe Analytics/Target), WordPress via REST/WPGraphQL.

### Content modelling
- Content types with fields: `Article { title, slug, heroImage, body (rich text), author → Author, tags[] }`.
- **Modular "blocks"** let editors compose pages: `Page { sections: (Hero | Carousel | VideoBlock | CTA)[] }`.
- References and localisation (locale fields, fallbacks). Rich text as structured JSON (not raw HTML), rendered safely.

### Fetching and typing
```ts
// GraphQL (e.g. Contentful / Hygraph)
const query = /* GraphQL */ `
  query Page($slug: String!, $preview: Boolean!) {
    pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items { title sectionsCollection { items { __typename ... on Hero { heading image { url width height } }
                                                  ... on VideoBlock { title videoUrl captionsUrl } } } }
    }
  }`;
// Types generated from the schema with GraphQL Code Generator → no hand-written guesses
```

### Rendering with a component map
```tsx
const blocks = {
  Hero: HeroBlock,
  VideoBlock: VideoBlock,
  Cta: CtaBlock,
} satisfies Record<string, React.ComponentType<any>>;

function Section({ block }: { block: CmsBlock }) {
  const Component = blocks[block.__typename as keyof typeof blocks];
  if (!Component) {                      // unknown type → don't crash the page
    if (process.env.NODE_ENV !== 'production') console.warn('Unknown block', block.__typename);
    return null;
  }
  return <Component {...block} />;
}
```
- Rich text: render the structured JSON with the CMS's renderer (`@contentful/rich-text-react-renderer`, Portable Text), mapping nodes to components. **Never `dangerouslySetInnerHTML` raw CMS HTML without sanitising (DOMPurify)**, because editors' content is still untrusted input (stored XSS).

### Caching and freshness
- **SSG/ISR** (Next.js): pages built statically and revalidated on a timer or **on demand via the CMS publish webhook** (`revalidateTag('page:home')`).
- **SPA**: React Query with `staleTime`, plus CDN caching of API responses (CloudFront) with purge on publish.
- **Images**: use the CMS image API (resize, format=webp/avif, quality) with `srcset`. This ties in with the image-optimisation work in the OneHome performance story.
- Respect API **rate limits**. Never expose management tokens. Delivery tokens are read-only, and preview tokens stay server-side.

### Preview mode
Editors see drafts before publishing: a preview route sets a cookie (Next.js Draft Mode) and fetches from the preview API with a server-side token. Visual editors (Storyblok, Contentful Live Preview, Sanity Presentation) add click-to-edit overlays.

### Other concerns
- **Content validation**: required fields and limits in the CMS, plus defensive rendering (optional chaining, defaults) in React.
- **SEO**: title and meta from CMS fields, slugs, sitemaps, structured data.
- **i18n**: locale in the route (`/es/...`), CMS locale fallbacks.
- **A11y**: required alt-text fields for images, captions for video, heading levels controlled by the component, not free-typed by editors.
- **Testing**: fixture JSON from the CMS for component tests, contract tests on the schema, and visual regression for blocks.

---

## 2. Interview questions (spoken model answers)

**Q: How would you integrate a headless CMS into a React app?**
"Start with the content model together with editors: reusable blocks rather than one giant rich-text field. Fetch via the delivery API, REST or GraphQL, with types generated from the schema. Render through a component map, with a safe fallback for unknown blocks and sanitised rich text. Cache aggressively with static generation or CDN caching and purge on the publish webhook. Add a preview mode for drafts. Monitor errors and API rate limits. I haven't owned one end to end, but it's the typed API integration, caching and performance work I do on OneHome." *(Only say the last sentence if true.)*

**Q: How do you keep content fresh but fast?**
"Static or CDN-cached by default, with on-demand revalidation triggered by the CMS publish webhook, so new content appears within seconds and nothing is fetched per request. Time-based revalidation as a safety net."

**Q: What can go wrong?**
"Editors publish content the UI doesn't expect: missing fields, new block types, huge images. So rendering is defensive, the CMS has validation rules, and unknown blocks are skipped and logged. Other risks: XSS from raw HTML, leaking preview tokens, and rate limits during traffic spikes. Those are solved by caching and keeping tokens server-side."

**Q: CMS vs hard-coded content?**
"A CMS lets marketing and content teams ship without deployments, gives localisation workflows, and serves web and mobile from one source. The cost is extra integration, caching complexity and a vendor dependency. It's worth it for frequently changing editorial content, not for application UI copy."

---

## 3. Traps and gotchas
- Rendering raw CMS HTML without sanitisation is stored XSS.
- Management or preview tokens in the client bundle.
- Fetching CMS content on every request with no cache.
- Tight coupling: components that read deep CMS response shapes directly. Map to view models.
- Ignoring editors' needs (preview, validation), which leads to broken pages in production.
- Claiming hands-on experience with a specific CMS you haven't used.
