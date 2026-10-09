# ⚛️ React Interview Prep — Overview + Top 40 Q&A

> Group 2 · Corrected version of the former `REACT.md` · Priority HIGH
> Legend: **✏️ FIXED** = original text corrected · **➕ ADDED** = new content · unmarked = original
> Deep dives: `react-testing-jest-rtl.md`, `accessibility-responsive.md`, `typescript.md`

## What was fixed (changelog)
1. **Q6 props vs state**: the table said props changes cause **no** re-render. That's wrong: a new prop value from a re-rendering parent re-renders the child.
2. **Q2 Virtual DOM**: added the nuance that VDOM isn't automatically "high performance".
3. **Q16**: the `useState` "merges by replace semantics" wording was confusing. The setter replaces and doesn't merge.
4. **Q17**: `useEffect` timing nuance.
5. **Q25**: error boundaries are still class-only in React 19.
6. **Q27/28**: modern Redux = Redux Toolkit / RTK Query.
7. **Q33/34**: `getServerSideProps`/`getStaticProps` are Next.js **Pages Router** APIs. The App Router uses Server Components.
8. **Q36 testing**: expanded (queries by role, `userEvent`, async, mocking).
9. **Q39**: replaced "React 18+ / emerging" with **React 19** (stable since Dec 2024) and **React Compiler 1.0** (stable since Oct 2025).
10. **➕ Added** Q41–Q46 (React 19 Actions, `use`, Compiler, a11y, data fetching, the OneHome performance story), the 30-second summary and a traps section.

## ➕ Say it in 30 seconds
"React is a declarative, component-based UI library. Components are functions of props and state, and React re-renders when state, props or context change, then reconciles the result to the DOM. I use hooks for state and effects, keep state close to where it's used, put server data in React Query, and only memoise what the profiler shows is slow. React 19 adds Actions, `useActionState`, `useOptimistic` and `use`, and `ref` is now a regular prop. The React Compiler auto-memoises, so manual `useMemo`/`useCallback` matters less. On OneHome I made search and listing pages about 40% faster by measuring first, then fixing image sizing and lazy loading, cutting first-load JS, and removing wasted renders."


---

## 📖 Quick Overview

**React** is a **JavaScript library** for building user interfaces. It focuses on **component-based**, **declarative**, and **unidirectional data flow** architecture.

### 🔹 Core Concepts

- **JSX** — JavaScript + XML syntax for UI elements.
- **Components** — building blocks (functional or class).
- **Props** — external inputs to components.
- **State** — internal mutable data (triggers re-render).
- **Virtual DOM** — efficient UI rendering via diffing.
- **Lifecycle** — mounting, updating, unmounting (or `useEffect` with hooks).
- **Hooks** — state, lifecycle, and performance primitives for function components.

### 🔹 Ecosystem

- **Routing:** React Router.
- **State Management:** Context API, Redux, Zustand, Recoil.
- **Styling:** CSS Modules, Styled Components, Tailwind.
- **SSR/SSG/ISR:** Next.js.
- **Build Tools:** Vite, Webpack, Babel.

### 🔹 Key Advantages

- Component reuse and composition.
- Virtual DOM → high performance.
- Massive ecosystem.
- Easy to integrate with other libraries/frameworks.

---

## ❓ Top 40 Questions & Answers

---

### 1) What is React and why is it popular?

- **React** is a JavaScript library for building **declarative, component-based UIs**.
- Popular because of: Virtual DOM performance, component reuse, strong ecosystem (Next.js, React Native), and a huge community.

---

### 2) What is the Virtual DOM and how does it work?

- The **Virtual DOM (VDOM)** is an in-memory representation of the real DOM.
- On render:
  1. React creates a new virtual tree.
  2. Diffs it against the previous tree.
  3. Applies the minimal changes to the real DOM.
