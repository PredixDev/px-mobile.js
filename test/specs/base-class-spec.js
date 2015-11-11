import pxMobile from '../../src/index';
 /** @test {BaseClass} */
 describe('pxMobile.BaseClass', function() {
   var myClass = new pxMobile.BaseClass('BaseClass');

   /** @test {BaseClass#constructor} */
   it('constructor()', function() {
     assert.ok(myClass, 'Should ..');
   });
   /** @test {BaseClass#log} */
   it('log - object should be present', function() {
     assert.ok(myClass.log, 'should have log object');
   });


 });
