var pxMobile = require('../../dist/px-mobile');
/** @test {DOM} */
describe('pxMobile.DOM', function() {
  var el = null;


  before(function() {
    var currentDiv = document.getElementById("mocha");
    var newDiv = document.createElement("div");
    newDiv.id = 'sandbox';
    document.body.insertBefore(newDiv, currentDiv);

    el = pxMobile.$('#sandbox');
  });

  it('Element.addClass(className) - should add the class to the element.', function() {
    el.addClass('testing');
    expect(el.className).to.contain('testing');
  });
  it('Element.removeClass(className) - should remove the class to the element.', function() {
    el.removeClass('testing');
    expect(el.className).not.to.contain('testing');
  });
  it('Element.toggleClass(className) - should add/remove class from element', function() {
    el.toggleClass('sandbox');
    expect(el.className).to.contain('sandbox');
    el.toggleClass('sandbox');
    expect(el.className).not.to.contain('sandbox');
  });
  it('Element.hasClass(className) - should add the class to the element.', function() {
    el.addClass('testing');
    assert.equal(el.hasClass('testing'), true);
    el.removeClass('testing');
    assert.equal(el.hasClass('testing'), false);
  });

  it('Element.attr(name, value) - should get/set the attribute on the element.', function() {
    el.attr('title', 'Test Element');
    expect(el.attr('title')).to.be('Test Element');
  });

  it('Element.html() - should get/set the html in the element.', function() {
    el.html('<h1>Sandbox</h1>');
    expect(el.html()).to.contain('<h1>Sandbox</h1>');
  });
  it('Element.text() - should get/set the text content in the element.', function() {
    expect(el.text()).to.contain('Sandbox');
  });


  it('dom.extend({}, obj1, obj2) - should return extended object.', function() {
    var obj = {};
    var obj1 = {
      version: '1.0'
    };
    var obj2 = {
      debug: true
    };
    pxMobile.dom.extend(obj, obj1, obj2);

    assert.ok(obj.version);
    assert.ok(obj.debug);
  });
  it('dom.extend({}, obj1, obj2) - should return extended nested object.', function() {
    var obj = {};
    var obj1 = {
      version: '1.0',
      session: {
        user: {
          username: 'jonnie'
        }
      }
    };
    var obj2 = {
      debug: true,
      auth: {
        login: function() {},
        logout: function() {}
      }
    };
    pxMobile.dom.extend(obj, obj1, obj2);

    assert.ok(obj.version);
    assert.ok(obj.debug);
    assert.ok(obj.session);
    assert.ok(obj.session.user.username);
    assert.ok(obj.auth.login);
    assert.ok(obj.auth.logout);
  });
});
