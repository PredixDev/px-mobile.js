import pxMobile from '../../src/index';
var sinon = require('sinon');

 /** @test {Page} */
 describe('pxMobile.Page', function() {
   var app = new pxMobile.Page('page1', {});

   /** @test {Page#constructor} */
   it('constructor()', function() {
     assert.ok(true, 'Should ..');
   });
 });
