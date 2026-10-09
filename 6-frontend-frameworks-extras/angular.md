# 🅰️ Angular Prep Guide

> Group 6 · Corrected version of the former `other/angular.md` · Priority LOW for this interview (the product stack is React + Spring; know Angular if they probe it, or for an Angular role)
> Legend: **✏️ FIXED** = corrected · **➕ ADDED** = new · unmarked = original
> Related: [rxjs.md](rxjs.md) · functional interceptor also in [jwt.md](../4-architecture-security/jwt.md)

## What was fixed (changelog)
1. **Build tooling.** ✏️ Tree-shaking is not "Webpack + Terser" anymore. Since v17 the default application builder bundles with **esbuild**, and `ng serve` uses **Vite**. Webpack (and Terser) is the legacy builder, deprecated in v22. **AOT has been the default since v9.** "Vite in v18+" was a version error.
2. **Standalone.** ✏️ Since **v19**, components, directives and pipes are standalone **by default**. `standalone: true` is redundant. `standalone: false` is how a declaration stays in an NgModule.
3. **Control flow.** ✏️ `*ngIf` / `*ngFor` / `*ngSwitch` are the legacy syntax. Built-in `@if` / `@for` / `@switch` have been stable since **v17**, need no `CommonModule`, and `@for` **requires** `track`. Migrate with `ng generate @angular/core:control-flow`.
4. **Interceptors and guards.** ✏️ The class `HttpInterceptor` that reads `localStorage` is the old pattern and a bad place to keep a token. Modern apps use a functional `HttpInterceptorFn` registered with `withInterceptors()`, and functional `CanActivateFn` / `ResolveFn` guards. Class interceptors still work, but only via `withInterceptorsFromDi()` + `HTTP_INTERCEPTORS`.
5. **Change detection.** ✏️ Since **v22**, omitting `changeDetection` means **OnPush**, not the old "check the whole tree" behavior. That old strategy is now named `ChangeDetectionStrategy.Eager` (`Default` remains an alias until v24). A raw `.subscribe()` that mutates a field does not refresh an OnPush view.
6. **Signals timeline.** ✏️ Signals were a **developer preview in v16**, not a finished API. `input` / `output` / `model` and signal queries are stable since v19. `effect`, `linkedSignal`, `toSignal` and `toObservable` are stable since **v20**.
7. **SSR.** ✏️ `ng add @nguniversal/express-engine` is obsolete. Since v17, SSR is `ng add @angular/ssr` plus `provideClientHydration()`. Incremental hydration is stable since v20.
8. **Zoneless.** ➕ Experimental in v18, developer preview in v20 (`provideZonelessChangeDetection()`, renamed from `provideExperimentalZonelessChangeDetection`), **stable in v20.2**, and the **default for new applications in v21**. New apps do not ship `zone.js`.
9. **v22 (June 2026, current major).** ➕ Signal Forms, `resource` / `httpResource`, and Angular Aria are stable. `@Service()` is the shorthand for a root singleton. OnPush is the default.
10. **`providedIn: 'any'`** ✏️ is deprecated. It meant one instance per lazy injector, which is rarely what you want.
11. **➕ Added** the 30-second summary, the version map, and traps. The "Vanguard" framing is an example of an enterprise that used Angular, not a claim about this role. **[confirm whether you have shipped Angular.]**

## ➕ Say it in 30 seconds
"Angular is a TypeScript framework: components, dependency injection, a router and forms, with RxJS for async streams. Modern Angular is standalone by default since v19, uses `@if` and `@for` instead of `*ngIf` and `*ngFor`, and keeps UI state in signals while HTTP stays an Observable, bridged with `toSignal`. Interceptors and guards are functions. Since v22, change detection is OnPush unless you opt into `Eager`, and since v21 new apps are zoneless, so `setTimeout` no longer triggers a refresh by itself. SSR is `@angular/ssr` with hydration, not the old Universal package. Signal Forms are the new forms API; `FormGroup` is still there. **[confirm if you have production Angular. This interview's stack is React.]**"

---

## Overview

### What is Angular?

