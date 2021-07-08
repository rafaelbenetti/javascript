# Testing
 - Unit Tests
 - Integration Tests
 - Regression Tests
 - Stress Tests

## Unit Tests
- It focuses on the smallest unit of software design.

## Integration Tests
- Its focuses on the groups of components that makes one feature or product. 

## Regression Tests
- This type of testing makes sure that the whole component works properly even after adding components to the complete program. 

## Stress Tests
- In this, we give unfavorable conditions to the system and check how they perform in those conditions. 

# Angular Testing
 - Isolated Tests
 - Shallow Tests
 - Integration Tests

## Isolated Tests
- No rendering
- Same as any other JS object test
- Mock all dependencies
- Test a (pipe, component class, service)

```js
import { EmployeeItemComponent } from './employee-item.component';

describe('EmployeeItemComponent (isolated)', () => {
  const component = new EmployeeItemComponent();

  it('should EMIT delete for an employee', () => {
    spyOn(component.delete, 'emit');
    component.onDelete();
    expect(component.delete.emit).toHaveBeenCalled();
  });
});
```

## Shallow Tests
- +Isolated Test
- Render template
- Without children

```js
it('should show all employee properties', () => {
  const el = fixture.nativeElement;

  const name = el.querySelector('.name').innerHTML;
  expect(name).toContain(employee.name);
});
```

## Integration Tests
- Render children
- Only mock browser capabilities
- Check correctness

```js
it('should make a DELETE request on TODOS', () => {
  const details = el.query(By.directive(TodoItemComponent));
  const button = details.nativeElement.querySelector('button');
  button.dispatchEvent(new Event('click'));

  const requestDefault = httpTestingController.expectOne(url);
  requestDefault.flush(items);

  expect(requestDefault.request.method).toBe('GET');

  // Expect one delete from UserDetailsComponent
  const request = httpTestingController.expectOne(`${url}/${items[0]._id}`);
  request.flush({});

  expect(request.request.method).toBe('DELETE');
  httpTestingController.verify();
});
```
# CI/CD

## Continous Intergration
- Developers practicing continuous integration merge their changes back to the main branch as often as possible. The developer's changes are validated by creating a build and running automated tests against the build. By doing so, you avoid integration challenges that can happen when waiting for release day to merge changes into the release branch.

- Continuous integration puts a great emphasis on testing automation to check that the application is not broken whenever new commits are integrated into the main branch.

## Continuous Delivery
- Continuous delivery is an extension of continuous integration since it automatically deploys all code changes to a testing and/or production environment after the build stage. 

- This means that on top of automated testing, you have an automated release process and you can deploy your application any time by clicking a button.

# Angular

## Interceptors
- Interceptors are a unique type of Angular Service that we can implement. Interceptors allow us to intercept incoming or outgoing HTTP requests using the HttpClient. By intercepting the HTTP request, we can modify or change the value of the request.
  - Handling HTTP Headers
  - HTTP Response Formatting
  - HTTP Error Handling

```js 
@Injectable()
export class MyInterceptor implements HttpInterceptor {
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(httpRequest);
  }
}

@NgModule({
  imports: [BrowserModule, HttpClientModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: MyInterceptor, multi: true }
  ]
})
export class AppModule { }
```

## Zones
- Are a sort of execution context that allows us to hook into our asynchronous tasks.
- It turns out that, the problem that Zones solve, plays very nicely with what Angular needs in order to perform change detection in our applications
- Application state change is caused by three things:
 - Events - User events like click, change, input, submit, …
 - XMLHttpRequests - E.g. when fetching data from a remote service
 - Timers - setTimeout(), setInterval(), because JavaScript

## NgZone in Angular
- NgZone is basically a forked zone that extends its API and adds some additional functionality to its execution context.

- ChangeDetect runs every time `onTurnDone()` is called.

  - `onTurnStart()` - Notifies subscribers just before Angular’s event turn starts. Emits an event once per browser task that is handled by Angular.
  - `onTurnDone()` - Notifies subscribers immediately after Angular’s zone is done processing the current turn and any micro tasks scheduled from that turn.
  - `onEventDone()` - Notifies subscribers immediately after the final onTurnDone() callback before ending VM event. Useful for testing to validate application state.

