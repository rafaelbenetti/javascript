# 🟦 TypeScript Interview Q&A (Extended)

---

## 1) Interface vs Type — when to use each?
**Context:** In Angular/Node projects, you’ll define DTOs and shared models. Knowing when to use `interface` or `type` shows you understand TypeScript’s flexibility.

**Answer:**  
- **Interface**: Best for object contracts that might be extended later. Interfaces support **declaration merging**, so multiple declarations with the same name merge into one. Great for public APIs or Angular services.  
- **Type**: More powerful for unions, intersections, mapped and conditional types. Unlike interfaces, they don’t merge but allow advanced compositions.

```ts
interface User { id: number }
interface User { name: string } // merges -> { id:number; name:string }

type Status = 'Pending' | 'Completed';
type ApiResult<T> = { ok:true; data:T } | { ok:false; error:string };
```

**Takeaway:** Use `interface` for contracts that may grow, `type` for advanced flexibility.

---

## 2) Structural typing — what is it?
**Context:** TypeScript is structurally typed, unlike Java/C#, which are nominal. This matters when backend and frontend share shapes.

**Answer:**  
If two types have the same shape, they’re compatible regardless of where they come from.

```ts
type Point = { x:number; y:number };
class Coord { constructor(public x:number, public y:number){} }
const p: Point = new Coord(1,2); // OK
```

**Takeaway:** It makes TS flexible, but can allow unintended assignments if shapes overlap accidentally.

---

## 3) any vs unknown vs never vs void
**Context:** These special types help you control safety and intent.

**Answer:**  
- **`any`**: Opts out of type checking. Avoid except as last resort.  
- **`unknown`**: A “safe any.” Must be narrowed before use. Great for external input.  
- **`never`**: Means “this should never happen.” Used for exhaustive checks.  
- **`void`**: A function doesn’t return anything.

```ts
function parse(x: unknown) {
  if (typeof x === 'string') return x.toUpperCase();
}
function fail(): never { throw new Error('Boom'); }
```

**Takeaway:** Avoid `any`, prefer `unknown`, use `never` for safety, `void` for no-return.

---

## 4) Type narrowing techniques
**Context:** When working with unions (`string | number`), you must narrow before use.

**Answer:**  
Use `typeof`, `instanceof`, `in`, or custom type guards.

```ts
type Rollover = { id:number; name:string };
function isRollover(x: unknown): x is Rollover {
  return typeof x === 'object' && !!x && 'id' in x;
}
```

**Takeaway:** Narrowing ensures type safety when working with flexible data.

---

## 5) Discriminated unions + exhaustiveness
**Context:** Perfect for modeling UI state in Angular (loading, success, error).

**Answer:**  
Use a literal discriminator and `switch` statements to enforce all cases are handled.

```ts
type Load =
  | { kind:'idle' }
  | { kind:'loading' }
  | { kind:'success'; data:string[] }
  | { kind:'error'; msg:string };

function render(s: Load) {
  switch (s.kind) {
    case 'success': return s.data.length;
    case 'error': return s.msg;
    default: return '...';
  }
}
```

**Takeaway:** Guarantees future states can’t be forgotten.

---

## 6) Union vs Intersection
**Context:** Common when designing models.

**Answer:**  
- **Union (`|`)**: value is A *or* B.  
- **Intersection (`&`)**: value must satisfy both A and B.

```ts
type U = { id:number } | { slug:string };
type I = { id:number } & { slug:string };
```

**Takeaway:** Use unions for alternatives, intersections for combinations.

---

## 7) Generics & constraints
**Context:** Needed for reusable utilities and APIs.

**Answer:**  
Generics preserve type info. Constraints (`extends`) restrict what’s allowed.

```ts
function pluck<T, K extends keyof T>(obj:T, keys:K[]): T[K][] {
  return keys.map(k => obj[k]);
}
```

**Takeaway:** Generics provide flexibility and type safety across APIs.

---

## 8) Conditional types & infer
**Context:** Used heavily in Angular, RxJS, and libraries.

**Answer:**  
```ts
type ElementType<T> = T extends (infer U)[] ? U : T;
type ApiResponse<T> = T extends Error ? { ok:false; error:T } : { ok:true; data:T };
```

**Takeaway:** Enables advanced type transformations automatically.

---

## 9) Mapped & utility types
**Context:** Quickly derive variations of a type.

