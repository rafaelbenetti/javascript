# Angular 2+

* [Overview](#overview)
    * [Decorators](#decorators)
    * [Modules](#modules)
    * [Libraries](#libraries)
    * [Components](#components)
    * [Templates](#templates)
    * [Metadata](#metadata)
    * [Data Binding](#data-binding)
    * [Directives](#directives)
    * [Services](#services)
    * [Dependency Injection](#depency-injection) 

## Overview
- Angular 2 is a platform not only a language.
- Better Speed and Performance: No $Scope.
- Simpler Dependency Injection.
- Modular, cross platform.
- Benefits of ES6 and Typescript.
- Easier to Learn.

## Decorators
- Decorators are functions that modify JavaScript classes. 
- Angular has many decorators that attach metadata to classes.
- It knows what those classes mean and how they should work.
- Examples:
    1) @NgModule
    2) @Component
    3) @Service

## Modules
- Angular apps are modular and Angular has its own modularity system called NgModules.
- Every Angular app has at least one NgModule class, the root module, conventionally named AppModule.
- While the root module may be the only module in a small application, most apps have many more feature modules.
- An NgModule, whether a root or feature, is a class with an @NgModule decorator.

    1) declarations - the view classes that belong to this module. Angular has three kinds of view classes: components, directives, and pipes.
    2) exports - the subset of declarations that should be visible and usable in the component templates of other modules.
    3) imports - other modules whose exported classes are needed by component templates declared in this module.
    4) providers - creators of services that this module contributes to the global collection of services; they become accessible in all parts of the app.
    5) bootstrap - the main application view, called the root component, that hosts all other app views. Only the root module should set this bootstrap property.

```js
// Simple root module
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
@NgModule({
  imports:      [ BrowserModule ],
  providers:    [ Logger ],
  declarations: [ AppComponent ],
  exports:      [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
```

## Libraries
- Angular ships as a collection of JavaScript modules. You can think of them as library modules.
- Each Angular library name begins with the @angular prefix.
- You install them with the npm package manager and import parts of them with JavaScript import statements.

```js
import { Component } from '@angular/core';
```

## Components
- A component controls a patch of screen called a view.
- You define a component's application logic—what it does to support the view—inside a class.

```js
export class HeroListComponent implements OnInit {
  heroes: Hero[];

  constructor(private service: HeroService) { }

  ngOnInit() {
    this.heroes = this.service.getHeroes();
  }
}
```

## Templates
-  A template is a form of HTML that tells Angular how to render the component.
-  A template has some angular template syntax. *ngFor {{}}

```html
<ul>
  <li *ngFor="let hero of heroes" (click)="selectHero(hero)">
    {{hero.name}}
  </li>
</ul>
```

## Metadata
- Metadata tells Angular how to process a class.

```js
@Component({
  selector:    'app-hero-list',
  templateUrl: './hero-list.component.html',
  providers:  [ HeroService ]
})
export class HeroListComponent implements OnInit {
/* METADATA */
}
```

## Data Binding
- There are four forms of data binding syntax. 

```html
<li>{{hero.name}}</li>
<app-hero-detail [hero]="selectedHero"></app-hero-detail>
<li (click)="selectHero(hero)"></li>
```
- Each form has a direction — to the DOM, from the DOM, or in both directions.
    1) The {{hero.name}} interpolation displays the component's hero.name property value within the li element.
    2) The [hero] property binding passes the value of selectedHero from the parent HeroListComponent to the hero property of the child HeroDetailComponent.
    3) The (click) event binding calls the component's selectHero method when the user clicks a hero's name.

## Directives
- Two other kinds of directives exist: structural and attribute directives.
- Attribute directives alter the appearance or behavior of an existing element. 
- In templates they look like regular HTML attributes, hence the name.
```html
<li *ngFor="let hero of heroes"></li>
<app-hero-detail *ngIf="selectedHero"></app-hero-detail>
```
- Structural directives alter layout by adding, removing, and replacing elements in DOM.
- The example template uses two built-in structural directives:

## Services
- Service is a broad category encompassing any value, function, or feature that your application needs.
- Almost anything can be a service. A service is typically a class with a narrow, well-defined purpose. 
- It should do something specific and do it well. 

- Examples include:
    1) logging service
    2) data service
    3) application configuration

```js
export class Logger {
  log(msg: any)   { console.log(msg); }
  error(msg: any) { console.error(msg); }
  warn(msg: any)  { console.warn(msg); }
}
```

## Dependency Injection
- It's a way to supply a new instance of a class with dependencies it requires. 
- Most dependencies are services. 
- Angular uses dependency injection to provide new components with the services they need.

```js
constructor(private service: HeroService) { }
```

## To learn next
- Here is a brief, alphabetical list of other important Angular features and services. Most of them are covered in this documentation (or soon will be).

**Animations**: 
 - Animate component behavior without deep knowledge of animation techniques or CSS with Angular's animation library.

**Change detection**: 
 - The change detection documentation will cover how Angular decides that a component property value has changed, when to update the screen, and how it uses zones to intercept asynchronous activity and run its change detection strategies.

**Events**: 
 - The events documentation will cover how to use components and services to raise events with mechanisms for publishing and subscribing to events.

**Forms**: 
 - Support complex data entry scenarios with HTML-based validation and dirty checking.

**HTTP**: 
 - Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.

**Lifecycle hooks**: 
 - Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.

**Pipes**: 
 - Use pipes in your templates to improve the user experience by transforming values for display. Consider this currency pipe expression:

```js
price | currency:'USD': true
```
**Router**: 
 - Navigate from page to page within the client application and never leave the browser.

**Testing**: 
 - Run unit tests on your application parts as they interact with the Angular framework using the Angular Testing Platform.