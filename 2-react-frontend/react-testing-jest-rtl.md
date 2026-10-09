# Testing React with Jest + React Testing Library

> Group 2 · Priority HIGH · Prep guide Q8 · Status: new file
> Honest note: Rafael has used Jasmine/Karma and Vitest too. The Jest/RTL concepts are the same.

## Say it in 1 minute
"I test what a user can see and do. I render the component, interact with userEvent, and assert on the screen. Queries go by role and accessible name, so inaccessible markup makes the test harder. The network is mocked with MSW, so the real fetching code still runs. Async UI uses findBy, which retries. I skip large snapshots. The pyramid is many component tests, some integration tests, and a few Playwright tests on the paths that matter. On OneHome I took coverage from about 30 to 40 percent up to 80 percent **[how you actually did it, e.g. which flows you covered first]**, and I put that gate in CI. Coverage is a floor. A test can be green and still assert nothing useful."

---

## 1. Core concepts

### Setup
```js
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',                       // browser-like DOM (package: jest-environment-jsdom)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],// imports '@testing-library/jest-dom'
  moduleNameMapper: { '\\.(css|scss)$': 'identity-obj-proxy' },
  transform: { '^.+\\.(t|j)sx?$': ['@swc/jest'] }, // or babel-jest / ts-jest
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.stories.tsx'],
  coverageThreshold: { global: { branches: 80, functions: 80, lines: 80, statements: 80 } }, // CI gate
};
```
`coverageThreshold` makes `jest --coverage` exit non-zero below the threshold, so the Jenkins stage fails. That's the mechanism behind the 80% gate.

### Query priority (from the RTL docs)
1. `getByRole('button', { name: /save/i })`: what assistive tech sees. **Default choice.**
2. `getByLabelText`, `getByPlaceholderText`, `getByText`, `getByDisplayValue`
3. `getByAltText`, `getByTitle`
4. `getByTestId`: last resort

| Variant | No match | Many matches | Async |
|---|---|---|---|
| `getBy` | throws | throws | no |
| `queryBy` | returns `null` (use it to assert absence) | throws | no |
| `findBy` | rejects | rejects | **yes**, retries until timeout (default 1 s) |
| `getAllBy` / `queryAllBy` / `findAllBy` | arrays | | |

### A real component test
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('filters listings by city', async () => {
  const user = userEvent.setup();
  render(<ListingSearch />);

  await user.type(screen.getByRole('searchbox', { name: /city/i }), 'Málaga');
  await user.click(screen.getByRole('button', { name: /search/i }));

  expect(await screen.findByRole('heading', { name: /3 results/i })).toBeInTheDocument();
  expect(screen.getAllByRole('article')).toHaveLength(3);
  expect(screen.queryByText(/no results/i)).not.toBeInTheDocument();
});
```
- **`userEvent` over `fireEvent`**: it simulates full interactions (focus, keydown, input, keyup, click), closer to real users. It's async in v14, so `await` it.
- `jest-dom` matchers: `toBeInTheDocument`, `toBeVisible`, `toBeDisabled`, `toHaveValue`, `toHaveAccessibleName`, `toHaveAttribute`.

### Mocking the network: MSW (preferred) vs `jest.mock`
```ts
// mocks/handlers.ts
import { http, HttpResponse } from 'msw';
export const handlers = [
  http.get('/api/v1/listings', ({ request }) => {
    const city = new URL(request.url).searchParams.get('city');
    return HttpResponse.json({ items: fakeListings(city), totalElements: 3 });
  }),
];
// jest.setup.ts
import { setupServer } from 'msw/node';
export const server = setupServer(...handlers);
beforeAll(() => server.listen()); afterEach(() => server.resetHandlers()); afterAll(() => server.close());