Angular is a **TypeScript-based frontend framework** for building scalable, enterprise-grade web applications.  
It provides a full ecosystem: components, dependency injection, forms, routing, RxJS integration, testing tools, and build tooling.

### Why Angular for a large product? ✏️

✏️ The original heading said "like Vanguard". Angular is a common choice for large typed front ends. The stack for **this** interview is React + Spring ([react.md](../2-react-frontend/react.md)). **[confirm if you have shipped Angular, and where.]**

- **Strong typing** (TypeScript) → safer, maintainable code.
- **Scalability** → ✏️ standalone components (NgModules are legacy), DI, NgRx when you actually need a global store.
- **Performance** → ✏️ OnPush is the default since v22, plus signals, lazy loading, AOT, tree-shaking.
- **Ecosystem** → i18n, a11y, ✏️ SSR via `@angular/ssr` (Angular Universal as a separate package is gone).
- **Community & support** → large adoption in enterprises, a major about every six months. ➕ Current major: **Angular 22** (June 2026).

### Core Building Blocks

- **Components** → UI units with templates + logic.
- **Directives** → extend HTML. ✏️ New code uses built-in `@if` / `@for` / `@switch`. `*ngIf` / `*ngFor` are the legacy structural directives. Custom attribute and structural directives still exist.
- **Pipes** → transform data in templates.
- **Services** → singleton logic, injected. ➕ v22 adds `@Service()` as the shorthand for `@Injectable({ providedIn: 'root' })`.
- **Dependency Injection** → hierarchical, flexible.
- **Routing** → client-side navigation, guards, resolvers, lazy load.
- **Forms** → ✏️ template-driven, reactive (`FormGroup`), and ➕ **Signal Forms** (stable in v22).
- **RxJS & Signals** → async streams + synchronous reactivity. See [rxjs.md](rxjs.md).

## What is tree-shaking in Angular

- Tree-shaking is dead-code elimination during the build. The compiler looks at your imports and the application graph and drops functions, classes and modules that nothing reachable uses.
- ✏️ **FIXED:** the original said this happens "through Webpack + Terser". Since **Angular 17** the default **application builder** bundles with **esbuild** (minification included) and the dev server is **Vite**. The Webpack builder, which did use Terser, is legacy and **deprecated in v22**. Tree-shaking still depends on real ESM `import`s. Side-effectful files and `providedIn` services that are injected somewhere are kept.

---

# 🅰️ Angular — Detailed Interview Q&A

---

## 1) Standalone components vs NgModules

**Context:** Since Angular v14, standalone APIs are encouraged, but many projects still have NgModules. Interviewers want to see if you know both.

**Answer:**

- **Standalone components**: don’t need an NgModule. They declare their own `imports` (other components, directives, pipes) and can be bootstrapped directly. This reduces boilerplate and improves tree-shaking.
- **NgModules**: group components, directives, and services into logical units. Still valid, often used in older projects or when grouping multiple features together.
- ✏️ **FIXED (v19):** standalone is now the **default**. You do not write `standalone: true`. A component that must be declared in an NgModule sets `standalone: false`. `ng update` to v19 adds that flag for you and strips the redundant `standalone: true`. Importing `CommonModule` just to get `*ngIf` is the old habit. Built-in `@if` / `@for` need no import.

**Code:**

```ts
// main.ts (bootstrap a standalone app)
bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes), provideHttpClient()],
});

// app.component.ts — ✏️ no standalone: true since v19
@Component({
  selector: "app-root",
  imports: [],
  template: `<h1>Hello Angular!</h1>`,
})
export class AppComponent {}
```

**Takeaway:** Standalone is the default since v19. NgModules are for legacy code, not for new features.

---

## 2) Change detection strategies

**Context:** Change detection is crucial for performance. Default strategy can cause unnecessary re-renders.

**Answer:**

- **Default / Eager**: Angular checks the component whenever change detection reaches it, even if nothing it uses changed.
- **OnPush**: Angular skips the subtree unless it has a reason to check:
  - An input binding changed (`==`, not a deep compare, so a mutated object with the same reference does not count)
  - An event was handled in that component or one of its descendants
  - The view was marked, which is what the `async` pipe, `markForCheck()`, and a **signal read in the template** do
