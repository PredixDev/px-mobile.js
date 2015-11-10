var DATABASE_URL = 'http://localhost:5984/default';

/** @test {Model} */
describe('pxMobile.Model', function() {
  var model = null,
    id;

  before(function() {
    id = 'test-doc-' + pxMobile.utils.uuid();
    model = model = new pxMobile.Model(id, {
      baseUrl: DATABASE_URL,
      idField: '_id',
      data: {
        _id: id,
        _rev: null,
        name: 'test doc'
      }
    });
  });

  /** @test {Model#url} */
  it('url() - should return url of model', function(done) {
    expect(model.url()).to.contain('' + model.get('_id'));
    done();
  });

  /** @test {Model#get} */
  it('get(name) - should get properties on object', function(done) {
    expect(model.get('name')).to.contain('test doc');
    done();
  });

  /** @test {Model#set} */
  it('set({name: value}) - should selected properties on object', function(done) {
    model.set({
      name: 'new name'
    });
    expect(model.get('name')).to.contain('new name');
    done();
  });

  /** @test {Model#toJSON} */
  it('toJSON() - should return object properties as JSON', function(done) {
    expect(model.toJSON()).to.contain(JSON.stringify(model.data));
    done();
  });

  /** @test {Model#has} */
  it('has(prop) - should return true/false if property exists', function(done) {
    assert.equal(model.has('title'), false);
    assert.equal(model.has('name'), true);
    done();
  });

  /** @test {Model#subscribe} */
  it('subscribe(event, cb) - should register callback for event', function(done) {
    //var model = new pxMobile.Model('test-4', {baseUrl: 'http://localhost:5984/default'});
    model.set({
      'title': 'test'
    });
    model.subscribe('change', function(d) {
      assert.ok(d);
      done();
    });
    model.publish('change', {
      name: 'value'
    });
  });

  describe('CRUD', function() {
    beforeEach(function() {
      console.log(model);
    });

    /** @test {Model#set} */
    it('save() - should make a http request and return response', function(done) {
      model.save().then(function(resp) {
        assert.equal(resp.status, 201);
        done();
      }, window.failSpec);
    });

    /** @test {Model#fetch} */
    it('fetch() - should make a http request and return response', function(done) {
      model.fetch().then(function(resp) {
        model.set(resp.data);
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });

    /** @test {Model#destroy} */
    it('destroy() - should make a DELETE request and return response', function(done) {
      model.destroy().then(function(resp) {
        assert.equal(resp.status, 200);
        done();
      }, window.failSpec);
    });

  });



});
