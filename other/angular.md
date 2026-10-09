# 🅰️ Angular Prep Guide

---

## Overview

### What is Angular?

Angular is a **TypeScript-based frontend framework** for building scalable, enterprise-grade web applications.  
It provides a full ecosystem: components, dependency injection, forms, routing, RxJS integration, testing tools, and build tooling.

### Why Angular for Enterprise (like Vanguard)?

- **Strong typing** (TypeScript) → safer, maintainable code.
- **Scalability** → modules, standalone components, DI, NgRx.
- **Performance** → OnPush CD, signals, lazy loading, aot, tree-shaking.
- **Ecosystem** → i18n, a11y, Angular Universal (SSR).
- **Community & support** → large adoption in enterprises, LTS releases.

### Core Building Blocks

- **Components** → UI units with templates + logic.
- **Directives** → extend HTML (`*ngFor`, `*ngIf`, custom).
- **Pipes** → transform data in templates.
- **Services** → singleton logic, injected.
- **Dependency Injection** → hierarchical, flexible.
- **Routing** → client-side navigation, guards, resolvers, lazy load.
- **Forms** → reactive or template-driven.
- **RxJS & Signals** → async streams + reactivity.

## What is tree-shaking in Angular

- Tree-shaking is a dead code elimination technique used by Angular (through Webpack + Terser) to remove unused code during the build process. It analyzes your imports and application dependency graph, then eliminates any functions, classes, or modules that are never actually used in the final bundle.

---

# 🅰️ Angular — Detailed Interview Q&A

---

## 1) Standalone components vs NgModules

**Context:** Since Angular v14, standalone APIs are encouraged, but many projects still have NgModules. Interviewers want to see if you know both.

**Answer:**

- **Standalone components**: don’t need an NgModule. They declare their own `imports` (CommonModule, RouterModule, etc.) and can be bootstrapped directly. This reduces boilerplate and improves tree-shaking.
- **NgModules**: group components, directives, and services into logical units. Still valid, often used in older projects or when grouping multiple features together.

**Code:**

```ts
// main.ts (bootstrap standalone app)
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
});

// app.component.ts
@Component({
  selector: "app-root",
  standalone: true,
  imports: [CommonModule],
  template: `<h1>Hello Angular!</h1>`,
})
export class AppComponent {}
```

**Takeaway:** Use **standalone components** by default; NgModules mainly for legacy or grouping large features.

---

## 2) Change detection strategies

**Context:** Change detection is crucial for performance. Default strategy can cause unnecessary re-renders.

**Answer:**

- **Default**: Angular checks the entire component tree whenever something might have changed.
- **OnPush**: Angular only checks the component if:
  - An `@Input` reference changes
  - An event originates from the component
  - An observable/signal used in the template emits

This reduces CPU work and makes apps faster.

**Code:**

```ts
@Component({
  selector: "user-list",
  template: `
    <li *ngFor="let u of users$ | async; trackBy: trackId">{{ u.name }}</li>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class UserListComponent {
  users$ = this.service.getUsers();
  trackId = (_: number, u: any) => u.id;
}
```

**Takeaway:** Use **OnPush** + `async` pipe (or signals) to avoid unnecessary change detection.

---

## 3) Signals vs RxJS

**Context:** Angular introduced **signals** in v16. Many projects still use RxJS. You’ll likely be asked to compare.

**Answer:**

- **Signals**: _pull-based_, synchronous, great for local component state. Think of them as “reactive variables.”
- **RxJS Observables**: _push-based_, asynchronous, powerful for handling streams like HTTP, user input, or websockets.

They complement each other. Use signals for UI state, RxJS for streams and side effects.

**Code:**

```ts
// signal for local state
const count = signal(0);
const doubled = computed(() => count() * 2);

