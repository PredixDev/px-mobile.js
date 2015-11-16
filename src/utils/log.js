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
/**
 * Logger class provides logging functionality.
 */
export default class Logger {

	constructor(category = 'log', options = {}) {
		this.category = category;

		var defaults = {
			colors: {
				trace: 'color:#7672E6;',
				success: 'color:#46AD00;',
				info: 'color:#005CB9;',
				warn: 'color:#FF9821;',
				fatal: 'color:#C057BA;',
				error: 'color:#E32533;',
				debug: 'color:#005CB9;'
			}
		};
		this.colors = defaults.colors;
		this.options = options;
		this.debugEnabled = options.debugEnabled || false;
		return this;
	}

	log(level, args) {
		let timestamp = new Date().toLocaleString();
		var log = (window.console) ? window.console.log.bind(window.console) : function() {};
		if (this.debugEnabled) {
			log(`[${timestamp}] [${level}] [${this.category}]`, arguments);
		}
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
	 * @param {Boolean} success - If the call is successfull
	 */
	logApi(method, params, success) {
		if (!params) {
			params = {};
		}

		if(this.debugEnabled){
			console.log('%c[%s:api] %s %o', (success ? this.colors.success : this.colors.debug),
				this.category,
				method, params);
		}
	}

	/**
	 * Log a API method to the console.
	 * @example
		logger.logHttp('GET', '/default', true);
		logger.logHttp('PUT', '/default', false);
	 * @param {String} method - The name of the method.
	 * @param {Object} params - The params to log.
	 * @param {Boolean} success - If the call is successfull
	 */
	logHttp(method, url, success) {
		if (this.debugEnabled) {
			console.log('%c[%s:http] %c%s %c%o', (success ? this.colors.success : this.colors.info), this.category,
				null, method, null, url);
		}

	}

	/**
	 * Log a timestamp to the console.
	 * @param {String} name - The name of the timed log.
	 */
	logTime(name) {
		var start = new Date();
		return {
			end: function() {
				return (new Date().getMilliseconds() - start.getMilliseconds() + 'ms');
			}
		};
	}

}
