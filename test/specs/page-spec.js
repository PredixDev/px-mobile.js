var pxMobile = require('../../dist/px-mobile');
/** @test {Page} */
describe('pxMobile.Page', function() {
  var app = new pxMobile.Interface('app', ['method1']);

  /** @test {Page#constructor} */
  it('constructor()', function() {
    assert.ok(true, 'Should ..');
  });
});