// bridging RxJS to signals
const data$ = this.http.get<User[]>("/api/users");
const dataSig = toSignal(data$, { initialValue: [] });
```

**Takeaway:** Signals simplify UI state; RxJS remains king for async streams. Use them together.

---

## 4) Template-driven vs Reactive forms

**Context:** Angular supports both, but enterprises prefer reactive.

**Answer:**

- **Template-driven forms**: simple, fast for small forms. Logic is in the template.
- **Reactive forms**: code-driven, scalable, testable, strongly typed (since Angular 14+). Preferred for complex UIs.

**Code (reactive, typed):**

```ts
const fb = inject(NonNullableFormBuilder);

form = fb.group({
  name: ["", Validators.required],
  age: [0, [Validators.min(18)]],
});

// typed access
type FormValue = typeof this.form.value;
```

**Takeaway:** Use **reactive forms** for complex, testable apps.

---

## 5) HttpClient & interceptors

**Context:** Every app calls APIs. Employers want to see if you centralize logic.

**Answer:**

- Always **type** your responses.
- Use **interceptors** for authentication, logging, retry, and error handling.
- Don’t scatter headers or error handling in components.

**Code:**

```ts
// service
@Injectable({ providedIn: "root" })
export class UserService {
  http = inject(HttpClient);
  getUsers() {
    return this.http.get<User[]>("/api/users");
  }
}

// interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem("token");
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next.handle(authReq).pipe(
      catchError((err) => {
        console.error("API error", err);
        return throwError(() => err);
      })
    );
  }
}
```

**Takeaway:** Keep API logic in **services + interceptors**, not components.

---

## 6) Routing basics (lazy loading, guards)

**Context:** Routing impacts UX and security.

**Answer:**

- **Lazy loading** reduces bundle size (load features only when needed).
- **Guards** (e.g., `CanActivate`) control access.
- **Resolvers** fetch data before navigation.

**Code:**

```ts
export const routes: Routes = [
  {
    path: "users",
    loadComponent: () =>
      import("./users/users.component").then((m) => m.UsersComponent),
    canActivate: [authGuard],
    resolve: { data: userResolver },
  },
];
```

**Takeaway:** **Lazy load** by default; guard routes for security.

---

## 7) Component communication

**Context:** How components talk to each other.

**Answer:**

- **Parent → Child**: `@Input()`
- **Child → Parent**: `@Output()` EventEmitter
- **Across tree**: services with signals/Subjects, or NgRx for global state

**Code:**

```ts
// child
@Component({ ... })
export class Child {
  @Input() user!: User;
  @Output() saved = new EventEmitter<User>();
}

// parent
<child [user]="user" (saved)="onSave($event)"></child>
```

**Takeaway:** Use Inputs/Outputs for simple cases, services/signals for shared state.

---

## 8) Dependency Injection & providers scope

**Context:** DI is Angular’s backbone.

**Answer:**

- `providedIn: 'root'` → singleton across app.
- `providedIn: 'any'` → new per lazy module.
- Component-level `providers` → new instance for each component.

**Code:**

```ts
@Injectable({ providedIn: "root" })
export class ApiService {}

