# 📊 Adobe Analytics, Adobe Target & Web Video: What a Fullstack Dev Needs to Know

> Group 5 · ➕ NEW file · Priority LOW–MEDIUM (it's in the Applica stack/JD; know the concepts and bridge from Mixpanel)
> Honest framing: your real product-analytics experience is **Mixpanel** **[confirm what you did: event design, implementation, dashboards?]**. Adobe is the same ideas with enterprise tooling. Say so honestly, then show you know the moving parts.

## Say it in 30 seconds
"Analytics on a modern site starts with a **data layer**: the app pushes structured events like page view, search or favorite-added, and a tag manager maps them to the vendor. With Adobe that's the Experience Platform **Web SDK** (alloy.js) sending XDM events, managed through **Tags** (formerly Launch). Previously it was AppMeasurement. I've done the same with **Mixpanel**: a typed tracking layer, consistent event names and properties, and no tracking before consent. **Adobe Target** runs A/B tests and personalisation. The engineering concerns are flicker, so you prehide or decide server-side, plus consent and performance. For **video** I'd use adaptive streaming (HLS/DASH segments served from a CDN), a player like hls.js or video.js loaded lazily, captions as WebVTT, and media analytics events for play, milestones and completion."

---

## 1. Core concepts

### 1.1 Data layer + tag management
- The app shouldn't call vendor SDKs everywhere. Instead, it pushes **semantic events** to one layer, and the tag manager (Adobe **Tags**, GTM) maps them to Adobe, Mixpanel or anything else.
```ts
// tracking.ts: one typed entry point (same pattern you'd use with Mixpanel)
type TrackEvent =
  | { name: 'search_performed'; query: string; results: number }
  | { name: 'favorite_added'; listingId: string; sentiment: 'like' | 'dislike' }
  | { name: 'video_started'; videoId: string };

export function track(e: TrackEvent) {
  if (!consent.analytics) return;                       // respect consent
  window.adobeDataLayer = window.adobeDataLayer || [];  // Adobe Client Data Layer
  window.adobeDataLayer.push({ event: e.name, eventInfo: e });
}
```
- With the **Web SDK** directly: `alloy('sendEvent', { xdm: { eventType: 'web.webpagedetails.pageViews', web: { webPageDetails: { name: 'Home' } } } })`.
- **XDM** = Experience Data Model, Adobe's schema for events and profiles in Adobe Experience Platform.

### 1.2 Mixpanel → Adobe bridge
| Mixpanel | Adobe Analytics |
|---|---|
| Event (`track('Signed Up')`) | Event / success event (`eventN`), or XDM event in the Web SDK |
| Event property | eVar (persists, conversion variable) / prop (traffic, hit-level) |
| User profile (`people.set`) | Visitor profile, ECID (Experience Cloud ID), AEP profile |
| Funnels / retention | Analysis Workspace (freeform tables, fallout, cohort) |
| Project token | Report suite / datastream |

### 1.3 SPAs (React)
- In an SPA there's no full page load, so send a **page view on route change** (React Router location effect) and avoid double-firing in StrictMode dev renders.
- Fire events from **actions**, not from render. Never put tracking in render functions.

### 1.4 Adobe Target (A/B testing, personalisation)
- Activities: **A/B test**, **Experience Targeting** (rules), **Auto-Target / Automated Personalisation** (ML), **Multivariate**.
- **Client-side** (Web SDK or legacy at.js): the page loads, then Target swaps content. That causes **flicker** (FOOC: flash of original content).
  - Mitigation: a **prehiding snippet** hides the affected containers until the decision arrives, with a timeout (~3 s) so a Target outage doesn't blank the page. Load it synchronously and early in `<head>`.
- **Server-side / hybrid**: decide on the server (Target Delivery API, Node/Java SDKs, or on-device decisioning) and render the right variant. No flicker, cacheable per variant, better for SSR/Next.js, at the cost of more engineering.
- **A4T** (Analytics for Target) uses Adobe Analytics as the reporting source for Target activities.
- Engineering rules: one experiment flag per variant, clean up losing variants (they're tech debt), and **sample size before peeking** (stopping early when it "looks significant" inflates false positives).

### 1.5 Consent & privacy (GDPR/ePrivacy; ties to `../4-architecture-security/security-data-privacy.md`)
- No non-essential cookies or tracking before **opt-in** in the EU. Use a CMP (OneTrust etc.) and pass consent to the SDK: `alloy('setConsent', …)`. Configure the Web SDK's default consent as *pending* (or *out*) until the CMP responds.
- Don't send PII (email, name) in analytics events. Use pseudonymous IDs, and hash where the vendor requires it.
- Respect data deletion requests (vendor privacy APIs).

### 1.6 Performance
- Load tag libraries **async**. Audit third-party tags (they're the #1 cause of bad INP/LCP on marketing sites).
- Server-side tagging / event forwarding (Adobe Event Forwarding) moves vendor fan-out off the browser.

---

## 2. Web video basics

### 2.1 Delivery
- **Progressive MP4**: one file, simple, but no quality switching. Fine for short clips.
- **Adaptive bitrate streaming (ABR)**: the video is encoded into a **ladder** of renditions (e.g. 240p → 1080p/4K), cut into ~2–6 s **segments**. The player measures bandwidth and buffer and switches rendition per segment.
  - **HLS** (Apple): `.m3u8` playlists, TS or fMP4 segments. Native in Safari/iOS. Elsewhere via **hls.js** on top of **Media Source Extensions (MSE)**.
  - **MPEG-DASH**: `.mpd` manifest. Players: dash.js, Shaka Player.
  - **CMAF**: a common fMP4 segment format, so one set of segments serves both HLS and DASH. Low-latency variants: LL-HLS, LL-DASH.
- Segments are static files, so they're served from a **CDN** (CloudFront in front of S3/MediaPackage). Caching is very effective. Use signed URLs or cookies for protected content.
- **DRM** via EME: Widevine (Chrome/Android), FairPlay (Apple), PlayReady (Microsoft).
- AWS pipeline: upload to S3 → **MediaConvert** (transcode the ABR ladder) → S3 → CloudFront. Live: MediaLive + MediaPackage.

### 2.2 Player in React
```tsx
import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

export function VideoPlayer({ src, poster, captionsSrc }: { src: string; poster: string; captionsSrc: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current!;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;                       // Safari: native HLS
      return;
    }
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      return () => hls.destroy();            // cleanup: avoid leaks on unmount/route change
    }
  }, [src]);

  return (
    <video ref={ref} controls preload="none" poster={poster} playsInline>
      <track kind="captions" src={captionsSrc} srcLang="en" label="English" default />
    </video>
  );
}
```
- **Lazy-load** the player (dynamic `import()` + `IntersectionObserver`, or a click-to-play poster facade) so it doesn't hurt LCP.
- **Autoplay** only works **muted** (browser autoplay policies). Add `playsInline` for iOS.
- Reserve space with `aspect-ratio: 16 / 9` to avoid layout shift (CLS).

### 2.3 Accessibility (WCAG 2.2)
- **Captions** for prerecorded audio (1.2.2, Level A), as WebVTT `<track kind="captions">`. Audio description or a transcript for important visual information (1.2.3/1.2.5).
- No autoplaying audio longer than 3 s without a pause/stop control (1.4.2). Keyboard-operable controls with visible focus.

### 2.4 Video analytics
- Track **start, pause, milestones (25/50/75/95%), complete, errors, and rebuffering** (quality-of-experience metrics: startup time, rebuffer ratio, bitrate switches).
- Adobe has a dedicated **Streaming Media** (Media Analytics) collection that sends session heartbeats. In Mixpanel you'd send the milestone events yourself.

---

## 3. Interview Q&A

**Q: Have you used Adobe Analytics or Target?**
"Not in production. My product analytics experience is with Mixpanel **[confirm the details]**. The concepts are the same: a data layer with consistent event names and properties, page views on SPA route changes, consent before tracking, and dashboards and funnels. In Adobe terms that's the Web SDK sending XDM events through Tags, eVars and props, and Analysis Workspace. I'd expect to be productive quickly with the team's existing tag setup."

**Q: How would you implement an A/B test without flicker?**
"Ideally decide server-side or at the edge and render the right variant, which also works with SSR and caching per variant. If it has to be client-side, use the prehiding snippet only on the affected regions, load the SDK early, and set a timeout so an outage doesn't blank the page. Then track exposure correctly, and don't stop the test before the planned sample size."

**Q: How do you make sure tracking doesn't break the app or the law?**
"One typed `track()` entry point, so events are consistent and testable. It's a no-op until the CMP gives consent, there's no PII in payloads, it loads async, and every vendor call is wrapped so a tracking error never breaks a user flow. I'd also add a unit test asserting the right event fires on key actions, like adding a favorite."

**Q: How would you serve video for a high-traffic site?**
"Transcode uploads into an ABR ladder (MediaConvert on AWS), package as HLS (or CMAF for HLS and DASH), store in S3 and serve through CloudFront with signed URLs if it's protected. On the client, use native HLS on Safari and hls.js elsewhere, lazy-loaded with a poster facade, captions as WebVTT, and media events for analytics and QoE monitoring."

---

## 4. Traps and gotchas
- Double page views in React StrictMode (dev) or on every re-render. Track on route change or user action.
- Tracking before consent, or putting emails and names in event properties.
- A global prehiding snippet without a timeout: if Target is slow, the whole page is blank.
- Leaving finished experiments' code paths in the codebase.
- Calling HLS "a video format". It's a streaming protocol (playlist + segments); the codecs are H.264/H.265/AV1 + AAC.
- `autoplay` without `muted` (blocked), and no `playsInline` on iOS.
- Forgetting to `destroy()` the hls.js instance on unmount (memory and network leaks).
- Claiming Adobe production experience you don't have. Bridge from Mixpanel honestly.
