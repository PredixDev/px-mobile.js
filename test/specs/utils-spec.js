 

 /** @test {utils} */
 describe('pxMobile.utils', function() {
   it('should be defined', function() {
     assert.ok(pxMobile.utils);
   });
   it('extend(o1, o2) - should copy all properties from right to left.', function(done) {
     var obj1 = {
       name: 'jonnie'
     };
     var obj2 = {
       age: 28
     };
     var result = pxMobile.utils.extend(obj1, obj2);
     assert.equal(result.age, 28);
     assert.equal(result.name, 'jonnie');
     done();
   });

   it('mix - should mix (x) objects into one', function(done) {
     var cake = pxMobile.utils.mix({
       eggs: 2,
       large: true
     }, {
       butter: 1,
       salted: true
     }, {
       flour: '3 cups'
     }, {
       sugar: 'sure!'
     });
     assert.equal(cake.eggs, 2);
     assert.equal(cake.salted, true);
     assert.equal(cake.flour, '3 cups');
     done();
   });
 });
