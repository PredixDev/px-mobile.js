/*globals Request, Promise*/
'use strict';
import BaseClass from '../base';

//var fetch = require('fetch');
//var Promise = require('promise');

/**
 * HTTP class provides an abstraction layer for HTTP calls.
 * @example
 * var $http = new px.mobile.HTTP('http1', {
 *	baseUrl: window.location.origin
 * });
 General usage
The $http service is a function which takes a single argument — a configuration object — that is used to generate an HTTP request and returns a promise.

// Simple GET request example:
$http({
  method: 'GET',
  url: '/someUrl'
}).then(function successCallback(response) {
    // this callback will be called asynchronously
    // when the response is available
  }, function errorCallback(response) {
    // called asynchronously if an error occurs
    // or server returns response with an error status.
  });
The response object has these properties:

data – {string|Object} – The response body transformed with the transform functions.
status – {number} – HTTP status code of the response.
headers – {function([headerName])} – Header getter function.
config – {Object} – The configuration object that was used to generate the request.
statusText – {string} – HTTP status text of the response.
A response status code between 200 and 299 is considered a success status and will result in the success callback being called. Note that if the response is a redirect, XMLHttpRequest will transparently follow it, meaning that the error callback will not be called for such responses.


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
		return new Promise(function(resolve, reject) {
			if (response.status >= 200 && response.status < 300) {
				resolve(response);
			} else {
				reject(response);
			}
		});
	}

	/**
	 * I handle parsing the JSON of a response.
	 * @param {Response} response A Response object
	 * @return {Response} The original response with a data property that is the parsed JSON
	 */
	parseJSON(response) {
		return new Promise(function(resolve, reject) {
			if (!response) {
				throw new Error('Must pass a response object to parseJSON!');
			}
			if (response.status >= 200 && response.status < 300) {
				if (response.headers.get('Content-Type') === 'application/json') {
					response.json().then(function(json) {
						response.data = json;
						resolve(response);
					});
				} else {
					resolve(response);
				}

			} else {
				reject(response);
			}
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

		this.log.logApi(`request => ${url}`, config);
		this.log.logHttp(config.method, url);

		let benchmark = this.log.logTime('request');
		return new Promise((resolve, reject) => {
			fetch(url, config)
				.then((resp) => {
					this.log.logHttp(resp.headers.get('Content-Type') + ' ' + resp.status + ' ' + benchmark.end(), resp, true);
					if (config.method === 'HEAD') {
						this.checkStatus(resp).then(resolve, reject);
					} else {
						this.parseJSON(resp).then(resolve, reject);
					}
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
		return this.request(url, options);
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