- ✏️ **FIXED:** "an observable used in the template emits" is only true if that observable is consumed by the `async` pipe (or you mark the view yourself). A `.subscribe()` that writes a plain field does **not** refresh an OnPush component. ➕ **Since v22, OnPush is what you get when `changeDetection` is omitted.** The old always-check strategy is `ChangeDetectionStrategy.Eager`. `ChangeDetectionStrategy.Default` is the old name and stays as an alias until v24. `ng update` adds `Eager` where a component relied on the old default.

**Code:**

```ts
@Component({
  selector: "user-list",
  template: `
    @for (u of (users$ | async) ?? []; track u.id) {
      <li>{{ u.name }}</li>
    }
  `,
  // ✏️ changeDetection can be omitted on v22 (OnPush is the default).
  // Set OnPush explicitly on v17–v21. Set Eager only if you depend on the old behavior.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {
  private service = inject(UserService);
  users$ = this.service.getUsers();
}
```

**Takeaway:** OnPush (default since v22) plus the `async` pipe or a signal. The original sample set `standalone: true` and imported `CommonModule` for `*ngFor`. Neither is needed for this template anymore.

---

## 3) Signals vs RxJS

**Context:** Angular introduced **signals** as a developer preview in v16. Many projects still use RxJS. You’ll likely be asked to compare.

**Answer:**

- **Signals**: _pull-based_, synchronous, great for local component state. Think of them as “reactive variables.” Reading `count()` both gets the value and tracks the dependency.
- **RxJS Observables**: _push-based_, asynchronous, powerful for handling streams like HTTP, user input, or websockets. Nothing happens until `subscribe`.
- ✏️ **FIXED timeline:** do not say "signals have been stable since v16". `signal` and `computed` came first. `input()`, `output()`, `model()` and signal queries are stable since **v19**. `effect`, `linkedSignal`, `toSignal` and `toObservable` are stable since **v20**. `resource` and `httpResource` (async work that exposes a signal) are stable since **v22**.

They complement each other. Use signals for UI state, RxJS for streams and side effects. Derive state with `computed`, not `effect`.

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

**Takeaway:** Use **reactive forms** for complex, testable apps on Angular ≤ 21. ➕ **Signal Forms** (stable in v22, `@angular/forms/signals`) are the new API: the model is a writable signal, `form()` builds a field tree, and the template binds with `[formField]`. `FormGroup` was not removed.

```ts
import { Component, signal } from "@angular/core";
import { form, FormField } from "@angular/forms/signals";

@Component({
  selector: "app-login",
  imports: [FormField],
  template: `<input type="email" [formField]="loginForm.email" />`,
})
export class LoginComponent {
  loginModel = signal({ email: "", password: "" });
  loginForm = form(this.loginModel); // schema callback (2nd arg) adds validation
}
```

---

## 5) HttpClient & interceptors

**Context:** Every app calls APIs. Employers want to see if you centralize logic.

**Answer:**

- Always **type** your responses.
- Use **interceptors** for authentication, logging, retry, and error handling.
- Don’t scatter headers or error handling in components.
- ✏️ **FIXED:** write a **functional** interceptor (`HttpInterceptorFn`) and register it with `withInterceptors([...])`. That function only accepts functions. A class `HttpInterceptor` registered there does not run. The original sample also read the token from `localStorage`, which any XSS can steal. Keep the access token in memory, or use an HttpOnly cookie and don't attach a header at all. Same fix as [jwt.md](../4-architecture-security/jwt.md).

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

// ✏️ functional interceptor (current)
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStore).accessToken(); // in-memory, not localStorage
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq).pipe(
    catchError((err) => {
      console.error("API error", err);
      return throwError(() => err);
    })
  );
};

// main.ts
provideHttpClient(withInterceptors([authInterceptor]));

// ✏️ class interceptor, only if you still have one:
// provideHttpClient(withInterceptorsFromDi()),
// { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

