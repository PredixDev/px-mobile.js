'use strict';
/**
 * dom class provides various utility methods on a document element.
 * @example
 * var $ = selector => new DOM(selector);
 */
export default class DOM {
	constructor(selector, context) {
		console.time('dom');
		var matches = {
			'#': 'getElementById',
			'.': 'getElementsByClassName',
			'@': 'getElementsByName',
			'=': 'getElementsByTagName',
			'*': 'querySelectorAll'
		};
		var match = matches[selector[0]];
		if (!match) {
			match = 'querySelectorAll';
		}
		var out = null,
			el;

		try {
			el = (((context === undefined) ? document : context)[matches](selector.slice(1)));
			out = ((el.length < 2) ? el[0] : el);

		} catch (err) {

		}
		this.length = el.length || 0;
		Object.assign(this, out);
		return this;
	}

	find(selector, context) {

	}



	clone() {

		}
		/**
		 * @param {Function} callback A callback to call on each element
		 */
	each(callback) {
		// convert this to Array to use for...of
		for (let el of Array.from(this)) {
			callback.call(el);
		}
		return this;
	}

	/**
	 * Add a class to selected elements
	 * @param {String} className The class name to add
	 */
	addClass(className) {
		return this.each(function() {
			if (this.classList) {
				this.classList.add(className);
			} else {
				this.className += ' ' + className;
			}
		});
	}

	/**
	 * Remove a class from selected elements
	 * @param {String} className The class name to remove
	 */
	removeClass(className) {
		return this.each(function() {
			this.classList.remove(className);
		});
	}

	/**
	 * Check to see if the element has a class
	 * (Note: Only checks the first elements if more than one is selected)
	 * @param {String} className The class name to check
	 */
	hasClass(className) {
		if (this.classList) {
			return this.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
		}
	}

	toggleClass(className) {
		var el = this;
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0) {
				classes.splice(existingIndex, 1);
			} else {
				classes.push(className);
			}
			el.className = classes.join(' ');
		}
	}

	css(prop, value) {
		if (value) {
			this.style[prop] = value;
			return this;
		} else if (prop) {
			return this.style[prop];
		} else {
			return this.style;
		}
	}

	attr(name, value) {
		name = name.toLowerCase();

		if (value) {
			this.setAttribute(name, value);
			return this;
		} else {
			return this.getAttribute(name);
		}
	}

	data(name, value) {
		if (value) {
			this.setAttribute('data-' + name, value);
			return this;
		} else {
			return this.getAttribute('data-' + name);
		}
	}

	on(event, callback) {
		return this.each(function() {
			this.addEventListener(event, callback, false);
		});
	}

	_on(eventName, eventHandler) {
		eventType = eventType.split(' ');
		for (var i = 0; i < eventType.length; i++) {
			this.addEventListener(eventType[i], callback);
		}
		return this;
	}

	off(eventName, eventHandler) {
		this.removeEventListener(eventName, eventHandler);
	}

	trigger(eventName, eventData) {
		var event;
		if (window.CustomEvent) {
			event = new CustomEvent(eventName, {
				detail: eventData
			});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, eventData);
		}
		return this.dispatchEvent(event);
	}

	empty() {
		this.innerHTML = '';
		return this;
	}

	html(html) {
		if (html) {
			this.innerHTML = html;
			return this;
		} else {
			return this.innerHTML;
		}
	}

	text(text) {
		if (text) {
			this.textContent = text;
			return this;
		} else {
			return this.textContent;
		}
	}
	next() {
		return this.nextElementSibling;
	}
	prev() {

	}
	parent() {
		return this.parentNode;
	}
	child() {

	}
	position() {

	}
}



var dom = function(selector, context, undefined) {


	var matches = {
		'#': 'getElementById',
		'.': 'getElementsByClassName',
		'@': 'getElementsByName',
		'=': 'getElementsByTagName',
		'*': 'querySelectorAll'
	}[selector[0]];

	//console.warn('dom()', matches, selector);
	var out = null,
		el;
	try {
		el = (((context === undefined) ? document : context)[matches](selector.slice(1)));
		out = ((el.length < 2) ? el[0] : el);
		//console.warn('found', el);
	} catch (err) {
		//console.error('error', selector, 'not found');
	}

	return out;
};

//dom.extend({}, objA, objB);
dom.extend = function(out) {
	out = out || {};
	for (var i = 1; i < arguments.length; i++) {
		if (!arguments[i]) {
			continue;
		}
		for (var key in arguments[i]) {
			if (arguments[i].hasOwnProperty(key)) {
				out[key] = arguments[i][key];
			}
		}
	}
	return out;
};