- Result: **fewer DOM operations** → better performance.
- **✏️ FIXED (nuance):** the VDOM isn't free. Diffing costs CPU, and hand-written DOM updates can be faster. Its real value is a **declarative model with "good enough" updates**. Big wins come from rendering less (state colocation, memoisation, virtualisation) and shipping less JS.

---

### 3) What are components in React?

- Components are **reusable building blocks** of UI.
- Types:
  - **Functional Components** → plain functions using hooks.
  - **Class Components** → ES6 classes using lifecycle methods.

```jsx
function Welcome({ name }) {
  return <h1>Hello, {name}</h1>;
}
```

---

### 4) What are props in React?

- **Props** are **read-only inputs** passed from parent to child.
- They enable **reusability** and **composition**.

```jsx
<UserCard name="Alice" age={25} />;
function UserCard({ name, age }) {
  return (
    <p>
      {name} is {age} years old.
    </p>
  );
}
```

---

### 5) What is state in React?

- **State** is **mutable data** local to a component.
- Changing state triggers a **re-render**.

```jsx
const [count, setCount] = useState(0);
<button onClick={() => setCount((c) => c + 1)}>{count}</button>;
```

---

### 6) What is the difference between props and state?

| Feature    | Props               | State               |
| ---------- | ------------------- | ------------------- |
| Source     | Parent → Child      | Inside component    |
| Mutability | Immutable           | Mutable via setters |
| Purpose    | Configure component | Store UI data       |

> **✏️ FIXED:** the original said props cause **no** re-render. A child re-renders whenever its parent re-renders (even with identical props), unless it's wrapped in `React.memo` and its props are shallow-equal. Props are read-only *for the child*, but they change over time.
| Re-render  | ✏️ **Yes**, when the parent re-renders with new prop values | Yes (when set to a new value) |

---

### 7) What are React Hooks?

- Introduced in **React 16.8** to use state & lifecycle in function components.
- Common hooks: `useState`, `useEffect`, `useContext`, `useRef`, `useReducer`, `useMemo`, `useCallback`.

```jsx
useEffect(() => {
  console.log("Mounted!");
  return () => console.log("Unmounted");
}, []);
```

---

### 8) What is the useEffect hook used for?

- Manages **side effects** (data fetching, subscriptions, timers).
- Runs **after** render by default.

```jsx
useEffect(() => {
  document.title = `Count: ${count}`;
}, [count]);
```

---

### 9) What is the difference between controlled and uncontrolled components?

| Type         | Description                  | Example                                                          |
| ------------ | ---------------------------- | ---------------------------------------------------------------- |
| Controlled   | Value managed by React state | `<input value={name} onChange={e => setName(e.target.value)} />` |
| Uncontrolled | Value stored in the DOM      | `<input ref={ref} />` with `ref.current.value`                   |

- Controlled → better validation and single source of truth.
- Uncontrolled → simple cases (e.g., file inputs).

---

### 10) What is JSX and how does it work?

- **JSX** is HTML-like syntax in JS that compiles to `React.createElement`.

```jsx
const el = <h1>Hello</h1>;
// Compiles to:
React.createElement("h1", null, "Hello");
```

---

### 11) Explain the component lifecycle in React.

**Phases:**

1. **Mounting** – create & insert into DOM (`useEffect(..., [])` runs after mount).
2. **Updating** – due to state/prop/context changes (`useEffect` with deps).
3. **Unmounting** – removal from DOM (effects’ **cleanup** runs).

---

### 12) What are keys in React and why are they important?

- **Keys** uniquely identify list items to help React **reconcile** efficiently.

```jsx
{
  users.map((u) => <UserCard key={u.id} user={u} />);
}
```

- Use **stable IDs**, not indexes, to preserve state between reorders.

---

### 13) What are refs and how are they used?

- **Refs** provide a way to access DOM elements/values without re-renders.

```jsx
const inputRef = useRef();
useEffect(() => inputRef.current.focus(), []);
return <input ref={inputRef} />;
```

- Also useful for storing mutable values across renders.

---

### 14) What is the Context API in React?

