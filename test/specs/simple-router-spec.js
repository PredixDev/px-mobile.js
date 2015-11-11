import pxMobile from '../../src/index';
var sinon = require('sinon');
var assert = require('chai').assert;

/*global sinon, before*/
describe('Simple Router', function() {
  var testRouter, routerSpies = {};
  testRouter = new pxMobile.SimpleRouter('test', {
    mode: 'hash'
  });

  before(function(done) {
    routerSpies.aboutRoute = sinon.spy();
    routerSpies.productsRoute = sinon.spy();
    routerSpies.defaultRoute = sinon.spy();

    testRouter
      .add(/about/, routerSpies.aboutRoute)
      .add(/^\/products\/(?:([^\/]+?))\/(?:([^\/]+?))\/?$/, routerSpies.productsRoute)
      .add(routerSpies.defaultRoute)
      .listen();
    done();
  });

  it('should invoke default route callback', function(done) {
    testRouter.check('/');
    assert.ok(routerSpies.defaultRoute.called);
    done();
  });

  it('should invoke /about route callback', function(done) {
    testRouter.check('/about');
    assert.ok(routerSpies.aboutRoute.called);
    done();
  });

  it('should invoke /products/1/edit route callback', function(done) {
    testRouter.check('/products/1/edit');
    assert.ok(routerSpies.productsRoute.called);
    done();
  });

});
