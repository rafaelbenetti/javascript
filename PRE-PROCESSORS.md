# Review of main benefits of pre-processors

* [Pre Processors](#pre-processors)
    * [Variables](#variables)
    * [Nesting](#nesting)
    * [Imports](#imports)
    * [Mixins](#mixins)
    * [Extend / Inheritance](#extend/inheritance)
    * [Operators](#operators)

## Pre Processors
- A CSS preprocessor is a program that lets you generate CSS from the preprocessor's own unique syntax. There are many CSS preprocessors to choose from, however most CSS preprocessors will add some features that don't exist in pure CSS, such as mixin, nesting selector, inheritance selector, and so on. These features make the CSS structure more readable and easier to maintain.

## Variables
- Think of variables as a way to store information that you want to reuse throughout your stylesheet. 

```scss
$font-stack: Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

## Nesting
- Pre processors will let you nest your CSS selectors in a way that follows the same visual hierarchy of your HTML

```scss
nav {
  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  li { 
    display: inline-block; 
  }
}
```

## Imports
- You don't have to write all your styles in a single file. You can split it up however you want with the @import rule.

```scss
// _base.scss
$font-stack:    Helvetica, sans-serif;
$primary-color: #333;

body {
  font: 100% $font-stack;
  color: $primary-color;
}
```

```scss
// styles.scss
@import 'base';

.inverse {
  background-color: $primary-color;
  color: white;
}
```

## Mixins 
- Some things in CSS are a bit tedious to write, especially with CSS3 and the many vendor prefixes that exist. A mixin lets you make groups of CSS declarations that you want to reuse throughout your site. You can even pass in values to make your mixin more flexible. A good use of a mixin is for vendor prefixes. Here's an example for transform.

```scss
@mixin transform($property) {
  -webkit-transform: $property;
  -ms-transform: $property;
  transform: $property;
}
.box { @include transform(rotate(30deg)); }
```

## Extend/Inheritance 
- Using @extend lets you share a set of CSS properties from one selector to another. It helps keep your Sass very DRY. 

```scss
%message-shared {
  border: 1px solid #ccc;
  padding: 10px;
  color: #333;
}

.success {
  @extend %message-shared;
  border-color: green;
}

.error {
  @extend %message-shared;
  border-color: red;
}
``` 

## Operators
- Pre processors have a handful of standard math operators like +, -, *, /, and %. 

```scss
.container {
  width: 600px / 960px * 100%;
}
```
