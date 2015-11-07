'use strict';
import BaseClass from '../base';
import HTTP from './http';

/**
 * @description The DB class was created to help web developers build applications that work as well offline as they do online.
 * @example
 * var db = new px.mobile.DB('db1', {
 *		baseUrl: 'HTTP://localhost:5984/default'
 * });
 * db.get('sync-user1').then(function(resp){
 *		console.log(json);
 * });
 * @extends {BaseClass}
 * @implements {MyInterface2}
 */
export default class DB extends BaseClass {

	/**
	 * @description The constructor method that returns an instance of this DB class.
	 * @constructor
	 * @param {String} name	- The name of the instance
	 * @param {Object} options - The options object
	 * @return {DB} Instance of the DB class.
	 */
	constructor(name = 'db', options = {
		baseUrl: '/default'
	}) {
		super(name, options);


		if (!options.baseUrl) {
			//throw new Error('DB: Must provide a baseUrl');
			this.log.logApi('[DB] - Using default baseUrl - /default');
		}

		/**
		 * @type {Class} adapter - The adapter to use for all requests.
		 */
		var adapter = options.adapter || new HTTP(name, options);
		this.adapter = adapter;

		return this;
	}

	/**
	 * @description I fetch general information of the database.
	 * @example
	 * db.info().then(function(resp){
	 *		assert.equal(resp.status, 200);
	 *		assert.ok(resp.data);
	 *		assert.ok(resp.data.db_name);
	 *		assert.ok(resp.data.update_seq);
	 * }).catch(function (err) {
	 *		console.log(err);
	 * });
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	info() {
		return this.adapter.get('');
	}

	/**
	 * @description Fetch multiple documents, indexed and sorted by the _id. Deleted documents are only included if options.keys is specified.
	 * @param {Object} options - The options object
	 * @param {Boolean} options.include_docs - Include the document itself in each row in the doc field. Otherwise by default you only get the _id and _rev properties.
	 * @param {Boolean} options.conflicts - Include conflict information in the _conflicts field of a doc.
	 * @param {Boolean} options.attachments - Include attachment data as base64-encoded string.
	 * @param {String} options.startkey - Get documents with IDs in range.
	 * @param {String} options.endkey - Get documents with IDs in a certain range (inclusive/inclusive).
	 * @param {Boolean} options.inclusive_end - Include documents having an ID equal to the given options.endkey. Default: true.
	 * @param {Number} options.limit - Maximum number of documents to return.
	 * @param {Number} options.skip - Number of docs to skip before returning (warning: poor performance on IndexedDB/LevelDB!).
	 * @param {Boolean} options.descending - Reverse the order of the output documents.
	 * @param {String} options.key - Only return documents with IDs matching this string key.
	 * @param {Array} options.keys - Array of string keys to fetch in a single shot.
	 * @example
	 * db.allDocs({
	 *		limit: 5,
	 *		include_docs: true
	 * }).then(function(resp) {
	 *		expect(resp.status).toBe(200);
	 *		expect(resp.data.rows).toBeDefined();
	 *		expect(resp.data.rows.length).toBe(5);
	 * }).catch(function (err) {
	 *		console.log(err);
	 * });
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	allDocs(options) {
		this.log.logApi('allDocs', options);
		return this.adapter.get(`/_all_docs`, {
			params: options
		});
	}

	/**
	 * @description Retrieves a document, specified by docId.
	 * @example
	 * db.get(testObj._id).then(function (resp) {
	 *		expect(resp.status).toBe(200);
	 *		expect(resp.data._rev).toBeDefined();
	 * }).catch(function(err){
	 *		console.warn(err);
	 * });
	 * @param {String} docId - The id of the document
	 * @param {Object} options - The options object
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	get(docId, options) {
		this.log.logApi('get', docId);
		if (!docId) {
			throw new Error('db.get(docId) - Must provide a document _id!');
		}
		return this.adapter.get(`/${docId}`, options);
	}

	/**
	 * @description Put a document
	 * @example
	 * var doc = {
	 *		_id: 'test-doc1',
	 *		name: 'New Doc'
	 * };
	 * db.put(doc).then(function(resp){
	 *		console.log(resp);
	 * }).catch(function(err){
	 *		console.warn(err);
	 * });
	 * @param {Object} doc - The document object, must have _id	for creation, and _rev for updating
	 * @param {Object} options - The options to send with the request
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	put(doc, options) {
		this.log.logApi('put', doc);
		if (!doc) {
			throw new Error('db.put(doc) - Must provide a document object!');
		}
		if (!doc._id) {
			throw new Error('db.put(doc) - Must provide a _id on the document object!');
		}
		if (doc._rev) {
			options = options || {
				params: {
					rev: doc._rev
				}
			};
		}
		return this.adapter.put(`/${doc._id}`, doc, options).then(this.adapter.parseJSON);
	}

	/**
	 * @description I handle creating a new document with a generated _id
	 * @example
	 * @param {Object} doc - A document object
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	post(doc) {
		if (!doc) {
			throw new Error('db.put(doc) - Must provide a document object!');
		}
		doc._id = this.utils.uuid();
		return this.put(doc);
	}

	/**
	 * @description I handle removing a document from the data store.
	 * @example
	 * db.get(testObj._id).then(function (resp) {
	 *		testObj._rev = resp.data._rev;
	 *		db.remove(testObj._id, testObj._rev).then(function (res) {
	 *			expect(res.status).toBe(200);
	 *		});
	 * });
	 * @description
	 * @param {String} id - The documents _id
	 * @param {String} rev - The documents _rev
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	remove(id, rev) {
		this.log.logApi('remove', {
			id: id,
			rev: rev
		});
		if (!id) {
			throw new Error('db.remove(id, rev) - Must provide a id!');
		}
		if (!rev) {
			throw new Error('db.remove(id, rev) - Must provide a rev!');
		}
		return this.adapter.delete(`/${id}`, {
			params: {
				rev: rev
			}
		}).then(this.adapter.parseJSON);
	}

	/**
	 * @description Get an attachment from the data store.
	 * @example
	 * var testAttachmentDoc = 'test-doc-attachment-' + Date.now();
	 * db.getAttachment(testAttachmentDoc, 'file.html').then(function (resp) {
	 *		expect(resp.ok).toBe(true);
	 * });
	 * @param {String} id - The documents _id
	 * @param {String} attachmentId - The documents attachment name
	 * @param {String} contentType - The documents attachment Content Type
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	getAttachment(id, attachmentId, contentType) {
		this.log.logApi('getAttachment', {
			id: id,
			attachment: attachmentId
		});
		if (!id) {
			throw new Error('db.getAttachment(id, attachmentId) - Must provide a document _id!');
		}
		if (!attachmentId) {
			throw new Error('db.getAttachment(id, attachmentId) - Must provide a document attachment!');
		}
		return this.adapter.request(`${id}/${attachmentId}`, {
			method: 'GET',
			headers: {
				'Content-Type': contentType || 'application/octet-stream'
			}
		});
	}

	/**
	 * @description Save an attachment to the data store.
	 * @example
	 * var aFileParts = ['<a id="a"><b id="b">hey!</b></a>'];
	 * var myBlob = new Blob(aFileParts, {
	 *		type: 'text/html'
	 * });
	 * db.get(testAttachmentDoc).then(function (resp) {
	 *		expect(resp.ok).toBe(true);
	 *		db.saveAttachment(resp.data._id, resp.data._rev, 'file.html', myBlob.type, myBlob).then(function (resp) {
	 *			expect(resp.ok).toBe(true);
	 *		});
	 * });
	 * @param {String} id - The documents _id
	 * @param {String} rev - The documents _rev
	 * @param {String} filename - The documents attachment name
	 * @param {String} type - The attachment type
	 * @param {Blob} file - The actual attachment Blob
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	saveAttachment(id, rev, filename, type, file) {
		this.log.logApi('saveAttachment', file);
		return this.adapter.request(`${id}/${filename}`, {
			method: 'PUT',
			headers: {
				'Content-Type': type || 'application/octet-stream'
			},
			params: {
				rev: rev
			},
			body: file
		});
	}

	/**
	 * @description Bulk insert or remove documents from the data store.
	 * Create, update or delete multiple documents. The docs argument is an array of documents.
	 * If you omit an _id parameter on a given document, the database will create a new document and assign the ID for you.
	 * To update a document, you must include both an _id parameter and a _rev parameter, which should match the ID and revision of the document on which to base your updates.
	 * To delete a document, include a _deleted parameter with the value true.
	 * @example
	 * var docs = [{
	 *	 _id: 'test-doc-1-' + Date.now(),
	 *	 name: 'Test Doc 1'
	 * },
	 * {
	 *	 _id: 'test-doc-2-' + Date.now(),
	 *	 name: 'Test Doc 2'
	 * }];
	 * db.bulkDocs(docs).then(function(resp) {
	 *	 expect(resp.status).toBe(201);
	 *	 expect(resp.data.length).toBe(2);
	 * });
	 * @param {Array} docs - An array of document objects
	 * @return {Promise <Response, Error>} A promise that is resolved/rejected upon success/failure.
	 */
	bulkDocs(docs) {
		if (!docs) {
			throw new Error('bulkDocs - Must provide an array of documents!');
		}
		this.log.logApi('bulkDocs', docs);
		return this.adapter.post('/_bulk_docs', {
			docs: docs
		}).then(this.adapter.parseJSON);
	}

