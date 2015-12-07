/**
 * @description Taken from http://jscriptpatterns.blogspot.com/2013/01/javascript-interfaces.html
 * @example
 var IExample = new Interface('Example', ['add', 'remove', 'get']);
 var ExampleClass = {
		add: function(){},
		remove: function(){},
		get: function(){}
	};
	Interface.ensureImplements(ExampleClass, IExample)
 @param {String} name The name of the interface
 @param {methods} Array The methods the class object must implement
 */
export default class Interface{

	constructor(name, methods) {

		if (arguments.length !== 2) {
			throw new Error("Interface constructor called with " + arguments.length + "arguments, but expected exactly 2.");
		}

		this.name = name;
		this.methods = [];

			for (var i = 0, len = methods.length; i < len; i++) {
				if (typeof methods[i] !== 'string') {
					throw new Error("Interface constructor expects method names to be passed in as a string.");
				}

				this.methods.push(methods[i]);
			}
	}

	/**
	 * @description Handle ensuring a object implements the specified interface.
	 * @param {Object} object The objects to verify
	 * @returns {boolean}
	 */
	static ensureImplements(object) {
		if (arguments.length < 2) {
			throw new Error('Function Interface.ensureImplements called with ' + arguments.length +
			'arguments, but expected at least 2.');
		}

		for (var i = 1, len = arguments.length; i < len; i++) {
			var _interface = arguments[i];
			if (_interface.constructor !== Interface) {
				throw new Error(
					'Function Interface.ensureImplements expects arguments two and above to be instances of Interface.');
			}

			for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
				var method = _interface.methods[j];
				if (!object[method] || typeof object[method] !== 'function') {
					throw new Error('Function Interface.ensureImplements: object does not implement the ' + _interface.name +
					' interface. Method ' + method + ' was not found. ');
				}
			}
		}
		return true;
	}

}
