var pxMobile = require('../../dist/px-mobile');
/** @test {BaseClass} */
describe('BaseClass', function() {
  var myClass = new pxMobile.BaseClass('BaseClass');

  /** @test {BaseClass#constructor} */
  it('constructor()', function() {
    assert.ok(myClass, 'Should ..');
  });
});