**Takeaway:** Keep API logic in **services + interceptors**, not components. Functions are the current interceptor shape.

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

- **Parent → Child**: `@Input()`, or ➕ the signal `input()` / `input.required()` (stable since v19)
- **Child → Parent**: `@Output()` EventEmitter, or ➕ `output()`
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

- `providedIn: 'root'` → singleton across app. ➕ In v22, `@Service()` is the shorthand for this common case. `@Injectable` stays for anything that needs a `useFactory`, a scope, or constructor injection you want to spell out.
- ✏️ `providedIn: 'any'` → **deprecated**. It created a new instance in each lazy-loaded injector, which surprised people. Prefer `root`, a route `providers` array, or the component `providers`.
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

- CLI scaffolds code and builds with the application builder.
- AOT (Ahead-of-Time) compiles templates at build time. ✏️ **AOT has been the default since Angular 9.** JIT is the exception (`@angular/compiler` in the browser), not what `ng build` does.
- Tree-shaking removes unused code.
- ✏️ **FIXED:** Vite is the **dev server since v17**, not "v18+". Production bundling is **esbuild** via the application builder. Webpack is legacy and deprecated in v22.

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

- ✏️ OnPush (the default since v22; set it explicitly only on older versions)
- ✏️ `@for` with `track`, which is required. `trackBy` on `*ngFor` is the legacy form of the same idea: identity so DOM nodes are reused
- Lazy load routes
- Use pure pipes for caching
- Break big components into smaller ones
- ➕ `NgOptimizedImage` (`ngSrc`) for LCP images, and `@defer` for below-the-fold blocks

**Code:**

```html
<!-- ✏️ current -->
@for (item of items; track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>None</li>
}

<!-- legacy, still compiles -->
<li *ngFor="let item of items; trackBy: trackId">{{ item.name }}</li>
```

```ts
trackId = (_: number, item: Item) => item.id;
```

**Takeaway:** The big wins are **OnPush + a stable `track` key + loading less code**. `track item` (the object) misses the point: a new array of equal rows still destroys the DOM.

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
# ✏️ FIXED: @nguniversal/express-engine is the pre-v17 package. Don't add it.
ng add @angular/ssr
```

```ts
// app.config.ts — hydration attaches listeners to the server HTML
// instead of re-creating the DOM. withEventReplay() covers events that
// happened before the client bootstrapped (stable since v18).
provideClientHydration(withEventReplay());
```

**Takeaway:** Use SSR + hydration for pages that must be crawlable or paint fast. ➕ Incremental hydration (stable in v20) hydrates `@defer` blocks as they become visible, instead of hydrating the whole page at once. Don't claim "Angular Universal" as a separate product.

---

## 24) **Preloading strategies**

**Context:** Optimize lazy loading for UX.

**Answer:**

- **NoPreloading** (default): load on demand.
- **PreloadAllModules**: load everything after bootstrap.
- **Custom strategy**: preload only flagged routes.

**Code:**

```ts
// ✏️ NgModule style, legacy:
// RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules });

// current, in bootstrapApplication providers:
provideRouter(routes, withPreloading(PreloadAllModules));
```

**Takeaway:** Use **PreloadAllModules** if bandwidth allows; a custom `PreloadingStrategy` for fine control. Preloading happens after the initial navigation, so it does not slow first paint.

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

**Takeaway:** Guards = **access control**, Resolvers = **data prefetch**. ✏️ These function types (`CanActivateFn`, `ResolveFn`) are the current API. The class interfaces (`implements CanActivate`) are the legacy form. A guard that only redirects, and a resolver that only loads data the page could have loaded itself, are both overhead. Prefer loading in the component with a signal or `httpResource` unless the data must exist before the route activates.

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
  /listings          # ✏️ example name only. The original said "rollovers" (a Vanguard domain). The point is the feature folder.
    listing.component.ts
    listing.service.ts
    listing.routes.ts
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

// ✏️ standalone bootstrap, not an NgModule
bootstrapApplication(AppComponent, {
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideBrowserGlobalErrorListeners(), // ➕ v20: window error + unhandledrejection
  ],
});
```

