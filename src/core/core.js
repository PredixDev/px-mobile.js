'use strict';
var extensions = {};
import BaseClass from '../base';
/**
 * The Core class.
 * @example
 Core.register('some-module', function(sandbox) {
	 return {
		 init: function() {
			 console.log('starting some-module');
		 }
	 }
 });
 Core.start('some-module');
 * @class Core
 */
export default class Core extends BaseClass {
	/**
	 * The constructor of Core
	 *
	 * @class Core
	 * @constructor
	 */
	constructor(name, options) {
		super(name, options);
		this.modules = {};
		this.messages = {
			'!start': 'Could not start the given module, its either already started or is not registered: ',
			'!stop': 'Could not stop the given module, its either already stopped or is not registered: ',
			'!!module': 'Cant register an already registered module: ',
			'!!listen': 'Theres already an listen handler to the notification: '
		};
		return this;
	}

	/**
	 * Registers a new module
	 *
	 * @method register
	 * @param {string} module the name of the new module
	 * @param {function} constructor the constructor of the new module
	 */
	register(module, constructor) {
		if (this.modules[module]) {
			this.helpers.err('!!module', module);
			return false;
		}
		this.modules[module] = {
			constructor: constructor,
			instance: null
		};
	}

	/**
	 * Check if the module is already initialized or not
	 *
	 * @method moduleCheck
	 * @param {string} module the name of the module that will be checked
	 * @param {boolean} destroy check if the module exists, but is already destroyed
	 * @return {boolean} if the module exists or already have an instance
	 */
	moduleCheck(module, destroy) {
		if (destroy) {
			return !module || !module.instance;
		}

		return !module || module.instance;
	}

	/**
	 * Starts a registered module, if no module is passed, it starts all modules
	 *
	 * @method start
	 * @param {string} module the name of the module
	 */
	start(module) {
		if (!module) {
			return this.startAll();
		}

		var cModule = this.modules[module],
			el = this.getElement(module);

		if (this.moduleCheck(cModule)) {
			this.helpers.err('!start', module);
			return false;
		}

		cModule.instance = new cModule.constructor(new this.Sandbox(module));

		// attachs the element to the instance of the module
		cModule.instance.el = el;

		if (cModule.instance.init) {
			return cModule.instance.init();
		}
	}


	/**
	 * Stops a registered module
	 *
	 * @method start
	 * @param {string} module the name of the module
	 */
	stop(module) {
		if (!module) {
			return this.stopAll();
		}

		var cModule = this.modules[module],
			stopReturn;

		if (this.moduleCheck(cModule, true)) {
			this.helpers.err('!stop', module);
			return false;
		}

		if (cModule.instance.destroy) {
			stopReturn = cModule.instance.destroy();
		}

		cModule.instance = null;

		this.Sandbox.clearNotifications(module);

		return stopReturn;
	}

	/**
	 * Stop all started modules
	 *
	 * @method stopAll
	 */
	stopAll() {
		this.xAll('stop');
	}

	/**
	 * Stop all started modules
	 *
	 * @method stopAll
	 */
	startAll() {
		this.xAll('start');
	}

	/**
	 * Helper for startAll and stopAll
	 *
	 * @method xAll
	 * @param {string} method the method that will be triggered
	 */
	xAll(method) {
			for (var module in this.modules) {
				if (this.modules.hasOwnProperty(module)) {
					this[method](module);
				}
			}
		}

		/**

		 * Gets an element by ID to attach to the module instance
		 *
		 * @method getElement
		 * @param {string} id the id of the main element in the module
		 */
	getElement(id) {
		var el = document.getElementById(id);

		// this fixes some blackberry, opera and IE possible bugs
		return (el && el.id === id && el.parentElement) ? el : null;
	}


	/**
	 * helpers/err.js - Handles error messages
	 *
	 * @method err
	 * @param {string} error the type of the error
	 * @param {function} message the complementary message to the error
	 */
	err(error, message) {
		this.helpers.log(`${err.messages[error]} - ${message}`);
	}

	/**
	 * Extends core functionalities
	 *
	 * @method extend
	 * @param {string} name the name of the extension
	 * @param {function | array | boolean | string | number} implementation what the extension does
	 */
	static extend(name, implementation) {
		extensions[name] = implementation;
	}

	/**
	 * returns the extension
	 *
	 * @method getExtension
	 * @param {string} extension the name of the extension
	 * @return {function | array | boolean | string | number} the implementation of the extension
	 */
	static getExtension(extension) {
		return extensions[extension] || null;
	}
}
