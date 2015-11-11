import pxMobile from '../../src/index';

 /** @test {Core} */
 describe('pxMobile.Core', function() {
   var sandbox = new pxMobile.Core('sandbox', {});
   var mockService = {
     method1: sinon.spy()
   };

   var service1 = function() {
     console.log('service 1 created');
     return this;
   };

   before(function(done) {
     sandbox.register('service1', service1);
     done();
   });

   it('should return module', function(done) {
     //  assert.ok(sandbox.moduleCheck('service1'));
     done();
   });

   /** @test {Core#start} */
   it('start()', function() {
     assert.ok(sandbox.start, 'Should start');
   });

   /** @test {Core#stop} */
   it('stop()', function() {
     assert.ok(sandbox.stop, 'Should stop');
   });
 });
