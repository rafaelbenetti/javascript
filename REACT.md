# ⚛️ React Interview Prep — Overview + Top 40 Q&A

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
| Re-render  | No                  | Yes                 |

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

- `useState(initial)` – local state; setter merges by replace semantics.
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
- Implemented via frameworks like **Next.js** (`getServerSideProps`).

---

### 34) What is Static Site Generation (SSG)?

- Pre-render pages at **build time** for speed and caching.
- **Incremental Static Regeneration (ISR)** updates pages post-build (Next.js).

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

### 39) What’s new in React 18+?

- **Automatic batching**, **Transitions**, improved **Suspense**, **Streaming SSR**.
- **Server Components** (emerging) for minimal client JS.
- Tooling around **React Compiler** (auto memoization) is evolving.

---

### 40) Bonus: How does React differ from Angular or Vue?

- **React** → library for views; choose your own stack.
- **Angular** → full framework (DI, RxJS, router, forms).
- **Vue** → progressive framework with simpler reactivity and SFCs.

---

## ✅ Quick Cheat Notes

- Use **keys** with stable IDs.
- Prefer **`useEffect`** for effects; **`useLayoutEffect`** only for layout.
- Optimize with **`useMemo`/`useCallback`/`React.memo`**.
- Use **Context** for stable, low-frequency global data; Redux/Zustand for complex app state.
- For SSR/SSG/ISR → **Next.js**.