- **Context** avoids prop drilling by sharing values globally.

```jsx
const ThemeContext = createContext("light");
function Toolbar() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>Theme</button>;
}
```

- Use for **theme, locale, auth**; avoid overuse for frequently changing data (can cause re-renders).

---

### 15) What are React Hooks and why were they introduced?

- Hooks replaced many class patterns: state, lifecycle, context consumers.
- Enable **reuse of stateful logic** via **custom hooks** and simplify testing.

---

### 16) Explain all commonly used React Hooks (with quick notes).

**Core:**

- ✏️ `useState(initial)` – local state. The setter **replaces** the value and does **not** merge objects (unlike class `setState`), so spread it yourself: `setForm(f => ({ ...f, name }))`. Use the updater form when the next value depends on the previous one.
- `useEffect(fn, deps?)` – side effects after paint; cleanup by returning a function.
- `useContext(ctx)` – read nearest Provider value.
- `useRef(init)` – mutable ref object `{ current }`; persists across renders.
- `useReducer(reducer, init)` – complex state logic; predictable updates.
- `useMemo(factory, deps)` – memoize **values**; avoid expensive recalcs.
- `useCallback(fn, deps)` – memoize **functions**; stable identity for children.

**Additional:**

- `useLayoutEffect` – like `useEffect` but runs **synchronously after DOM mutations** (for measurements).
- `useImperativeHandle(ref, create, deps)` – customize value exposed via `ref` in `forwardRef` components.
- `useDebugValue(value)` – label values in React DevTools for custom hooks.
- `useId()` – generate unique, stable IDs for accessibility.
- `useTransition()` – mark updates as non-urgent (concurrent rendering).
- `useDeferredValue(value)` – defer re-rendering of expensive subtrees.

---

### 17) What is the difference between useEffect and useLayoutEffect?

| Aspect   | useEffect                      | useLayoutEffect                  |
| -------- | ------------------------------ | -------------------------------- |
| Timing   | After paint (async)            | Before paint (sync)              |
| Blocking | No                             | Yes (can block paint)            |
| Use for  | Data fetching, subscriptions   | DOM reads/writes, measurement    |
| Pitfall  | UI may flicker for layout work | Can hurt performance if overused |

- **➕ Nuance:** `useEffect` normally runs after paint, but effects triggered by a discrete user input (click, keypress) may flush synchronously before paint. In Strict Mode (dev), React runs mount → unmount → mount to surface missing cleanups.
- **➕ "You might not need an effect":** don't use effects to derive state from props/state (compute during render) or to respond to events (do it in the handler).

---

### 18) What are custom hooks and why are they useful?

- **Custom Hooks** extract & reuse stateful logic across components.

```jsx
function useWindowWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return w;
}
```

- Compose hooks freely (they’re just functions).

---

### 19) What is memoization in React and which hooks help achieve it?

- **Memoization** caches results to avoid recomputation and re-renders.
- Use `useMemo` for computed values and `useCallback` for function identities.

```jsx
const total = useMemo(() => items.reduce((a, b) => a + b.price, 0), [items]);
const onClick = useCallback(() => doSomething(total), [total]);
```

---

### 20) What is React.memo and when should it be used?

- `React.memo(Component)` memoizes the rendered output of **pure** components.
- Prevents re-render unless props change (shallow comparison).
- Combine with `useCallback`/`useMemo` to stabilize props.

---

### 21) What causes re-renders in React?

- Calling a state setter (`setX`).
- Receiving new props (including **new object/array/function identities**).
- Context value changes.
- Parent re-renders (prop reference changes propagate).

**Mitigation:** Split components, memoize props, lift state thoughtfully.

---

### 22) How do you optimize React performance?

- **Memoization** (`useMemo`, `useCallback`, `React.memo`).
- **Code splitting/Lazy loading** (`React.lazy`, dynamic imports).
- **Virtualization** for large lists (`react-window`).
- **Debounce/Throttle** input handlers.
- Avoid inline object/array literals in hot paths.
- Use **production build** (minification, tree-shaking).

