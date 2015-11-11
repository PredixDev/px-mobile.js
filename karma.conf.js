// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: [
      'browserify',
      'mocha',
      'chai',
      'sinon'
    ],
    files: [
      'dist/px-mobile.js',
      'src/**/*.js',
      'test/**/*-spec.js'
    ],
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
      '/default': 'http://localhost:4985',
      '/predixgo': 'http://localhost:4985'
    }

  });
};