**Takeaway:** Always centralize error handling + monitoring. The NgModule `providers` array still works in a legacy app. The registration site in a modern app is `bootstrapApplication`.

---

## 33) **Interceptor chaining**

**Context:** Complex apps often need multiple interceptors.

**Answer:**  
Interceptors run in **order of registration**. The first one sees the outgoing request first and the response last (they nest). Use them for auth, caching, retry, logging.

**Code:**

```ts
// ✏️ current: array order is the chain
provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor]));

// legacy class chain (multi: true is required or only the last provider survives)
// { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
// { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
```

**Takeaway:** Order matters. `multi: true` is the class-based way to chain. Forgetting it silently drops every interceptor except the last.

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

- ✏️ **Standalone:** `ng update` to v19 flips the default. New components are standalone without a flag. Existing NgModule components get `standalone: false`. The old "add `standalone: true` one file at a time" advice is the pre-v19 migration.
- **RxJS:** pipeable operators, and `firstValueFrom` / `lastValueFrom` instead of `toPromise` (deprecated in RxJS 7). Details in [rxjs.md](rxjs.md).
- **Control flow:** `ng generate @angular/core:control-flow`.
- **Angular upgrade:** follow official `ng update` schematics, one major at a time. Don't skip majors.

**Takeaway:** Migrate **incrementally**, not all at once. `ng update` is the migration. Hand-editing every decorator is how flags get missed.

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

---

# ➕ Angular — what changed after these notes were written

The 40 questions above are the original set, corrected in place. These four cover the gaps an interviewer actually asks in 2026.

## 41) Built-in control flow (`@if`, `@for`, `@switch`)

**Answer:** Stable since Angular 17. It is template syntax, not a directive you import, so `CommonModule` is unnecessary. `@for` refuses to compile without `track`. The track expression should be a stable id.

```html
@if (user(); as u) {
  <p>{{ u.name }}</p>
} @else {
  <p>Signed out</p>
}

@for (item of items(); track item.id; let i = $index) {
  <li>{{ i + 1 }}. {{ item.name }}</li>
} @empty {
  <li>Nothing here</li>
}

@switch (status()) {
  @case ("open") { <span>Open</span> }
  @case ("closed") { <span>Closed</span> }
  @default { <span>Unknown</span> }
}
```

`$index`, `$first`, `$last`, `$even`, `$odd` and `$count` replace `index as i` on `*ngFor`. `@empty` replaces an extra `*ngIf` around the list. `@defer (on viewport)` lazy-loads a block of the template.

**Takeaway:** New templates use `@if` / `@for`. `*ngIf` still compiles. Don't mix a lecture that presents `*ngFor` as the current API.

## 42) Zoneless change detection

**Answer:** Zone.js patches async APIs (`setTimeout`, promises, DOM events) so Angular knows to run change detection. That patching is global, it costs bundle size, and it makes stack traces worse. Zoneless apps schedule change detection from explicit notifications instead: signal writes, template events, the `async` pipe, `markForCheck()`.

| Version | Status |
|---|---|
| v18 | Experimental: `provideExperimentalZonelessChangeDetection()` |
| v20 | Developer preview: renamed to `provideZonelessChangeDetection()` |
| v20.2 | Stable |
| v21+ | **Default for new apps.** `zone.js` is not in the polyfills. Don't also call `provideZoneChangeDetection()` or you turn Zone back on. |

```ts
// v20, opting in. v21+ new apps: omit this, it is already the default.
bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection(), provideBrowserGlobalErrorListeners()],
});
```

**Takeaway:** After zoneless, "I updated a field inside `subscribe` / `setTimeout` and the view will refresh" is false unless that update writes a signal or marks the view. `NgZone.run` still works and is not something you must delete. `NgZone.onStable` / `isStable` do not mean what they used to: `isStable` stays true.

## 43) Version map you should be able to say

