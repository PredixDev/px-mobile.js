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
      //'bower_components/es6-shim/es6-shim.min.js',
    //  'bower_components/es6-shim/es6-sham.min.js',
      //'bower_components/fetch/fetch.js',
      'dist/px-mobile.js',
      'src/**/*.js',
      'test/**/*-spec.js'
    ],
    browsers: ['PhantomJS'],
    reporters: ['spec', 'progress', 'coverage'],
    preprocessors: {
      'src/**/*.js': ['browserify', 'coverage'],
      'test/**/*-spec.js': ['browserify']
    },
    specReporter: {
       maxLogLines: 5,
       suppressErrorSummary: true,
       suppressFailed: false,
       suppressPassed: false,
       suppressSkipped: true
     },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    },
    browserify: {
      debug: true,
      transform: ['babelify']
    },
    proxies: {
      '/default': 'http://localhost:5984',
      '/predixgo': 'http://localhost:4985'
    }

  });
};
