/*globals Request, Promise*/
'use strict';
import BaseClass from '../base';
//import fetch from 'fetch';

/**
 * HTTP class provides an abstraction layer for HTTP calls.
 * @example
 * var $http = new px.mobile.HTTP('http1', {
 *	baseUrl: window.location.origin
 * });
 */
export default class HTTP extends BaseClass {

	/**
	 * Create a new instance of a HTTP service.
	 * @constructor
	 * @param {String} name - The name of the service
	 * @param {Object} options - The default options to pass
	 * @return {HTTP} An instance of the HTTP class
	 */
	constructor(name = 'http', options = {
		baseUrl: '/default'
	}) {
		super(name, options);

		if (!options.baseUrl) {
			//throw new Error('HTTP: Must provide a baseUrl');
				this.log.logApi('[HTTP] - Using default baseUrl - /default');
		}

		return this;
	}

	/**
	 *	I handle checking the response status code of a HTTP request.
	 * @param {Response} response A Response object
	 * @return {Response} The original response
	 */
	checkStatus(response) {

		if (response.status >= 200 && response.status < 300) {
			return response;
		} else {
			var error = new Error(response.statusText);
			error.response = response;
			return response;
		}
	}

	/**
	 * I handle parsing the JSON of a response.
	 * @param {Response} response A Response object
	 * @return {Response} The original response with a data property that is the parsed JSON
	 */
	parseJSON(response) {
		if (!response) {
			throw new Error('Must pass a response object to parseJSON!');
		}
		return response.json().then(function(json) {
			response.data = json;
			return response;
		});
	}

	/**
	 *	I make a HTTP request for JSON.
	 * @example
	 * $http.getJSON('/default/_all_docs', {limit: 5}).then(function(resp){
	 *		//handle json
	 * }).catch(function(err){
	 *		//handle error
	 * });
	 * @param {String} url - The url
	 * @param {Object} options - Request options object
	 * @return {Promise} A promise that resolves a response
	 */
	getJSON(url = '', options = {}) {
		return fetch(url, options || {
			method: 'GET'
		})
			.then(this.checkStatus)
			.then(this.parseJSON);
	}

	/**
	 * The response object has these properties:
	 * @example
	 * $http.request('/default', {
	 *		method: 'POST',
	 *		data: data
	 * }).then(function(resp){
	 *		//handle response
	 * }).catch(function(err){
	 *		//handle error
	 * });
	 * @param {String} url - The url
	 * @param {Object} options - Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	request(url, options) {
		var _this = this;
		var config = this.utils.extend({
			data: null,
			params: null,
			body: null,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		}, options);

		if (options.data) {
			config.body = JSON.stringify(options.data);
			delete config.data;
		}


		url = this.utils.resolveURL(this.baseUrl, url);
		//url = this.utils.resolveURL(url);

		if (options.params) {
			url = this.utils.resolveURL(url, options.params);
			delete options.params;
		}

		//this.log.logApi(`request => ${url}`, config);
		this.log.logHttp(config.method, url);

		let benchmark = this.log.logTime('request');
		return new Promise((resolve, reject) => {
			return fetch(url, config)
				.then((resp) => {
				this.log.logHttp(resp.status + ' ' + benchmark.end(), resp, true);
				//return this.parseJSON(resp).then(resolve, reject);
				resp.data = {};
				resolve(resp);
			}, reject);
		});
	}

	/**
	 * I make a HTTP GET request.
	 * @example
	 * $http.get('/default/_all_docs', {limit: 5}).then(function(resp){
	 *		//handle resp:Response
	 * }).catch(function(err){
	 *		//handle error
	 * });
	 * @param {String} url The url
	 * @param {Object} options Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	get(url, options = {}) {
		this.log.logApi('get', options);
		return this.request(url, options).then(this.parseJSON);
	}

	/**
	 * I make a HTTP PUT request.
	 * @example
	$http.put('/default/id', {name: 'value'}).then(function(resp){
		//handle resp:Response
	}).catch(function(err){
		//handle error
	});
	 * @param {String} url The url
	 * @param {Object} options Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	put(url, data = null, options = {}) {
		this.log.logApi('put', data);
		return this.request(url, this.utils.extend({
			method: 'PUT',
			data: data
		}, options));
	}

	/**
	 * I make a HTTP POST request.
	 * @example
 $http.post('/default', {name: 'value'}).then(function(resp){
	 //handle resp:Response
 }).catch(function(err){
	 //handle error
 });

	 * @param {String} url The url
	 * @param {Object} options Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	post(url, data = null, options = {}) {
		return this.request(url, this.utils.extend({
			method: 'POST',
			data: data
		}, options));
	}

	/**
	 * I make a HTTP DELETE request.
	 * @example
 $http.delete('/default/id').then(function(resp){
	 //handle resp:Response
 }).catch(function(err){
	 //handle error
 });

	 * @param {String} url The url
	 * @param {Object} options Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	delete(url = '', options = {}) {
		return this.request(url, this.utils.extend({
			method: 'DELETE'
		}, options));
	}

	/**
	 * I make a HTTP HEAD request.
	 * @example
	$http.head('/default/id').then(function(resp){
		//handle resp:Response
	}).catch(function(err){
		//handle error
	});

	 * @param {String} url The url
	 * @param {Object} options Options to pass
	 * @return {Promise} A promise that resolves a response
	 */
	head(url = '', options = {}) {
		return this.request(url, this.utils.extend({
			method: 'HEAD'
		}, options));
	}

}