- **v14–15:** standalone developer preview then stable. Functional guards. Typed reactive forms. Functional interceptors (`HttpInterceptorFn`).
- **v16:** signals developer preview. `takeUntilDestroyed` introduced (stable in v19, from `@angular/core/rxjs-interop`).
- **v17:** new control flow and `@defer` stable. esbuild + Vite dev server is the default builder. `ng add @angular/ssr`. New docs site.
- **v18:** zoneless experimental. Event replay for hydration (`withEventReplay`).
- **v19 (Nov 2024):** standalone **default**. `input` / `output` / `model` and signal queries stable. Experimental `resource` / `rxResource`. `linkedSignal` introduced.
- **v20 (May 2025):** `effect`, `linkedSignal`, `toSignal`, `toObservable` stable. Zoneless enters developer preview. Incremental hydration stable. `httpResource` introduced.
- **v20.2:** zoneless stable.
- **v21 (Nov 2025):** new apps are zoneless and do not include `zone.js`. Signal Forms launched (not stable yet).
- **v22 (June 2026):** OnPush is the default (`Eager` keeps the old behavior). Signal Forms, `resource`, `httpResource` and Angular Aria are stable. `@Service()` for root singletons. Webpack application builder deprecated.

**Takeaway:** If you remember one sentence: standalone by default, signals for state, `@if`/`@for` in templates, functions for guards and interceptors, zoneless OnPush for new apps.

## 44) `httpResource` vs `HttpClient` vs `toSignal`

**Answer:** Three legal ways to load data. Pick on purpose.

- `HttpClient.get` returns an Observable. Best when you need operators (`switchMap`, retry, polling) or you are already inside RxJS (an effect, a guard).
- `toSignal(http.get(...))` subscribes immediately and exposes a signal. Fine for a one-shot read. It does not re-fetch when an argument signal changes unless you build that yourself.
- `httpResource` (stable in v22) re-fetches when the signals you read inside its URL function change, and gives you `value()`, `isLoading()`, `error()`, `hasValue()`.

```ts
import { httpResource } from "@angular/common/http";

selectedId = signal(1);
// Re-fetches when selectedId changes and cancels the request still in flight.
// Not for POST/PUT. Mutations stay on HttpClient.
listing = httpResource<Listing>(() => `/api/listings/${this.selectedId()}`);
```

`resource({ params, loader })` is the same shape when the loader is a Promise rather than HTTP. `rxResource` is the variant whose loader returns an Observable. Without `defaultValue`, `value()` is `T | undefined` until the response arrives. `hasValue()` is the check.

**Takeaway:** Don't describe `HttpClient` as obsolete. Describe `httpResource` as the signal-shaped fetch.

---

# ➕ Traps and gotchas

- `withInterceptors([AuthInterceptorClass])` does nothing useful. That array is functions only. Class interceptors need `withInterceptorsFromDi()` and `HTTP_INTERCEPTORS` with `multi: true`.
- A bearer token in `localStorage` or `sessionStorage` is readable by any XSS. Memory, or an HttpOnly cookie. See [storage-security.md](../4-architecture-security/storage-security.md).
- Forgetting `track` is a compile error. Tracking the object identity (`track item`) recreates every row when the array is replaced.
- Mutating `this.users.push(...)` under OnPush, or inside a zoneless app, does not refresh the view. Replace the array, or write a signal.
- Since v22, a component with no `changeDetection` is OnPush. Code that depended on Default will look "stuck" after `ng update` if the migration to `Eager` was skipped.
- Declaring a component in an NgModule without `standalone: false` fails, because standalone is the default. The error is "is standalone, and cannot be declared in an NgModule".
- `effect()` to copy one signal into another. That is `computed` or `linkedSignal`. `effect` is for side effects you can justify.
- `toSignal(obs$)` without `initialValue` has type `T | undefined` until the first emit, and an erroring observable throws when the signal is read.
- `ng add @nguniversal/express-engine`, `providedIn: 'any'`, and "Vite arrived in v18" are all out of date. See the changelog at the top.
- Zone.js and zoneless in the same answer without saying which version. New apps since v21 are zoneless. A long-lived enterprise app may still be on Zone until someone migrates it.
