 /** @test {Interface} */
 describe('pxMobile.Interface', function() {
   var Interface = new pxMobile.Interface('Interface', ['method1']);

   /** @test {Interface#ensureImplements} */
   it('ensureImplements()', function() {
     assert.ok(pxMobile.Interface.ensureImplements);
   });
 });
