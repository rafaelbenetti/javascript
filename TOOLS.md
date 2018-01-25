* [Task Runners](#task-runners)
    * [Gulp](#gulp)
    * [Webpack](#webpack)
* [Transpilers](#transpilers)
    * [Babel](#babel)
* [Tests](#tests)
    * [Karma](#karma)
    * [Jasmine](#jasmine)
    * [Mocha](#mocha)
    * [Super Test](#super-test)


# Task Runners
-  Task runners is the automation of numerous development tasks.
-  Examples: 
    1) Transpile the code (Typescript to Javascript, ES6 to ES5).
    2) Compilation.
    3) Minification. 
    4) Run unit tests.  

## Gulp
- It's a task runner.
- Very simple usage.

```js
let gulp = require('gulp');
let concat = require('gulp-concat');

gulp.task('default', () => {
  return gulp.src('./src/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/'));
});
```

## Webpack
- It's a task runner.
- Most used with React.
- Require more js knowledge.

```js
module.exports = {
    entry: "./src/foo.js",
    output: {
        filename: "app.js",
        path: "./dist"
    }
};
```

# Transpilers
- Transpilers, or source-to-source compilers.
- Are tools that read source code written in one programming language.
- Produce the equivalent code in another language. 

## Babel
- Babel has support for the latest version of JavaScript through syntax transformers. 
- These plugins allow you to use new syntax, right now without waiting for browser support.

```js
// BEFORE
['1', '2'].map(n => console.log(n));
```
```js
// AFTER
'use strict';

['1', '2'].map(function (n) {
  return console.log(n);
});
```

# Tests
- [Unit] The tests of the minor part of code.
- [Integration] They test some specific functionality.
- [Performance] They test the performance and speed of some functionality.

## Karma
- It's a Test Runner.
- It accept webpack configuration file.

```js
const webpackConfig = require('./webpack.config.js');

module.exports = function(config) {
  config.set({
    files: [
      './app/main.ts'
    ],
    preprocessors: {
      './app/*.ts': ['webpack'],
    },
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    reporters: ['mocha'],
    webpack: webpackConfig,
    plugins: [
      'karma-webpack',
      'karma-jasmine',
      'karma-jasmine-matchers',
      'karma-phantomjs-launcher',
      'karma-mocha-reporter'
    ],
  });
}
```

## Jasmine
- Jasmine is a behavior-driven development framework.
- It does not depend on any other JavaScript frameworks.

```js
describe('This is a suit', () => {
  it('This is a spec', () => {
    expect(a).toBe(true);
  });
});    
```

## Mocha
- It has the same idea of jasmine.
- Mocha is a feature-rich JavaScript test framework.

```js
describe('This is a suit', () => {
  it('This is a spec', () => {
    [1,2,3].indexOf(5).should.equal(-1);
  });
});
```

## Super Test
- Provide a high-level abstraction for testing HTTP.

```js
const request = require('supertest');
const express = require('express');

const app = express();

app.get('/user', function(req, res) {
  res.status(200).json({ name: 'tobi' });
});

request(app)
  .get('/user')
  .expect('Content-Type', /json/)
  .expect('Content-Length', '15')
  .expect(200)
  .end(function(err, res) {
    if (err) throw err;
  });
```
