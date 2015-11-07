'use strict';

import BaseClass from '../base';
import HTTP from './http';
import * as utils from '../utils/utils';
import Logger from '../utils/log';

/**
 * Model class provides event dispatching.
 * @example
 * var model = new Model();
 * @param {String} id - The id of the model.
 * @param {Object} options - Options for the model
 */
export default class Model extends BaseClass {

	constructor(id, options) {
		id = id || utils.uuid();
		options = options || {};

		super(id, options);

		this.uuid = utils.uuid();
		this.baseUrl = options.baseUrl || '/default';
		this.defaults = options.defaults || {};
		this.idField = options.idField || '_id';
		this.scope = options.data || {};
		this.scope[options.idField] = id;

		this.adapter = options.adapter || HTTP;
		this.adapter = new this.adapter(id, options);

		this.log = new Logger('Model:' + id, {
			colors: {
				debug: 'color:blue'
			}
		});
		this.log.logApi('constructor', options);
	}

	url() {
		var url = `/${encodeURIComponent( this.get('_id') )}`;

		if (this.get('_rev')) {
			url += `?rev=${this.get('_rev')}`;
		}
		this.log.logApi('url()', url);
		return url;
	}

	has(attribute) {
		//this.log.logApi('has', attribute);
		return this.scope.hasOwnProperty(attribute);
	}

	get(attribute) {
		//this.log.logApi('has', attribute);
		if (this.has(attribute)) {
			return this.scope[attribute];
		} else {
			return false;
		}
	}

	set(attributes, force = true) {
		for (var key in attributes) {
			if (force) {
				this.scope[key] = attributes[key];
			}
			if (this.has(key)) {
				this.scope[key] = attributes[key];
			}
		}
		return this;
	}

	toJSON() {
		this.log.logApi('toJSON', this.scope);
		return JSON.stringify(this.scope);
	}

	clone() {
		return new this.constructor(this.options);
	}

	parse(resp) {
		this.log.logApi('parse', resp);
		if (resp.data) {
			this.scope = resp.data;
		}
		return resp;
	}

	fetch(options) {
		var self = this;
		this.log.logApi('fetch', options);
		return this.adapter.get(this.url(), options || {}).then(function(resp) {
			return self.parse(resp);
		});
	}

	save(options) {
		this.log.logApi('save', options);
		return this.adapter.put(`${this.url()}`, this.scope);
	}

	destroy(rev) {
		this.log.logApi('destroy', rev);
		return this.adapter.delete(`${this.url()}`);
	}

	sync(options) {
		this.log.logApi('sync', options);
	}

	static extend(obj) {
		return super.extend(this, obj);
	}
}