---

### 23) What are fragments in React?

- Group elements **without extra DOM nodes**.

```jsx
<>
  <h1>Title</h1>
  <p>Content</p>
</>
```

---

### 24) What are portals in React?

- Render children into a DOM node **outside** the parent hierarchy (useful for modals, tooltips).

```jsx
ReactDOM.createPortal(<Modal />, document.getElementById("modal-root"));
```

---

### 25) What are error boundaries?

- Components that **catch JS errors** in child trees and render fallback UIs.

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    /* log */
  }
  render() {
    return this.state.hasError ? <h2>Oops</h2> : this.props.children;
  }
}
```

- For function components use libraries like `react-error-boundary`.
- **✏️ Still true in React 19:** there's no hook equivalent. Error boundaries don't catch errors in event handlers, async code or SSR, so handle those with try/catch. React 19 adds `onCaughtError`/`onUncaughtError` root options for logging.

---

### 26) What is React Suspense?

- Mechanism to **defer rendering** until data or modules are ready.

```jsx
const Profile = React.lazy(() => import("./Profile"));
<Suspense fallback={<Spinner />}>
  <Profile />
</Suspense>;
```

- Works with **lazy imports** and **concurrent features**; frameworks like Next.js add data-fetching support.

---

### 27) Difference between Redux and Context API?

| Feature     | Redux                                      | Context API                      |
| ----------- | ------------------------------------------ | -------------------------------- |
| Use case    | Complex global state, tooling, time-travel | Simple shared data (theme, auth) |
| Structure   | Store, actions, reducers, middleware       | Provider/Consumer                |
| Performance | Optimized via selectors & connect          | May re-render many consumers     |
| Tooling     | Excellent DevTools                         | Minimal                          |

- **➕ Modern Redux = Redux Toolkit** (`configureStore`, `createSlice`, Immer). Hand-written action types and switch reducers are legacy. For server data, prefer **TanStack Query / RTK Query** over storing fetched data in Redux. Lightweight alternatives: Zustand, Jotai.

---

### 28) What are Redux middleware and Thunks?

- **Middleware** enhance dispatch (logging, async).
- **Thunk** lets action creators return functions for async flows.

```js
export const fetchUsers = () => async (dispatch) => {
  const res = await fetch("/api/users");
  dispatch({ type: "SET_USERS", payload: await res.json() });
};
```
- **➕** In RTK this is `createAsyncThunk`, or better, an RTK Query endpoint that handles caching, loading and error states for you.

---

### 29) What are React Router’s main features?

- Declarative routing with `react-router-dom`.

```jsx
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/user/:id" element={<User />} />
  </Routes>
</BrowserRouter>
```

- Hooks: `useNavigate`, `useParams`, `useLocation`.

---

### 30) What are Higher-Order Components (HOCs)?

- Functions that take a component and return an enhanced component.

```jsx
const withLogger = (Comp) => (props) => {
  console.log("render", Comp.name);
  return <Comp {...props} />;
};
```

- Favor **custom hooks** for new code.

---

### 31) What are Render Props?

- Share logic via a function prop that returns UI.

```jsx
<Mouse
  render={(pos) => (
    <p>
      {pos.x},{pos.y}
    </p>
  )}
/>
```

- Pre-hooks pattern; now typically a custom hook.

---

### 32) What are Compound Components?

- Pattern where a parent coordinates subcomponents via context.

```jsx
<Tabs>
  <Tabs.List>
    <Tabs.Trigger value="home">Home</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="home">Home Page</Tabs.Content>
