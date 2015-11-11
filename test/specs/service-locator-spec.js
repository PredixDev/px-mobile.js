import pxMobile from '../../src/index';
var sinon = require('sinon');
var assert = require('chai').assert;

/** @test {ServiceLocator} */
describe('Service Locator', function() {
  var app, myService;

  before(function(done) {
    app = new pxMobile.App();
    myService = {
      myMethod: function() {}
    };
    app.services.register('myService', myService);
    done();
  });

  it('register(name, service) - should register a service', function(done) {
    assert.ok(app.services.register);
    done();
  });

  /** @test {ServiceLocator#resolve} */
  it('resolve(service) - should resolve service', function(done) {
    assert.ok(app.services.resolve('myService').myMethod);
    done();
  });

});
