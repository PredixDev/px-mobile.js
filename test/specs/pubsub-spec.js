var pxMobile = require('../../dist/px-mobile');
/** @test {PubSub} */
describe('pxMobile.PubSub', function() {

  var pubsub = new pxMobile.PubSub();

  /** @test {PubSub#constructor} */
  it('constructor()', function() {
    assert.ok(pubsub);
  });


});
