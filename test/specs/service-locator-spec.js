

/** @test {pxMobile.ServiceLocator} */
describe('pxMobile.ServiceLocator', function () {
  var services, myService;

  before(function (done) {
    services = new pxMobile.ServiceLocator();
    myService = {
      myMethod: function () {
      }
    };
    done();
  });

  /** @test {ServiceLocator#register} */
  it('register(name, service) - should register a service', function (done) {
    services.register('myService', myService);
    assert.ok(services.register);
    done();
  });

  /** @test {ServiceLocator#resolve} */
  it('resolve(service) - should resolve service', function (done) {
    assert.ok(services.resolve('myService').myMethod);
    done();
  });
  /** @test {ServiceLocator#reset} */
  it('reset() - should remove all services', function (done) {
    assert.equal(services.services, {});
    done();
  });

});