**Answer:**  
- Built-ins: `Partial`, `Required`, `Pick`, `Omit`, `Readonly`.  
- Custom mapped types:

```ts
type Flags<T> = { [K in keyof T as `is${Capitalize<string & K>}`]: boolean };
type F = Flags<{ active:boolean; admin:boolean }>; // isActive, isAdmin
```

**Takeaway:** Reduces boilerplate by auto-deriving new shapes.

---

## 10) as const, readonly, satisfies
**Context:** Prevents type widening and ensures precision.

**Answer:**  
```ts
const statuses = ['Pending','Completed'] as const;
type Status = typeof statuses[number]; // 'Pending' | 'Completed'

const user = { id: 1, name: 'Ana' } satisfies { id:number; name:string };
```

**Takeaway:** Use these to lock down literal values and avoid bugs.

---

## 11) Function overloads
**Context:** Useful for APIs behaving differently by input.

**Answer:**  
```ts
function get(x: number): string;
function get(x: string): number;
function get(x: number|string) {
  return typeof x === 'number' ? String(x) : x.length;
}
```

**Takeaway:** Overloads describe different call signatures while sharing one implementation.

---

## 12) Module augmentation
**Context:** Extend third-party libraries (JWT payloads, Express req).

**Answer:**  
```ts
declare module 'jsonwebtoken' {
  interface JwtPayload { sub: string; roles?: string[] }
}
```

**Takeaway:** Lets you safely extend library typings.

---

## 13) Runtime validation + inferred types
**Context:** External data is unsafe — validate at runtime but still get TS types.

**Answer:**  
```ts
import { z } from 'zod';
const Schema = z.object({ name: z.string(), amount: z.number() });
type DTO = z.infer<typeof Schema>;
```

**Takeaway:** Use Zod/Yup to validate + infer TS types → full safety.

---

## 14) Express request/response typing
**Context:** Important for Node BFFs when typing `req.body`.

**Answer:**  
```ts
app.post('/api', (req:Request<{}, {}, { name:string }>, res:Response) => {
  res.json({ id:1, name:req.body.name });
});
```

**Takeaway:** Use generics in `Request`/`Response` to type-safe APIs.

---

## 15) Angular HttpClient & forms
**Context:** Angular benefits from strong typing in HTTP + forms.

**Answer:**  
```ts
http.get<Rollover[]>('/api/rollovers').subscribe(items => ...);

const fb = inject(NonNullableFormBuilder);
const form = fb.group({ name:[''], amount:[0] });
```

**Takeaway:** Always use generics and typed forms for compile-time safety.

---

## 16) RxJS typing
**Context:** RxJS is everywhere in Angular. Mis-typed streams = runtime bugs.

**Answer:**  
```ts
const total$ = http.get<Rollover[]>('/api').pipe(
  map(list => list.length) // Observable<number>
);
```

**Takeaway:** Let generics flow through operators to avoid `any`.

---

## 17) Common pitfalls
**Context:** Shows maturity as a team lead.

**Answer:**  
- Overusing `any`.  
- Forgetting to validate external input.  
- Literal widening without `as const`.  
- Unsafe JSON parsing (always validate).

**Takeaway:** Avoid shortcuts that weaken type safety.

---

## 18) tsconfig must-haves
**Context:** Lead-level → you set team standards.

**Answer:**  
Enable `"strict": true` plus:  
- `noImplicitAny`  
- `strictNullChecks`  
- `noUncheckedIndexedAccess`  
- `exactOptionalPropertyTypes`

**Takeaway:** Strict configs catch bugs early and enforce quality.

---

## 19) Template literal types
**Context:** Useful for typed routes, event names, CSS class names.

**Answer:**  
```ts
const routes = { list:'/rollovers', detail:'/rollovers/:id' } as const;
type RouteKey = keyof typeof routes; // 'list' | 'detail'
```

**Takeaway:** Provides compile-time guarantees for string-based APIs.

---

## 20) Literal unions vs Enums
**Context:** Frequently asked — which is better for statuses/roles?

**Answer:**  
Prefer literal unions (`'Pending' | 'Completed'`) for lighter code and tree-shaking. Use Enums if you need runtime objects or reverse mapping.

```ts
type Status = 'Pending' | 'Completed'; // best
enum StatusEnum { Pending='Pending', Completed='Completed' }
```

**Takeaway:** Literal unions first, Enums only when runtime behavior is needed.

---