	/**
	 * @description A list of changes made to documents in the database, in the order they were made. It returns an object with the method cancel(), which you call if you don’t want to listen to new changes anymore.
	 * It is an event emitter and will emit a 'change' event on each document change, a 'complete' event when all the changes have been processed, and an 'error' event when an error occurs.
	 * In addition to the 'change' event, any change will also emit a 'create', 'update', or 'delete' event.
	 * @example
	 * var db = new px.mobile.DB('testdb', {baseUrl: 'adapter://localhost:5984/default'});
	 * var changes = db.changes({
	 *		since: 'now',
	 *		live: true,
	 *		include_docs: true
	 * })
	 * .on('change', function(change) {
	 *		console.warn('Change', change);
	 * })
	 * .on('complete', function(info) {
	 *		console.warn('Changes completed', info);
	 * })
	 * .on('error', function (err) {
	 *		console.log(err);
	 * });
	 * changes.cancel(); // whenever you want to cancel
	 * @param {Object} options - The options to send with the changes request. All options default to false unless otherwise specified.
	 * @param {Boolean} options.live - Will emit change events for all future changes until cancelled.
	 * @param {Boolean} options.include_docs - Include the associated document with each change.
	 * @param {Boolean} options.conflicts - Include conflicts.
	 * @param {Boolean} options.attachments -Include attachments.
	 * @param {Boolean} options.binary - Return attachment data as Blobs/Buffers, instead of as base64-encoded strings.
	 * @param {Boolean} options.descending - Reverse the order of the output documents.
	 * @param {Number} options.since - Start the results from the change immediately after the given sequence number. You can also pass 'now' if you want only new changes (when live is true).
	 * @param {Number} options.limit - Limit the number of results to this number.
	 * @param {Number} options.timeout - Request timeout (in milliseconds).
	 * @return {Object} An object with cancel() on(event) methods.
	 */
	changes(options) {
		var self = this;
		var defaults = {
			live: false,
			include_docs: false,
			conflicts: false,
			attachments: false,
			binary: false,
			descending: false,
			since: 0,
			limit: null,
			heartbeat: 1000
		};

		options = this.utils.extend(defaults, options);


		self.log.logApi('changes', options);

		//changes request
		var _fetchChanges = function() {
			self.log.logApi('_fetchChanges', options);

			return self.adapter.get('/_changes', {
				params: options
			}).then(self.adapter.parseJSON).then(function(resp) {
				options.since = resp.data.last_seq;

				if (_callbacks.change) {
					if (resp.data.results) {
						resp.data.results.forEach(function(change) {
							_callbacks.change(change);
							self.log.logApi('change', change);
						});
					}
				}

				if (resp.data.results.length === 0) {
					if (_callbacks.complete) {
						_callbacks.complete(resp);
					}
					self.log.logApi('complete', resp);
				}

				return resp;
			}).catch(function(err) {
				if (_callbacks.error) {
					_callbacks.error(err);
				}
				return err;
			});
		};

		var _callbacks = {};

		//changes feed
		var _feed = setInterval(function() {
			self.log.logApi('_feed', options);
			_fetchChanges();
		}, options.heartbeat);

		return {
			on: function(e, cb) {
				_callbacks[e] = cb;
				self.log.logApi('on', options);
				return this;
			},
			cancel: function() {
				self.log.logApi('cancel', options);
				clearInterval(_feed);
				return this;
			}
		};
	}
}
