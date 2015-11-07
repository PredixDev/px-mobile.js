'use strict';
//var debug = require('../../../node_modules/debug/browser.js');
/*
debug.enable('worker:*');
a = debug('worker:a');
b = debug('worker:b');

setInterval(function(){
  a('doing some work');
}, 1000);

setInterval(function(){
  b('doing some work');
}, 1200);
*/
//pxMobile.debug = require('../../node_modules/debug/browser.js');

/**
 * Logger class provides customized logging to the console.
 * pxdb:http GET http://127.0.0.1:5984/default/ +0ms
 * pxdb:api default +28ms id
 * pxdb:api default +1ms id success 9FA8E5B5-FA51-9A95-901E-E6DD8D6D4B90
 */
export default class Logger {

	constructor(category = 'log', options = {}) {
		this.category = category;

		var defaults = {
			colors: {
				trace: 'color:#7672E6;',
				success: 'color:#288A29;',
				info: 'color:#1F9A2D;',
				warn: 'color:#9E9E23;',
				fatal: 'color:#C057BA;',
				error: 'color:#FC121E;',
				debug: 'color:#7672E6;'
			}
		};
		this.colors = defaults.colors;
		this.options = options;
		return this;
	}

	log(level, args) {
		let timestamp = new Date().toLocaleString();
		var log = (window.console) ? window.console.log.bind(window.console) : function() {};
		log(`[${timestamp}] [${level}] [${this.category}]`, arguments);
	}

	debug(args) {
		return this.log('DEBUG', args);
	}
	info(args) {
		return this.log('INFO', args);
	}

	warn(args) {
		return this.log('WARN', args);
	}

	error(args) {
		return this.log('ERROR', args);
	}

	/**
	 * Log a API method to the console.
	 * @example
		logger.logApi('someMethod', {}, true);
		logger.logApi('someMethod', {}, false);
	 * @param {String} method - The name of the method.
	 * @param {Object} params - The params to log.
	 */
	logApi(method, params, success) {
		if (!params) {
			params = {};
		}
		console.log('%c[%s:api] %s %o', (success ? this.colors.success : this.colors.debug),
			this.category,
			method, params);
	}

	/**
	 * Log a API method to the console.
	 * @example
		logger.logHttp('GET', '/default', true);
		logger.logHttp('PUT', '/default', false);
	 * @param {String} method - The name of the method.
	 * @param {Object} params - The params to log.
	 */
	logHttp(method, url, success) {
		console.log('%c[%s:http] %c%s %c%o', (success ? this.colors.success : this.colors.info), this.category,
			null, method, null, url);
	}

	logTime(name) {
		var start = new Date();
		return {
			end: function() {
				return (new Date().getMilliseconds() - start.getMilliseconds() + 'ms');
			}
		};
	}

}