@Component({
  providers: [ApiService], // new instance per component
})
export class DemoComponent {}
```

**Takeaway:** Scope DI carefully; don’t accidentally create multiple service instances.

---

## 9) Lifecycle hooks order

**Context:** You’ll be asked about order for debugging/init logic.

**Answer:**  
Order of common hooks:  
`ngOnChanges → ngOnInit → ngDoCheck → ngAfterContentInit → ngAfterContentChecked → ngAfterViewInit → ngAfterViewChecked → ngOnDestroy`

**Code:**

```ts
export class Demo implements OnInit, OnDestroy {
  ngOnInit() {
    console.log("init");
  }
  ngOnDestroy() {
    console.log("destroy");
  }
}
```

**Takeaway:** Know order; it helps debug unexpected behavior.

---

## 10) Angular CLI & build process

**Context:** Enterprise apps rely on builds, environments, and optimizations.

**Answer:**

- CLI scaffolds code and builds with esbuild/Webpack.
- AOT (Ahead-of-Time) compiles templates at build time.
- Tree-shaking removes unused code.
- Angular v18+ supports **Vite** for faster builds.

**Commands:**

```bash
ng build --configuration=production
ng serve
ng test
```

**Takeaway:** Use CLI for productivity; builds are optimized with AOT + tree-shaking.

---

# 🅰️ Angular — Detailed Interview Q&A (11–20)

## 11) **Performance optimizations**

**Context:** Angular apps can easily slow down with big lists or complex UI.

**Answer:**

- Use `ChangeDetectionStrategy.OnPush`
- Use `trackBy` in `*ngFor` to prevent DOM re-creation
- Lazy load routes
- Use pure pipes for caching
- Break big components into smaller ones

**Code:**

```html
<li *ngFor="let item of items; trackBy: trackId">{{ item.name }}</li>
```

```ts
trackId = (_: number, item: Item) => item.id;
```

**Takeaway:** Focus on **OnPush + trackBy** for the biggest performance wins.

---

## 12) **Observables vs Promises in Angular**

**Context:** HttpClient returns Observables; why not Promises?

**Answer:**

- **Promises** → one value, eager, no cancellation
- **Observables** → multiple values, lazy, cancellable, composable with operators

**Code:**

```ts
// Promise
fetch("/api").then((res) => res.json());

// Observable
this.http.get<User[]>("/api/users").subscribe(console.log);
```

**Takeaway:** Observables integrate seamlessly with Angular’s async pipe and change detection.

---

## 13) **AsyncPipe & unsubscribe patterns**

**Context:** Memory leaks are common in Angular if you forget to unsubscribe.

**Answer:**

- **AsyncPipe** in templates auto-subscribes/unsubscribes.
- In code, use `takeUntil`, `first`, or `ngOnDestroy`.

**Code:**

```html
<p *ngFor="let user of users$ | async">{{ user.name }}</p>
```

```ts
private destroy$ = new Subject<void>();
ngOnInit() {
  this.svc.users$.pipe(takeUntil(this.destroy$)).subscribe();
}
ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

**Takeaway:** Prefer **AsyncPipe**, use `takeUntil` in components/services.

---

## 14) **Pipes (pure vs impure, custom)**

**Context:** Transforming data in templates.

**Answer:**

- **Pure pipes** (default): run only when input changes.
- **Impure pipes**: run every CD cycle (can be expensive).
- Custom pipes help keep templates clean.

**Code:**

```ts
@Pipe({ name: "capitalize" })
export class CapitalizePipe implements PipeTransform {
  transform(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
```

**Takeaway:** Stick with **pure pipes** unless you _must_ recompute every cycle.

---

## 15) **ViewEncapsulation strategies**

**Context:** CSS scoping in Angular.

**Answer:**

- **Emulated** (default): styles scoped with attribute selectors.
- **ShadowDom**: uses real shadow DOM.
- **None**: global styles (dangerous).

**Code:**

```ts
@Component({
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MyCmp {}
```

**Takeaway:** Default **Emulated** is safe; use ShadowDom for true isolation.

---

## 16) **Content projection & ViewChild**

**Context:** Flexible UIs often need reusable slots.

**Answer:**

- **Content projection**: pass markup into a component (`<ng-content>`).
- **ViewChild**: access child DOM/components from parent.

**Code:**

```html
<!-- parent -->
<card><h2>Title</h2></card>

<!-- card.component.html -->
<div class="card"><ng-content></ng-content></div>
```

```ts
@ViewChild('input') input!: ElementRef<HTMLInputElement>;
```

**Takeaway:** Use **ng-content** for slotting, `ViewChild` for programmatic access.

---

## 17) **Forms validation**

**Context:** Forms are critical in enterprise apps.

**Answer:**

- **Sync validators**: run immediately (`required`, `minLength`).
- **Async validators**: run server checks (`emailExists`).

**Code:**