</Tabs>
```

---

### 33) What is Server-Side Rendering (SSR) in React?

- Render HTML on the server for faster FCP and SEO.
- Implemented via frameworks like **Next.js**.
- **✏️ FIXED:** `getServerSideProps` is the **Pages Router** API (legacy style). In the **App Router**, components are **Server Components** by default and fetch data directly (`async function Page() { const data = await fetch(...) }`), with caching and revalidation controlled per fetch or route. **Hydration** attaches event handlers to server HTML on the client.

---

### 34) What is Static Site Generation (SSG)?

- Pre-render pages at **build time** for speed and caching.
- **Incremental Static Regeneration (ISR)** updates pages post-build (Next.js).
- **✏️** Pages Router: `getStaticProps` + `revalidate`. App Router: `export const revalidate = 60` or `fetch(url, { next: { revalidate: 60 } })`.

---

### 35) What are Concurrent Features in React 18?

- **Automatic batching** of updates.
- **Transitions** with `useTransition`.
- **Suspense** improvements.
- **Streaming SSR** for faster server rendering.

---

### 36) How do you test React components?

- **Jest** + **React Testing Library** (RTL) for behavior-focused tests.

```jsx
import { render, screen } from "@testing-library/react";
test("greets", () => {
  render(<Hello name="World" />);
  expect(screen.getByText("Hello World")).toBeInTheDocument();
});
```

- **✏️ Expanded:** query like a user. Prefer `getByRole('button', { name: /save/i })` over `getByTestId`. Use `userEvent` (async) for interactions, `findBy*`/`waitFor` for async UI, and mock the network with MSW or `jest.mock`. **Test behaviour, not implementation** (no checking state or internal methods).

```jsx
import userEvent from "@testing-library/user-event";
test("submits the form", async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);
  await user.type(screen.getByLabelText(/email/i), "a@b.com");
  await user.click(screen.getByRole("button", { name: /log in/i }));
  expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.com" });
});
```
- My story: OneHome coverage went from ~30–40% to **80%**, with an **80% CI gate**. → `react-testing-jest-rtl.md`

---

### 37) What are React performance pitfalls?

- Missing keys in lists.
- Unstable function/object props causing re-renders.
- Large lists without virtualization.
- Heavy computations inside render (use `useMemo`).
- Doing layout work in `useEffect` instead of `useLayoutEffect`.

---

### 38) What are React best practices?

- Prefer **function components + hooks**.
- Keep state minimal and colocated.
- Use **TypeScript** or prop-types.
- Isolate side effects; clean up subscriptions.
- Use error boundaries & Suspense.
- Enforce linting and testing.

---

### 39) ✏️ What’s new in React 18 and 19?

- **React 18:** automatic batching, Transitions (`useTransition`), improved Suspense, streaming SSR, `createRoot`.
- **✏️ React 19 (stable Dec 2024; 19.1/19.2 in 2025):**
  - **Actions**: async functions in transitions. `<form action={fn}>` handles pending state, errors and reset.
  - **`useActionState`** (form state and pending), **`useFormStatus`** (pending state for a child of a form), **`useOptimistic`** (instant UI, rolled back on failure).
  - **`use(promise | context)`**: read a promise (suspends) or context, even conditionally.
  - **`ref` as a regular prop**: `forwardRef` is no longer needed for function components. Ref callbacks can return a cleanup.
  - `<title>`, `<meta>` and `<link>` rendered anywhere are hoisted to `<head>`. Stylesheet and preload APIs.
  - **Server Components and Server Actions** are stable (used through frameworks like Next.js).
  - 19.2: `<Activity>` (hide or keep UI state offscreen), `useEffectEvent`.
- **✏️ React Compiler 1.0** (stable Oct 2025): a build-time tool that auto-memoises components and hooks, so most manual `useMemo`/`useCallback`/`React.memo` becomes unnecessary. It requires following the Rules of React.

---

### 40) Bonus: How does React differ from Angular or Vue?

- **React** → library for views; choose your own stack.
- **Angular** → full framework (DI, RxJS, router, forms).
- **Vue** → progressive framework with simpler reactivity and SFCs.

---

### ➕ 41) What are Actions and `useActionState` (React 19)?

```jsx
function NewListingForm() {
  const [state, formAction, isPending] = useActionState(async (prev, formData) => {
    const res = await createListing(formData.get("title"));
    return res.ok ? { error: null } : { error: "Could not save" };
  }, { error: null });

  return (
    <form action={formAction}>
      <label htmlFor="title">Title</label>
      <input id="title" name="title" required />
      <button disabled={isPending}>{isPending ? "Saving…" : "Save"}</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```
- Pending, error and optimistic state without hand-written `useState` flags.

---

### ➕ 42) `useOptimistic` example (favourite a listing)

```jsx
const [optimisticFav, setOptimisticFav] = useOptimistic(isFav);
async function toggle() {
  startTransition(async () => {
    setOptimisticFav(!optimisticFav);    // UI updates instantly
    await api.toggleFavourite(id);       // reverts automatically if this throws
  });
}
```

---

### ➕ 43) What does the React Compiler change for interviews?

- It memoises automatically at build time, so "wrap everything in `useCallback`" is no longer the advice.
- You still need to understand **why** re-renders happen, the **Rules of React** (pure render, no mutating props/state, hooks at the top level) and **profiling**.
- Manual memoisation still helps with third-party libraries that need stable references, or effect dependencies, in codebases without the compiler.

---

### ➕ 44) How do you fetch data in a modern React app?

- **Client SPA:** TanStack Query (React Query) for caching, dedupe, retries, background refetch, invalidation after mutations, and optimistic updates. Avoid `useEffect` + `fetch` by hand (race conditions, no cache).
- **Framework (Next.js App Router):** Server Components fetch on the server, with Suspense streaming.
- Typed client generated from the backend's OpenAPI spec (I did this on Benwer Cars).

---

### ➕ 45) How do you make React components accessible?

- Semantic elements first (`<button>`, not `<div onClick>`), labels tied to inputs (`useId` for ids), visible focus, keyboard support, focus management in modals and on route change, `aria-*` only when no native element fits, `role="alert"`/live regions for async messages.
- Test with RTL role queries, axe, and keyboard-only. → `accessibility-responsive.md`

---

### ➕ 46) "Tell me how you optimised a slow React page." (STAR, real)

- **S/T:** OneHome search and listing-detail pages were slow.
- **A:** Measured first (Lighthouse / Core Web Vitals: LCP, INP, CLS, plus React Profiler). Then: correctly sized and lazy-loaded images, cut first-load JS (code splitting, `React.lazy`/dynamic import, removing unused libraries), fixed repeated expensive layout/CSS work, memoised where the profiler showed wasted renders, virtualised long lists.
- **R:** About **40% faster**. Measured again after every change.

---

## ✅ Quick Cheat Notes

- Use **keys** with stable IDs.
- Prefer **`useEffect`** for effects; **`useLayoutEffect`** only for layout.
- Optimize with **`useMemo`/`useCallback`/`React.memo`**.
- Use **Context** for stable, low-frequency global data; Redux/Zustand for complex app state.
- For SSR/SSG/ISR → **Next.js**.
- **➕** React 19: Actions, `useActionState`, `useOptimistic`, `use`, `ref` as a prop. The Compiler auto-memoises.

---

## ➕ Traps and gotchas
- "Props don't trigger re-renders": wrong (see Q6).
- Index as `key` in reorderable lists leads to state attached to the wrong rows.
- Mutating state (`arr.push`) then calling `setArr(arr)` means the same reference, so no re-render.
- Stale closures in effects or intervals: missing dependencies. Use the updater form or a ref.
- Fetch in `useEffect` without cleanup leads to race conditions. Use an AbortController or ignore flag, or React Query.
- Objects as Context values recreated on every render re-render all consumers. Memoise the value or split contexts.
- `useEffect` for derived state causes an extra render and bugs. Compute during render.
- Saying `forwardRef` is required, or that Server Components are "experimental", dates you (React 19).
- `dangerouslySetInnerHTML` with user content is XSS. Sanitise (DOMPurify).