// TODO: Extend Element on Window.
(function(win) {

	/* Keep source code the same */
	if (!win || !win.Element) {
		return;
	}

	//dom('#iddiv').find('.inside')
	win.Element.prototype.find = function(selector) {
		return dom(selector, this);
	};

	win.Element.prototype.append = function(el) {
		return this.appendChild(el);
	};

	//dom(el).clone()
	win.Element.prototype.clone = function() {
		return this.cloneNode(true);
	};

	//dom(el).hasClass(name)
	window.Element.prototype.hasClass = function(className) {
		if (this.classList) {
			return this.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
		}
	};

	//dom(el).addClass(name)
	win.Element.prototype.addClass = function(className) {
		var classes = className.split(' ');
		for (var i = 0; i < classes.length; i++) {
			if (this.classList) {
				this.classList.add(classes[i]);
			} else {
				this.className += ' ' + classes[i];
			}
		}
		return this;
	};

	//dom(el).removeClass(name)
	win.Element.prototype.removeClass = function(className) {
		var el = this;
		if (el.classList && className) {
			el.classList.remove(className);
		} else if (el.classList && !className) {
			el.classList.forEach(function(cla) {
				el.removeClass(cla);
			});
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		return this;
	};

	//dom(el).toggleClass(name)
	win.Element.prototype.toggleClass = function(className) {
		var el = this;
		if (el.classList) {
			el.classList.toggle(className);
		} else {
			var classes = el.className.split(' ');
			var existingIndex = classes.indexOf(className);

			if (existingIndex >= 0) {
				classes.splice(existingIndex, 1);
			} else {
				classes.push(className);
			}
			el.className = classes.join(' ');
		}
	};

	//dom().css('prop', 'value') support
	win.Element.prototype.css = function(prop, value) {
		if (value) {
			this.style[prop] = value;
			return this;
		} else if (prop) {
			return this.style[prop];
		} else {
			return this.style;
		}
	};

	//dom(selector).attr('prop', 'value')
	win.Element.prototype.attr = function(name, value) {
		name = name.toLowerCase();

		if (value) {
			this.setAttribute(name, value);
			return this;
		} else {
			return this.getAttribute(name);
		}
	};

	win.Element.prototype.data = function(name, value) {
		if (value) {
			this.setAttribute('data-' + name, value);
			return this;
		} else {
			return this.getAttribute('data-' + name);
		}
	};



	win.Element.prototype.on = function(eventType, callback) {
		eventType = eventType.split(' ');
		for (var i = 0; i < eventType.length; i++) {
			this.addEventListener(eventType[i], callback);
		}
		return this;
	};

	//px.mobile.dom('#sandbox').off('click', handler);
	win.Element.prototype.off = function(eventName, eventHandler) {
		this.removeEventListener(eventName, eventHandler);
	};


	//px.mobile.dom('#sandbox').trigger('custom-event', {name: 'value'});
	win.Element.prototype.trigger = function(eventName, eventData) {
		var event;
		if (
			win.CustomEvent) {
			event = new CustomEvent(eventName, {
				detail: eventData
			});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, eventData);
		}
		return this.dispatchEvent(event);
	};


	//dom(el).empty();
	win.Element.prototype.empty = function() {
		this.innerHTML = '';
		return this;
	};

	//dom(el).html();
	win.Element.prototype.html = function(html) {
		if (html) {
			this.innerHTML = html;
			return this;
		} else {
			return this.innerHTML;
		}
	};

	//dom(el).text();
	win.Element.prototype.text = function(text) {
		if (text) {
			this.textContent = text;
			return this;
		} else {
			return this.textContent;
		}
	};

	//dom(el).next();
	win.Element.prototype.next = function() {
		return this.nextElementSibling;
	};

	//dom(el).parent();
	win.Element.prototype.parent = function() {
		return this.parentNode;
	};

	//dom(el).remove();
	win.Element.prototype.remove = function() {
		return this.parentNode.removeChild(this);
	};

	win.Element.prototype.child = function(el) {
		if (el) {
			return this.querySelectorAll(el);
		} else {
			return this.children;
		}
	};

	//dom(el).position();
	win.Element.prototype.position = function() {
		var pos = {
			left: this.offsetLeft,
			top: this.offsetTop
		};
		return pos;
	};

	// TODO: Extend nodelist

	//dom().addClass('name');
	win.NodeList.prototype.addClass = function(name) {
		this.each(function(el) {
			el.classList.add(name);
		});
		return this;
	};

	// $().removeClass('name');
	win.NodeList.prototype.removeClass = function(name) {
		this.each(function(el) {
			el.classList.remove(name);
		});
		return this;
	};



	// doing a find in a NodeList doesnt really work. I had a function that
	// would look inside and get the element but it was pretty big and
	// required recusive searching inside NodeLists. So I would suggest just
	// using a '*' selection method
	win.NodeList.prototype.find = function find(elem) {
		console.error('You cannot find in a NodeList. Just use $(*selector %s)', elem);
		return this;
	};

	// another useful one for doing $('.inside').each()
	win.NodeList.prototype.each = Array.prototype.forEach;


	win.NodeList.prototype.attr = function(name, value) {
		this.each(function(el) {
			if (value) {
				el.setAttribute(name, value);
			} else {
				return el.getAttribute(name);
			}
		});
		return this;
	};

	win.NodeList.prototype.toggleClass = function(className) {
		this.each(function(el) {
			el.toggleClass(className);
		});
		return this;
	};


	win.NodeList.prototype.css = function(prop, value) {
		this.each(function(el) {
			el.css(prop, value);
		});
		return this;
	};



	win.NodeList.prototype.on = function(eventType, callback) {
		this.each(function(el) {
			el.on(eventType, callback);
		});
		return this;
	};



	win.NodeList.prototype.first = function() {
		return (this.length < 2) ? this : this[0];
	};

	win.NodeList.prototype.last = function() {
		// if there are many items, return the last
		return (this.length > 1) ? this[this.length - 1] : this;
	};


})(typeof window == "undefined" ? global : window);


export var $ = selector => dom(selector);
export default dom;