// override per test: the error path
server.use(http.get('/api/v1/listings', () => new HttpResponse(null, { status: 500 })));
```
- MSW intercepts at the network level, so the real fetch/axios/React Query code runs. The tests survive refactors.
- `jest.mock('./api')` mocks a module. It's faster to write but couples the test to the implementation.
- `jest.fn()`, `jest.spyOn(obj, 'method')`, `mockResolvedValue`, `toHaveBeenCalledWith`. Fake timers: `jest.useFakeTimers()` + `jest.advanceTimersByTime()` (with userEvent: `userEvent.setup({ advanceTimers: jest.advanceTimersByTime })`).

### Async: `findBy` vs `waitFor`
```ts
expect(await screen.findByText(/saved/i)).toBeInTheDocument();      // preferred
await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));          // for non-DOM assertions
await waitForElementToBeRemoved(() => screen.queryByRole('progressbar'));
```
Don't put side effects inside `waitFor`, and keep a single assertion per `waitFor`.

### Providers, hooks, routing
```tsx
function renderWithProviders(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/listings']}>{ui}</MemoryRouter>
    </QueryClientProvider>);
}
// custom hooks
const { result } = renderHook(() => useCounter(), { wrapper: Providers });
act(() => result.current.increment());
expect(result.current.count).toBe(1);
```

### Accessibility checks in tests
`jest-axe`: `expect(await axe(container)).toHaveNoViolations()`. It catches some issues automatically (roughly a third). Keyboard and screen-reader testing are still needed.

### Test pyramid for a React + Spring product
- **Unit**: pure functions, reducers, hooks.
- **Component** (RTL): most tests, user behaviour.
- **Integration**: page-level with MSW, routing and providers.
- **Contract**: OpenAPI/Pact between the front end and the Spring API.
- **E2E** (Playwright/Cypress): a few critical journeys (search → listing → contact) against a deployed environment.
- **Visual regression** (Chromatic/Playwright screenshots) for the design system, optional.

### Jest vs Vitest
Vitest has a Jest-compatible API, is Vite-native and faster in Vite projects. Jest is the JD's tool and still dominant in Webpack/CRA-era codebases. The RTL code is identical either way.

---

## 2. Interview questions (spoken model answers)

**Q: How do you test React components?**
"With React Testing Library: render, interact through `userEvent`, assert on what's visible. I query by role and name, never by class names or internals, mock the API with MSW so the real data-fetching code runs, and use `findBy` for async states. I always cover loading, empty and error states, not just the happy path."

**Q: What does "test behaviour, not implementation" mean?**
"The test shouldn't know how the component works: no checking internal state, no calling instance methods, no shallow rendering. If I refactor from `useState` to `useReducer` or swap a library, the tests should still pass as long as the user-visible behaviour is the same. That makes tests an enabler for refactoring instead of a tax."

**Q: How did you raise coverage, and is coverage a good metric?**
"On OneHome coverage was around 30–40%. I raised it to 80% **[how you actually did it, e.g. which flows you covered first]**, and added an 80% coverage gate in the CI pipeline so PRs below it fail. Coverage is a useful floor and a trend signal, but not a quality measure: you can hit 100% with no meaningful assertions. In reviews I look for behaviour and edge-case assertions."

**Q: `getBy` vs `queryBy` vs `findBy`?**
"`getBy` when the element must be there now, since it throws otherwise. `queryBy` to assert something is *not* there, since it returns null. `findBy` for things that appear asynchronously: it returns a promise and retries."

**Q: `fireEvent` vs `userEvent`?**
"`fireEvent` dispatches one DOM event. `userEvent` simulates the whole interaction a real user causes (focus, key events, input, click), so it catches more bugs, like a disabled button or a field you can't focus."

**Q: How do you avoid flaky tests?**
"No arbitrary timeouts: use `findBy`/`waitFor`. Reset mocks and MSW handlers between tests. Isolate state with fresh `QueryClient`s and retries off. Use fake timers for debounce. Use deterministic data, not `Date.now()` or random values. And keep E2E tests to a few critical paths."

**Q: Snapshot tests?**
"Small, targeted inline snapshots can be fine for serialised output, but large component snapshots get rubber-stamped on update and assert nothing meaningful. I prefer explicit assertions."

---

## 3. Traps and gotchas
- Forgetting `await` on `userEvent` calls or `findBy` gives false passes and "not wrapped in act(...)" warnings.
- `getByTestId` everywhere means the tests don't reflect accessibility.
- `container.querySelector('.btn')` is an implementation detail.
- Asserting absence with `getBy` throws. Use `queryBy`.
- React Query retries by default, so error tests time out. Set `retry: false` in tests.
- A shared `QueryClient` across tests leaks cached data between them.
- Testing library internals (e.g. that Redux dispatched an action) instead of the outcome.
- 100% coverage as a target leads to brittle, low-value tests.
- jsdom has no layout (sizes are 0), so test layout and visuals in Playwright.