```ts
form = fb.group({
  email: ['', [Validators.required, Validators.email], [this.emailValidator]]
});

// async validator
emailValidator(ctrl: AbstractControl) {
  return this.http.get(`/check-email?e=${ctrl.value}`).pipe(
    map((res: any) => res.valid ? null : { emailTaken: true })
  );
}
```

**Takeaway:** Use **async validators** for server checks.

---

## 18) **Error handling in Angular**

**Context:** Apps must fail gracefully.

**Answer:**

- **Global**: override `ErrorHandler`.
- **API errors**: handle in interceptors.
- **Routing errors**: catch with error routes.

**Code:**

```ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(err: any) {
    console.error("Global error:", err);
  }
}
```

**Takeaway:** Centralize error handling → consistent UX.

---

## 19) **Internationalization (i18n)**

**Context:** Enterprises serve multiple languages.

**Answer:**

- Angular’s built-in i18n extracts messages with `ng extract-i18n`.
- Translation files (XLIFF/JSON) are merged at build.

**Commands:**

```bash
ng extract-i18n --output-path src/locale
```

**Takeaway:** Use Angular’s **i18n** for production apps; `ngx-translate` for flexibility.

---

## 20) **Accessibility (a11y) best practices**

**Context:** Financial apps like Vanguard must meet WCAG.

**Answer:**

- Use semantic HTML (`<button>` not `<div>`).
- Add ARIA roles only when needed.
- Ensure keyboard navigation works.
- Use Angular CDK’s a11y tools.

**Code:**

```html
<button aria-label="Save changes">💾</button>
```

**Takeaway:** Accessibility is **non-negotiable** in enterprise apps.

# 🅰️ Angular — Detailed Interview Q&A (21–30)

## 21) **State management options**

**Context:** Every Angular app needs state. Interviewers want to see trade-offs.

**Answer:**

- Start simple: **component signals** or **BehaviorSubject in a service**.
- Scale up: **NgRx, NGXS, Akita** for cross-feature state, debugging, effects.
- Don’t jump into NgRx unless needed — it adds boilerplate.

**Code (service with signal):**

```ts
@Injectable({ providedIn: "root" })
export class RolloverStore {
  private _items = signal<Rollover[]>([]);
  readonly items = computed(() => this._items());

  set(items: Rollover[]) {
    this._items.set(items);
  }
}
```

**Takeaway:** Use **signals/services first**, scale to NgRx if complexity grows.

---

## 22) **NgRx basics**

**Context:** NgRx is popular for enterprise apps.

**Answer:**  
NgRx is based on **Redux pattern**:

- **Action**: describe an event
- **Reducer**: pure function updates state
- **Selector**: query state
- **Effect**: handle async side effects (API calls)

**Code:**

```ts
// action
export const loadUsers = createAction("[Users] Load");
export const loadUsersSuccess = createAction(
  "[Users] Load Success",
  props<{ users: User[] }>()
);

// reducer
const initialState: UserState = { users: [] };
export const usersReducer = createReducer(
  initialState,
  on(loadUsersSuccess, (state, { users }) => ({ ...state, users }))
);

// effect
loadUsers$ = createEffect(() =>
  this.actions$.pipe(
    ofType(loadUsers),
    switchMap(() =>
      this.api.getUsers().pipe(map((users) => loadUsersSuccess({ users })))
    )
  )
);
```

**Takeaway:** NgRx = predictable state, great for **complex apps**.

---

## 23) **SSR (Server-Side Rendering) & hydration**

**Context:** SEO and performance are critical.

**Answer:**

- **SSR (Angular Universal)**: renders HTML on server for fast first paint and SEO.
- **Hydration**: Angular attaches event listeners to server-rendered DOM instead of re-rendering.

**Code:**

```bash
ng add @nguniversal/express-engine
```

**Takeaway:** Use SSR + hydration for SEO-heavy apps (marketing pages, finance dashboards).

---

## 24) **Preloading strategies**

**Context:** Optimize lazy loading for UX.

**Answer:**

