import pxMobile from '../../src/index';
var sinon = require('sinon');
var assert = require('chai').assert;

 /** @test {PubSub} */
 describe('pxMobile.PubSub', function() {

   var pubsub = new pxMobile.PubSub();

   /** @test {PubSub#constructor} */
   it('constructor()', function() {
     assert.ok(pubsub);
   });


 });