## OutsideZone
```js
processOutsideAngularZone() {
  this.progress = 0;
  this.zone.runOutsideAngular(() => {
    this.increaseProgress(() => {
      this.zone.run(() => {
        console.log('Outside Done!');
      });
    });
  });
}
```

- https://blog.thoughtram.io/angular/2016/02/01/zones-in-angular-2.html

## Change Detection Strategy
- Angular Change Detection Strategy are the methods by which the updates to the component is tracked and component is triggered to Re-render

## Default Change Detection Strategy
- Change detection cycle runs of each and every event that occur inside the Component.
- Click Event of Elements, Receiving Data via Asynchronous Call, Triggering setTimeout and setInterval

- [Cons] Every time a parent component gots re-rendered, the ChildComponent life Cycle is also triggered to re-render even if no inputs/outputs between both.

## onPush Change Detection Strategy
- The ChildComponent is not always dirty checked, if the parent element is updating the values that are not passed as “@Input” properties to the Child Component, then the child Component should not be dirty checked.

- [Pros] No Unnecessary Dirty Check in the Child Components
- [Pros] Faster Component Re-rendering
- [Pros] Listen for changes on @Input() and pipe `async` on the template

- [Cons] Works only for immutable objects, since Angular looks for a change on the reference in the @Input()
- [Cons] For specific scenarios, need to run `componentRef.markForCheck()`

## Lifecycle
- `constructor`
- `ngOnChanges()`
- `ngOnInit()` 
- `ngDoCheck()`
- `ngAfterContentInit()`
- `ngAfterContentChecked()`
- `ngAfterViewInit()`
- `ngAfterViewChecked()`
- `ngOnDestroy()`

### Types of test coverage
- Test coverage is defined as a metric in Software Testing that measures the amount of testing performed by a set of test. It will include gathering information about which parts of a program are executed when running the test suite to determine which branches of conditional statements have been taken.

- In simple terms, it is a technique to ensure that your tests are testing your code or how much of your code you exercised by running the test.

- [Pros] Validates the quality of your tests
- [Pros] It can help to determine the paths in your application that were not tested
Prevent Defect leakage
- [Pros] Defect prevention at an early stage of the project lifecycle

- [Cons] Most of the tasks in the test coverage manual as there are no tools to automate. Therefore, it takes lots of effort to analyze the requirements and create test cases.

## Code Coverage
- Code coverage metrics can help the team monitor their automated tests.

## Test Coverage
- Test coverage means overall test-plan.
- Test coverage is given details about the level to which the written coding of an application has been tested.

# AOT and JIT Compiler

## AOT
- It's a process of compiling higher-level language or intermediate language into a native machine code. When you serve/build your angular application, the Ahead of Time compiler converts your code during the build time before your browser downloads and runs that code.

- [Pros] Loading in AOT is much quicker than the JIT because it already has compiled your code at build time.
- [Pros] AOT is much suitable in the case of Production mode.
- [Pros] AOT provides a big benefit to angular developers for production mode by reducing bundle size and making your app render faster
## JIT
- Just in time compiler provides compilation during the execution of the program at a run time before execution. In simple words, code get compiles when it’s needed, not at the build time.

- [Pros] Most compiling is done on the browser side, so it will take less compiling time.
- [Pros] JIT is more suitable for development mode.
- [Pros] Implementing features and debugging is easy in JIT mode since you have to map files.

# Coding
- Array flat function implementation

```js
function convertToFlat(array) {
  return [].concat(...array.map(item => Array.isArray(item) ? convertToFlat(item) : item));
}

const numbers = [1, 2, 3, [4, 5]];
convertToFlat(numbers);
```

```js
const numbers = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]];
numbers.flat(Infinity);
```

- Variable scope/var-let understanding task

```js
// old way
function () {
  var i = 10;
}

// es5
{
  let i = 10;
}
```