- **NoPreloading** (default): load on demand.
- **PreloadAllModules**: load everything after bootstrap.
- **Custom strategy**: preload only flagged routes.

**Code:**

```ts
RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules });
```

**Takeaway:** Use **PreloadAllModules** if bandwidth allows; custom strategies for fine control.

---

## 25) **Custom directives (attribute vs structural)**

**Context:** Interviewers love this — shows you know Angular under the hood.

**Answer:**

- **Attribute directive**: changes appearance/behavior of an element.
- **Structural directive**: changes DOM structure (`*ngIf`, `*ngFor`).

**Code:**

```ts
@Directive({ selector: "[highlight]" })
export class HighlightDirective {
  constructor(el: ElementRef) {
    el.nativeElement.style.background = "yellow";
  }
}
```

**Takeaway:** Attribute = style/behavior, Structural = add/remove DOM.

---

## 26) **Angular animations**

**Context:** Needed for enterprise UX.

**Answer:**  
Angular has a **built-in animation API** powered by Web Animations.

**Code:**

```ts
@Component({
  selector: "fade-box",
  template: `<div @fade>Content</div>`,
  animations: [
    trigger("fade", [
      transition(":enter", [style({ opacity: 0 }), animate(300)]),
      transition(":leave", [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class FadeBox {}
```

**Takeaway:** Angular animations = declarative, reusable, built-in.

---

## 27) **Guards vs Resolvers**

**Context:** Routing control.

**Answer:**

- **Guard**: decides if navigation can proceed (`authGuard`).
- **Resolver**: prefetches data before activating a route.

**Code:**

```ts
export const userResolver: ResolveFn<User[]> = () =>
  inject(UserService).getUsers();

export const authGuard: CanActivateFn = () =>
  !!inject(AuthService).isLoggedIn();
```

**Takeaway:** Guards = **access control**, Resolvers = **data prefetch**.

---

## 28) **Microfrontends in Angular**

**Context:** Enterprises often ask about scaling across teams.

**Answer:**

- Use **Module Federation (Webpack 5)** or **Web Components**.
- Split big apps into independently deployed pieces.

**Takeaway:** Microfrontends = good for **huge teams**; avoid unless necessary.

---

## 29) **Lazy loading standalone components**

**Context:** Post-NgModules, lazy loading got simpler.

**Answer:**  
Standalone components can be lazy-loaded directly with `loadComponent`.

**Code:**

```ts
{ path: 'profile', loadComponent: () => import('./profile.component').then(m => m.ProfileComponent) }
```

**Takeaway:** Standalone + `loadComponent` = minimal boilerplate.

---

## 30) **Security in Angular**

**Context:** Finance apps must be secure.

**Answer:**

- Angular auto-sanitizes HTML, styles, URLs.
- Use `DomSanitizer.bypassSecurityTrustXxx` only if **trusted**.
- Protect against XSS, CSRF, clickjacking.

**Code:**

```html
<!-- Safe -->
<p>{{ userInput }}</p>

<!-- Dangerous -->
<div [innerHTML]="userInput"></div>
```

**Takeaway:** Angular is secure by default; **never bypass sanitization** carelessly.

# 🅰️ Angular — Detailed Interview Q&A (31–40)

## 31) **Folder structures**

**Context:** Enterprises need scalable project structures.

**Answer:**

- **By feature** (recommended): each feature folder has its component, service, routing, tests.
- **By type** (bad): all components in `/components`, all services in `/services`. Gets messy at scale.

**Example structure:**

```
/src/app
  /rollovers
    rollover.component.ts
    rollover.service.ts
    rollover.routes.ts
  /users
    users.component.ts
    users.service.ts
  /shared
    pipes/
    directives/
    ui/
```

**Takeaway:** Organize **by feature** for scalability.

---

## 32) **ErrorHandler & logging**

**Context:** Enterprises need consistent error reporting (Sentry, Splunk).

**Answer:**

- Override Angular’s `ErrorHandler` for global capture.
- Send logs to a remote system (Splunk/Sentry).

