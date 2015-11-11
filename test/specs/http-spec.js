import pxMobile from '../../src/index';


/** @test {HTTP} */
describe('pxMobile.HTTP', function() {
  var DATABASE_URL = '/default';
  var http = null,
    mockDoc = {};
  before(function() {
    http = new pxMobile.HTTP('http1', {
      baseUrl: DATABASE_URL
    });
  });

  // Use Sinon to replace jQuery's ajax method
  // with a spy.
  beforeEach(function() {
    //sinon.spy(pxMobile, 'HTTP');
  });

  // Restor jQuery's ajax method to its
  // original state
  afterEach(function() {
    //pxMobile.HTTP.restore();
  });

  it('should be defined', function() {
    assert.ok(pxMobile.HTTP);
  });

  it('should have: put, post, delete, get, head, request', function(done) {
    assert.ok(http.put);
    assert.ok(http.post);
    assert.ok(http.delete);
    assert.ok(http.get);
    assert.ok(http.head);
    assert.ok(http.request);
    done();
  });

  it('post(url, options) - should resolve promise on success', function(done) {
    mockDoc._id = 'test-doc-' + Date.now();
    http.put('/' + mockDoc._id, mockDoc).then(function(resp) {
      assert.equal(resp.status, 201);
      done();
    }, window.failSpec);
  });

  it('get(url, options) - should resolve promise on success', function(done) {
    http.get('/' + mockDoc._id).then(function(resp) {
      assert.equal(resp.status, 200);
      mockDoc = resp.data;
      done();
    }, window.failSpec);
  });

  it('put(url, options) - should resolve promise on success', function(done) {
    mockDoc.title = 'Updated at ' + Date.now();
    http.put('/' + mockDoc._id + '?rev=' + mockDoc._rev, mockDoc).then(function(resp) {
      assert.equal(resp.status, 201);
      done();
    }, window.failSpec);
  });

  it('head(url, options) - should resolve promise on success', function(done) {
    http.head('/' + mockDoc._id).then(function(resp) {
      assert.equal(resp.status, 200);
      done();
    }, window.failSpec);
  });

  it('delete(url, options) - should resolve promise on success', function(done) {
    http.get('/' + mockDoc._id).then(function(resp) {
      http.delete(mockDoc._id, {
        params: {
          rev: resp.data._rev
        }
      }).then(function(resp) {
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });

  });



});
