'use strict';

import BaseClass from '../base';
//import Model from './model';
import HTTP from './http';
//import * as utils from './utils';

let defaults = {
	baseUrl: '/default',
	idField: '_id',
	model: {},
	models: [],
	params: {
		limit: 25,
		startkey: null,
		endkey: null
	}
};
/**
 * Collection class provides an abstraction layer for models.
 * @example
 * var $http = new px.mobile.HTTP('http1', {
 *	baseUrl: window.location.origin
 * });
 */
export default class Collection extends BaseClass {

	/**
	 * Create a new instance of a Collection.
	 * @constructor
	 * @param {String} name - The name of the collection
	 * @param {Object} options - The options to pass
	 * @return {Collection} An instance of the Collection class
	 */
	constructor(name, options = defaults) {
		super(name, options);

		// TODO: Setup defaults
		this.model = options.model;
		this.models = options.models;
		this.baseUrl = options.baseUrl;

		this.idField = options.idField || '_id';
		this.params = options.params || {
			startkey: '',
			endkey: '',
			limit: 25
		};
		this.lastResponse = null;

		// TODO: Adpater can be http or db
		this.adapter = options.adapter || HTTP;
		this.adapter = new this.adapter(name, options);

		return this;
	}

	/**
	 * Handle parsing the response from a fetch.
	 * @return {Promise} A promise that resolves a response.
	 */
	parse(resp) {
		return resp;
	}

	/**
	 * Add a model to the list of items.
	 */
	add(model) {
		return this.models.push(model);
	}

	//Handle sending another request.
	fetch(params) {
		var self = this;
		return self.adapter.get(params).then(function(resp) {
			self.lastResponse = resp;
			self.models = resp.data.rows;
			return resp;
		});
	}

	// TODO: remove(model) - Remove a model from the list of items.
	remove(model) {
		this.log.logApi('Find model by', model);
		if (this.utils.type(model) === 'string') {
			this.log.logApi('Find by _id', model);
		}
		if (this.utils.type(model) === 'number') {
			this.log.logApi('Find by index', model);
		}
		if (this.utils.type(model) === 'object') {
			this.log.logApi('Find by model', model);
		}
	}

	// TODO: where(filter) - Filter models based on filter passed.
	where(filter) {
		return this.models.filter(filter);
	}

	// TODO: findWhere(filter) - Filter and return first model by filter.
	find(filter) {
		return this.models.filter(filter);
	}

	// TODO: Return a model by id
	get(id) {
		this.log.logApi('get', id);
	}

	toJSON() {
		return JSON.stringify(this.models);
	}

}