**Code:**

```ts
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any) {
    console.error("Error captured:", error);
    // send to Splunk/Sentry
  }
}

@NgModule({
  providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }],
})
export class AppModule {}
```

**Takeaway:** Always centralize error handling + monitoring.

---

## 33) **Interceptor chaining**

**Context:** Complex apps often need multiple interceptors.

**Answer:**  
Interceptors run in **order of declaration**. Use them for auth, caching, retry, logging.

**Code:**

```ts
@NgModule({
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  ],
})
export class AppModule {}
```

**Takeaway:** Order matters; `multi: true` allows chaining.

---

## 34) **Unit testing components**

**Context:** Interviewers want to see testing habits.

**Answer:**

- Use `TestBed` + `ComponentFixture` for components.
- Mock HttpClient with `HttpTestingController`.

**Code:**

```ts
it("renders user list", () => {
  const fixture = TestBed.createComponent(UserListComponent);
  fixture.componentInstance.users = [{ id: 1, name: "Alice" }];
  fixture.detectChanges();
  expect(fixture.nativeElement.textContent).toContain("Alice");
});
```

**Takeaway:** Keep logic in services → components stay easy to test.

---

## 35) **Harnesses for Angular Material**

**Context:** Material is common in enterprise; brittle DOM selectors are bad.

**Answer:**

- Angular Material provides **ComponentHarness** APIs for testing.

**Code:**

```ts
const loader = TestbedHarnessEnvironment.loader(fixture);
const button = await loader.getHarness(MatButtonHarness.with({ text: "Save" }));
await button.click();
```

**Takeaway:** Use harnesses for stable Material tests.

---

## 36) **E2E testing strategies**

**Context:** End-to-end tests simulate real user flows.

**Answer:**

- Use **Cypress** or **Playwright**.
- Test **critical paths** (login, checkout), not every detail.

**Code (Cypress):**

```js
it("logs in", () => {
  cy.visit("/login");
  cy.get("input[name=email]").type("test@test.com");
  cy.get("input[name=password]").type("123456");
  cy.get("button[type=submit]").click();
  cy.url().should("include", "/dashboard");
});
```

**Takeaway:** E2E = smoke test for critical flows, not full coverage.

---

## 37) **Performance profiling**

**Context:** Lead devs must know how to measure before optimizing.

**Answer:**

- **Angular DevTools**: see CD cycles, component tree.
- **Lighthouse**: measure FCP, LCP, TTI.
- Optimize by reducing CD triggers, using OnPush, caching API calls.

**Takeaway:** Use **tools before guessing** performance fixes.

---

## 38) **Custom build & envs**

**Context:** Enterprises deploy to multiple environments.

**Answer:**

- Angular uses `environment.ts` files, but better to inject runtime config (fetch JSON before bootstrap).

**Code:**

```ts
// main.ts
fetch("/assets/config.json")
  .then((r) => r.json())
  .then((cfg) =>
    bootstrapApplication(AppComponent, {
      providers: [{ provide: APP_CONFIG, useValue: cfg }],
    })
  );
```

**Takeaway:** Use **runtime configs** → no rebuild for each environment.

---

## 39) **Migration strategies**

**Context:** Projects evolve; how to modernize safely.

**Answer:**

- **Standalone migration**: move component by component (`standalone: true`).
- **RxJS migration**: use pipeable operators, `firstValueFrom` instead of `toPromise`.
- **Angular upgrade**: follow official `ng update` schematics.

**Takeaway:** Migrate **incrementally**, not all at once.

---

## 40) **Enterprise best practices**

**Context:** Final lead-level question — how you’d run a project.

**Answer:**

- Strict TypeScript (`"strict": true`)
- Lint rules (ESLint, custom rules for imports)
- CI/CD with automated builds, tests, linting
- Code reviews & PR templates
- Accessibility & i18n mandatory
- Shared UI libs for consistency

**Takeaway:** Angular success in enterprise = **discipline + standards**.
