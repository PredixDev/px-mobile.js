 /** @test {Router} */
 describe('pxMobile.Router', function() {
   var app = new pxMobile.App(),
     db = null,
     successCallback,
     errorCallback,
     testObj = {
       _id: 'test-' + Date.now(),
       title: 'Test Doc'
     },
     myRouter = null,
     routeCallback = function() {},
     routeHandlers = {};
   routeHandlers.homeRoute = function() {};
   routeHandlers.aboutRoute = function() {};
   routeHandlers.listRoute = function() {};
   routeHandlers.detailRoute = function() {};

   myRouter = new pxMobile.Router('app', {
     routes: {
       '/': routeHandlers.homeRoute
     }
   });
   myRouter.start();

   beforeEach(function() {

   });

   it('should be defined', function(done) {
     assert.ok(pxMobile.Router);
     done();
   });

   it('should have routes defined', function(done) {
     window.myRouter = myRouter;
     assert.ok(myRouter.routes);
     done();
   });

   xit('on(route, cb) - invokes route when matched', function(done) {
     myRouter.on('/about', function(req, res) {
       expect(req).toBeDefined();
       expect(res).toBeDefined();
       done();
     });
     myRouter.navigate('/about');
   });


   xit('on("/users/:action/:id", callback) - should invoke callback if route matches', function(done) {
     myRouter.on('/users/:action/:id', function(req, res) {
       console.warn('callback', req, res);
       expect(req).toBeDefined();
       expect(res).toBeDefined();
       expect(req.url).toBe(window.location.origin + '/users/edit/99');
       expect(req.pathname).toBe('/users/edit/99');
       expect(req.params.action).toBe('edit');
       expect(req.params.id).toBe('99');
       done();
     });

     myRouter.navigate('/users/edit/99', {
       data: testObj
     });
   });


   xit('when(route) - should resolve promise when hash matches', function(done) {
     app.services.resolve('router').when('/posts').then(function(req, res) {
       expect(res).toBeDefined();
       expect(req).toBeDefined();
       done();
     });
     app.services.resolve('router').navigate('/posts');
   });



   xit('should resolve route once resolve property is resolved', function(done) {
     app.services.register('router', new pxMobile.Router('default', {
       routes: {
         '/login': {
           callback: function(req, res) {
             expect(req.users).toBeDefined();
             console.warn('route callback', req, res);
             done();
           },
           resolve: {
             users: function() {
               return new Promise(function(resolve, reject) {
                 setTimeout(function() {
                   resolve({});
                 }, 1000);
               });
             }
           }
         }
       }
     }));
     app.services.resolve('router').navigate('/login');
   });


 });
