[npm-url]: https://npmjs.org/package/px-mobilejs
[npm-image]: https://img.shields.io/npm/v/px-mobilejs.svg?style=flat-square

[travis-url]: https://travis-ci.org/jonniespratley/px-mobilejs
[travis-image]: https://img.shields.io/travis/jonniespratley/px-mobilejs.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/jonniespratley/px-mobilejs
[coveralls-image]: https://img.shields.io/coveralls/jonniespratley/px-mobilejs.svg?style=flat-square

[depstat-url]: https://david-dm.org/jonniespratley/px-mobilejs
[depstat-image]: https://david-dm.org/jonniespratley/px-mobilejs.svg?style=flat-square

[download-badge]: http://img.shields.io/npm/dm/px-mobilejs.svg?style=flat-square

# px-mobile.js

<p align="center">
  <a href="https://npmjs.org/package/px-mobilejs">
    <img src="https://img.shields.io/npm/v/px-mobilejs.svg?style=flat-square"
         alt="NPM Version">
  </a>

  <a href="https://coveralls.io/r/jonniespratley/px-mobilejs">
    <img src="https://img.shields.io/coveralls/jonniespratley/px-mobilejs.svg?style=flat-square"
         alt="Coverage Status">
  </a>

  <a href="https://travis-ci.org/jonniespratley/px-mobilejs">
    <img src="https://img.shields.io/travis/jonniespratley/px-mobilejs.svg?style=flat-square"
         alt="Build Status">
  </a>

  <a href="https://npmjs.org/package/px-mobilejs">
    <img src="http://img.shields.io/npm/dm/px-mobilejs.svg?style=flat-square"
         alt="Downloads">
  </a>

  <a href="https://david-dm.org/jonniespratley/px-mobilejs.svg">
    <img src="https://david-dm.org/jonniespratley/px-mobilejs.svg?style=flat-square"
         alt="Dependency Status">
  </a>

  <a href="https://github.com/jonniespratley/px-mobilejs/blob/master/LICENSE">
    <img src="https://img.shields.io/npm/l/px-mobilejs.svg?style=flat-square"
         alt="License">
  </a>
</p>
Build cross platform apps with HTML‚ CSS‚ and JS components.

### Feature
* **Web Components** - Piece together your application using web components.
* **ES6 JavaScript** - ES6 JavaScript using Babel and Browserify to transpile into ES5.
* **Extendable Styles** - Using SASS, change the default styles by changing the variables.



### Demo
To view the living live style-guide, visit the link below.

* [https://github.build.ge.com/pages/PredixComponents/px-mobile](https://github.build.ge.com/pages/PredixComponents/px-mobile)

### Install
Use bower to simplify the installation process, open the terminal and execute the following:

```
$ bower install https://github.build.ge.com/PredixComponents/px-mobile.git --save
```


### Usage
Copy and paste the following if you want to add px-mobile to your application.

**JavaScript and CSS:**

```
<html class="pxm">
 <head>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link href="bower_components/px-mobile/dist/css/px-mobile.min.css" rel="stylesheet"/>
   <script src="bower_components/px-mobile/dist/px-mobile.min.js"></script>
 </head>
 <body>
  	<!-- Markup -->
 </body>
</html>
```

**Web Components, JavaScript and CSS via HTML Imports:**

```
<html class="pxm">
 <head>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <link rel="import" href="bower_components/px-mobile/px-mobile.html">
   <link rel="import" href="bower_components/px-mobile/px-mobile-theme.html">
 </head>
 <body>
 	<!-- Markup -->
 </body>
```





## Contributing
Here are is a few easy ways to quickly get started, each one appealing to a different skill level and use case. Read through to see what suits your particular needs.

### Build from source
We use Gulp for its build system, with convenient methods for working with the framework. It's how we compile our code, run tests, and more.

```
$ git clone https://github.build.ge.com/PredixComponents/px-mobile.git
```

Then run `$ npm install` from the projects directory.

### Directory structure
The px-mobile source code download includes the precompiled CSS, JavaScript, and font assets, along with source Sass, JavaScript, and documentation. More specifically, it includes the following and more:

```
px-mobile/
    ├── demo/
    ├── dist/
    ├── docs/
    ├── src/
    │   ├── elements/
    │   ├── fonts/
    │   ├── images/
    │   ├── jade/
    │   ├── js/
    │   └── scss/
    ├── tasks/
    └── test/
        ├── elements/
        └── specs/
```

* The `scss/`, `js/`, and `fonts/` are the source code for our CSS, JS, and icon fonts (respectively).
* The `dist/` folder includes everything listed in the precompiled download section above.
* The `docs/` folder includes the source code for our documentation, and `demo/` of usage.



### Available commands

1. `npm start` - Watches the `./src` source files and automatically recompiles whenever files change.
2. `npm test` - Runs ESLint and runs the Mocha and Web Component tests.
3. `npm run docs` - Builds the JavaScript, and other assets for API documentation.
4. `npm run dist` - Regenerates the `./dist` directory with compiled and minified CSS and JavaScript files.


## License
GE Software

## Author
[jonnie.spratley@ge.com](mailto:jonnie.spratley@ge.com)
