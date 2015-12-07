export function resolveURL() {
	var base, i, key, len, path, queryString, value;
	base = arguments[0];
	len = arguments.length;
	queryString = '';
	i = 1;
	while (i < len) {
		path = arguments[i];
		if (!path) {
			i++;
			continue;
		}
		if (typeof path === 'object') {

			/*jshint -W089 */
			for (key in path) {
				if (queryString.length > 0) {
					queryString += '&';
				}
				value = path[key];
				queryString += key + '=' + value;
				i++;
			}
			continue;
		}
		if (path && path.indexOf('/') !== 0) {
			path = '/' + path;
		}
		if (base.substr(base.length - 1) === '/') {
			base = base.substr(0, base.length - 1);
		}
		base += path;
		i++;
	}
	if (queryString.length > 0) {
		base += '?' + queryString;
	}
	return base;
}


export function extend(dest, src) {
	var out = dest;
	for (var i in src) {
		out[i] = src[i];
	}
	return out;
}
export function extendDeep(parent, child) {
	var i, toStr = Object.prototype.toString,
		astr = '[object Array]';
	child = child || {};
	for (i in parent) {
		if (parent.hasOwnProperty(i)) {
			if (typeof parent[i] === 'object') {
				child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
				extendDeep(parent[i], child[i]);
			} else {
				child[i] = parent[i];
			}
		}
	}
	return child;
}

//https://coffeescript-cookbook.github.io/chapters/classes_and_objects/mixins
export function extendClass(child, parent) {
	var hasProp = {}.hasOwnProperty;
	for (var key in parent) {
		if (hasProp.call(parent, key)) {
			child[key] = parent[key];
		}
	}
	/* jshint ignore:start */
	function ctor() {
		this.constructor = child;
	}
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	child.__super__ = parent.prototype;
	/* jshint ignore:end */
	return child;
}



/**
 This function was modeled on jQuery's $.type function.
 https://coffeescript-cookbook.github.io/chapters/classes_and_objects/type-function
 */
export function type(obj) {
	var classToType;
	if (obj === void 0 || obj === null) {
		return String(obj);
	}
	classToType = {
		'[object Boolean]': 'boolean',
		'[object Number]': 'number',
		'[object String]': 'string',
		'[object Function]': 'function',
		'[object Array]': 'array',
		'[object Date]': 'date',
		'[object RegExp]': 'regexp',
		'[object Object]': 'object'
	};
	return classToType[Object.prototype.toString.call(obj)];
}



//http://www.joezimjs.com/javascript/javascript-mixins-functional-inheritance/
export function addMixin(obj, mixin) {
	return this.extend(mixin, obj);
}

export function debounce(name, func, wait, immediate) {
	var timeout;
	return function() {
		var context = this,
			args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) {
				func.apply(context, args);
			}
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) {
			func.apply(context, args);
		}
	};
}
export function mixin(target, source) {
	target = target.prototype;
	source = source.prototype;

	Object.getOwnPropertyNames(source).forEach(function(name) {
		if (name !== 'constructor') {
			Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
		}
	});
}

export function mix() {
	var arg, prop, child = {};
	for (arg = 0; arg < arguments.length; arg += 1) {
		for (prop in arguments[arg]) {
			if (arguments[arg].hasOwnProperty(prop)) {
				child[prop] = arguments[arg][prop];
			}
		}
	}
	return child;
}



/*!
 Math.uuid.js (v1.4)
 http://www.broofa.com
 mailto:robert@broofa.com
 Copyright (c) 2010 Robert Kieffer
 Dual licensed under the MIT and GPL licenses.
 */

/*
 * Generate a random uuid.
 *
 * USAGE: Math.uuid(length, radix)
 *	 length - the desired number of characters
 *	 radix	- the number of allowable values for each character.
 *
 * EXAMPLES:
 *	 // No arguments	- returns RFC4122, version 4 ID
 *	 >>> Math.uuid()
 *	 "92329D39-6F5C-4520-ABFC-AAB64544E172"
 *
 *	 // One argument - returns ID of the specified length
 *	 >>> Math.uuid(15)		 // 15 character ID (default base=62)
 *	 "VcydxgltxrVZSTV"
 *
 *	 // Two arguments - returns ID of the specified length, and radix.
 *	 // (Radix must be <= 62)
 *	 >>> Math.uuid(8, 2)	// 8 character ID (base=2)
 *	 "01001010"
 *	 >>> Math.uuid(8, 10) // 8 character ID (base=10)
 *	 "47473046"
 *	 >>> Math.uuid(8, 16) // 8 character ID (base=16)
 *	 "098F4D35"
 */
var chars = (
	'0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
	'abcdefghijklmnopqrstuvwxyz'
).split('');

function getValue(radix) {
	return 0 | Math.random() * radix;
}
export function uuid(len, radix) {
	radix = radix || chars.length;
	var out = '';
	var i = -1;

	if (len) {
		// Compact form
		while (++i < len) {
			out += chars[getValue(radix)];
		}
		return out;
	}
	// rfc4122, version 4 form
	// Fill in random data.	At i==19 set the high bits of clock sequence as
	// per rfc4122, sec. 4.1.5
	while (++i < 36) {
		switch (i) {
			case 8:
			case 13:
			case 18:
			case 23:
				out += '-';
				break;
			case 19:
				out += chars[(getValue(16) & 0x3) | 0x8];
				break;
			default:
				out += chars[getValue(16)];
		}
	}

	return out;
}



//http://jscriptpatterns.blogspot.com/2013/01/javascript-interfaces.html
/**
 Usage:
 var IExample = new Interface('Example', ['add', 'remove', 'get']);
 var ExampleClass = {
	add: function(){},
	remove: function(){},
	get: function(){}
};
 Interface.ensureImplements(ExampleClass, IExample)
 */
// Constructor.
function Interface(name, methods) {

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

// Static class method.
Interface.ensureImplements = function(object) {
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
};


/**
 * I handle mixing classes. This generic aggregation function is usually provided by a library like this one, of course]
 */
export var aggregation = (baseClass, ...mixins) => {
	let base = class _Combined extends baseClass {
		constructor(...args) {
			super(...args);
			mixins.forEach((mixin) => {
				mixin.prototype.initializer.call(this);
			});
		}
	};
	let copyProps = (target, source) => {
		Object.getOwnPropertyNames(source)
			.concat(Object.getOwnPropertySymbols(source))
			.forEach((prop) => {
				if (prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
					return;
				}

				Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
			});
	};
	mixins.forEach((mixin) => {
		copyProps(base.prototype, mixin.prototype);
		copyProps(base, mixin);
	});
	return base;
};
