var istanbul = require('browserify-istanbul');
// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [
//      'es6-shim',
      'browserify',
      'mocha',
      'chai',
      'sinon'
    ],
    files: [
      'node_modules/babel-core/browser-polyfill.js',
      'bower_components/es6-shim/es6-shim.js',
    //  'bower_components/es6-shim/es6-sham.min.js',
      'bower_components/fetch/fetch.js',
      'dist/px-mobile.js',
      'src/**/*.js',
      'test/**/*-spec.js'
    ],
    browsers: [
      'Chrome',
      //'PhantomJS'
    ],
    reporters: ['spec', 'progress', 'coverage'],
    preprocessors: {
      //'src/**/*.js': ['babel', 'coverage'],
      'src/**/*.js': ['browserify'],
      //'src/!(*spec).js': ['babel', 'coverage'],
      'test/**/*-spec.js': ['browserify']
      //'test/**/*-spec.js': ['babel']
    },
    specReporter: {
      // maxLogLines: 5,
       //suppressErrorSummary: true,
       suppressFailed: false,
       suppressPassed: false,
       suppressSkipped: true
     },
    coverageReporter: {
      instrumenters: {isparta: require('isparta')},
      instrumenter: {
          'src/**/*.js': 'isparta'
      },
      reporters: [
        { type: 'html' },
        { type: 'cobertura'}
      ],
      dir: 'coverage/'
    },
    browserify: {
      debug: true,
    //  transform: ['babelify'],
      transform: [
        'babelify',
        'brfs',
        istanbul({
          ignore: ['**/node_modules/**', '**/test/**'],
        })
      ],
    },
    proxies: {
      '/default': 'http://localhost:4985/default',
      '/predixgo': 'http://localhost:4985'
    }

  });
};
