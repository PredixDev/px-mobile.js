
function failSpec(done) {
  assert.fail();
  return done();
}

function PouchDbAdapter(name, options) {
  PouchDB.debug('*');
  var _db = new PouchDB(name, options);
  var adapter = {
    parseJSON: function(resp) {
      console.log('Pouchdb response', resp);
      return {
        status: 'ok',
        data: resp
      };
    },
    get: function(url, args) {
      return _db.get(args).then(this.parseJSON);
    },
    put: function(url, args) {
      return _db.get(args).then(this.parseJSON);
    },
    info: function() {
      return _db.info().then(this.parseJSON);
    }
  };
  return adapter;

}

/** @test {DB} */
describe('pxMobile.DB', function() {

  var DATABASE_URL = '/default';
  var TEST_IDS = window.TEST_IDS = [];

  var sandbox = sinon.sandbox;
  var db = null,
    testAttachmentDoc = 'test-doc-attachment-' + Date.now(),
    successCallback, errorCallback,
    testObj = {
      _id: 'test-' + Date.now(),
      title: 'Test Doc'
    },
    docs = [{
      _id: 'test-doc-1-' + Date.now(),
      name: 'Test Doc 1'
    }, {
      _id: 'test-doc-2-' + Date.now(),
      name: 'Test Doc 2'
    }, {
      _id: 'test-doc-3-' + Date.now(),
      name: 'Test Doc 3'
    }];

  function removeDoc(id) {
    return db.get(id).then(function(resp) {
      return db.remove(resp.data._id, resp.data._rev).then(function(res) {
        console.warn('Removed', res.data);
        return res;
      });
    });
  }

  before(function() {
    //sandbox.useFakeServer();
    //this.server = sinon.fakeServer.create();
    db = new pxMobile.DB('testdb', {
      baseUrl: DATABASE_URL
    });
  });

  after(function() {
    console.warn('Cleanup docs', TEST_IDS);
    TEST_IDS.forEach(function(id) {
      removeDoc(id);
    });
  });

  describe('DB', function() {

    it('should be defined', function() {
      assert.ok(pxMobile.DB);
    });

    it('should have methods: allDocs, get, put, post, remove, bulkDocs, getAttachment, saveAttachment', function(done) {
      assert.ok(db.allDocs);
      assert.ok(db.get);
      assert.ok(db.post);
      assert.ok(db.put);
      assert.ok(db.remove);
      assert.ok(db.getAttachment);
      assert.ok(db.saveAttachment);
      done();
    });


    xdescribe('Adapter', function() {

      var mockPromise = function(resp, time) {
        return new Promise(function(resolve, reject) {
          return setTimeout(function() {
            return resolve(resp);
          }, time || 100);
        });
      };

      var mockAdapter = function(name, options) {
        return {
          get: mockPromise(sinon.spy()),
          put: mockPromise(sinon.spy()),
          post: sinon.spy(),
          delete: sinon.spy(),
          request: sinon.spy(),
          allDocs: sinon.spy()
        };
      };


      it('should be able to use an adapter', function() {
        var localDb = localDb = new pxMobile.DB('localDb', {
          baseUrl: DATABASE_URL || '/default',
          adapter: new mockAdapter('test', {})
        });

        localDb.get('test');
        localDb.put({
          _id: 'test'
        });
        localDb.post({
          name: 'test 3'
        });
        localDb.allDocs({
          include_docs: true
        });
        assert.ok(localDb.adapter.get.called);
        assert.ok(localDb.adapter.put.called);
        assert.ok(localDb.adapter.post.called);
        assert.ok(localDb.adapter.allDocs.called);
      });
    });

    /** @test {DB#info} */
    it('info() - should resolve promise on success with database info', function(done) {
      db.info().then(function(resp) {
        assert.equal(resp.status, 200);
        assert.ok(resp.data);
        assert.ok(resp.data.db_name);
        assert.ok(resp.data.update_seq);

        done();
      }, failSpec);
    });

    /** @test {DB#bulkDocs} */
    it('bulkDocs(docs) - should resolve promise on success', function(done) {
      db.bulkDocs(docs).then(function(resp) {
        docs = resp.data;
        assert.equal(resp.status, 201);
        assert.equal(resp.data.length, 3);
        resp.data.forEach(function(row) {
          TEST_IDS.push(row.id);
        });
        done();
      }, failSpec);
    });

    /** @test {DB#bulkDocs} */
    it('bulkDocs(docs) - should remove doc if _delete flag is set', function(done) {
      docs.forEach(function(doc) {
        if (doc._rev) {
          doc._deleted = true;
        }
      });
      db.bulkDocs(docs).then(function(resp) {
        docs = resp.data;
        assert.equal(resp.status, 201);
        assert.equal(resp.data.length, 3);
        resp.data.forEach(function(row) {
          TEST_IDS.push(row.id);
        });
        done();
      }, failSpec);
    });

    /** @test {DB#allDocs} */
    it('allDocs(options) - should resolve promise on success', function(done) {
      db.allDocs({
        limit: 5
      }).then(function(resp) {
        assert.equal(resp.status, 200);
        assert.ok(resp.data.rows);
        assert.equal(resp.data.rows.length, 5);
        done();
      }, failSpec);
    });

    /** @test {DB#put} */
    it('put(doc) - should resolve promise on success', function(done) {
      db.put(testObj).then(function(resp) {
        assert.equal(resp.status, 201);
        assert.ok(resp.data.rev);
        TEST_IDS.push(resp.data.id);
        done();
      });
    });

    /** @test {DB#get} */
    it('get(id) - should resolve promise on success', function(done) {
      db.get(testObj._id).then(function(resp) {
        assert.equal(resp.status, 200);
        assert.ok(resp.data._rev);
        done();
      }, failSpec);
    });

    /** @test {DB#get} */
    it('get(id) - should reject promise on error', function(done) {
      db.get('unknown-id').then(function(resp) {
        assert.equal(resp.status, 404);
        failSpec();
        done();
      }, function(resp) {
        assert.equal(resp.status, 404);
        done();
      });
    });

    /** @test {DB#remove} */
    it('remove(id, rev) - should resolve promise on success', function(done) {
      db.get(testObj._id).then(function(resp) {
        testObj._rev = resp.data._rev;
        db.remove(testObj._id, testObj._rev).then(function(res) {
          assert.equal(res.status, 200);
          done();
        }, failSpec);
      });
    });

    var newDocId = '';
    /** @test {DB#post} */
    it('post(doc) - should insert document with generated id and resolve promise on success.', function(done) {
      db.post({
        title: 'New Doc'
      }).then(function(resp) {
        assert.equal(resp.status, 201);
        assert.ok(resp.data.id);
        assert.ok(resp.data.rev);
        db.remove(resp.data.id, resp.data.rev).then(function(res) {
          assert.equal(res.status, 200);
          TEST_IDS.push(resp.data.id);
          done();
        }, failSpec);
      }, failSpec);
    });


    /** @test {DB#saveAttachment}
    xit('saveAttachment(id, rev, filename, type, file) - should save file attachment',
      function(done) {
        var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
        var myBlob = new Blob(aFileParts, {
          type: 'text/html'
        });
        db.put({
          _id: testAttachmentDoc
        }).then(function(resp) {
          assert.equal(resp.ok, true);
          db.get(testAttachmentDoc).then(function(resp) {
            assert.equal(resp.ok, true);
            db.saveAttachment(resp.data._id, resp.data._rev, 'file.html', myBlob.type,
              myBlob).then(function(resp) {
              assert.equal(resp.ok, true);
              done();
            }, failSpec);
          }, failSpec);
        }, failSpec);


      });
     */
    /** @test {DB#getAttachment}
    xit('getAttachment(id, filename) - should return file attachment', function(done) {
      db.getAttachment(testAttachmentDoc, 'file.txt').then(function(resp) {
        assert.equal(resp.ok, true);
        db.get(testAttachmentDoc).then(function(res) {
          assert.equal(res.ok, true);
          db.remove(res.data._id, res.data._rev).then(function(re) {
            assert.equal(re.status, 200);
            done();
          }, failSpec);
        }, failSpec);
      }, failSpec);
    });
     */

    describe('Changes', function() {
      var changes, changeHandlers = {};

      beforeEach(function() {

        //jasmine.clock().install();
      });

      afterEach(function() {
        //jasmine.clock().uninstall();
        //  changes.cancel();
      });

      /** @test {DB#changes} */
      it('changes() - should request changes and invoke callbacks on events', function(done) {
        changeHandlers.changeHandler = sinon.spy();
        changeHandlers.completeHandler = sinon.spy();
        changeHandlers.errorHandler = sinon.spy();
        changes = db.changes({
            since: 'now',
            live: true,
            interval: 100,
            include_docs: true
          })
          .on('change', changeHandlers.changeHandler)
          .on('complete', changeHandlers.completeHandler)
          .on('error', changeHandlers.errorHandler);

        //assert.ok(changeHandlers.changeHandler).not.toHaveBeenCalled();

        setTimeout(function() {
          console.warn(changeHandlers.changeHandler);
          assert.ok(changeHandlers.changeHandler);
          changes.cancel();
          done();
        }, 100);
      });

    });



    describe('Error Handling', function() {
      /** @test {DB#get} */
      it('get() - should throw error if no {_id: 0} is passed', function() {
        assert.throws(function() {
          db.get();
        });
      });
      /** @test {DB#remove} */
      it('remove() - should throw error if no params is passed', function() {
        assert.throws(function() {
          db.remove();
        });
      });
      /** @test {DB#remove} */
      it('remove() - should throw error if no _id is passed', function() {
        assert.throws(function() {
          db.remove({});
        });
      });

      /** @test {DB#put} */
      it('put() - should throw error if no params is passed', function() {
        assert.throws(function() {
          db.put();
        });
      });
      /** @test {DB#put} */
      it('put() - should throw error if no _id is passed', function() {
        assert.throws(function() {
          db.put({});
        });
      });
    });
  })
});
