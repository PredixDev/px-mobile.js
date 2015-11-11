import BaseClass from '../base';
// TODO: Experiment

/**
 * Simple Router Experiment
 * @example
 // configuration
Router.config({ mode: 'history'});

// returning the user to the initial state
Router.navigate();

// adding routes
Router
.add(/about/, function() {
		console.log('about');
})
.add(/products\/(.*)\/edit\/(.*)/, function() {
		console.log('products', arguments);
})
.add(function() {
		console.log('default');
})
.check('/products/12/edit/22').listen();

// forwarding
Router.navigate('/about');
 */
export default class SimpleRouter extends BaseClass {

	/**
	 * This is the Router class constructor
	 * @constructor
	 * @param {String} name - The name of the router
	 * @param {Object} options - The options for the router
	 */
	constructor(name, options = {
		mode: 'hash',
		root: '/',
		urlPrefix: '!#'
	}) {
		name = name + '.Router';
		super(name, options);

		this._routes = [];
		this.routes = [];
		this.routeMap = {};

		//Could be 'hash' or 'history' showing if we use the History API or not
		this.mode = options.hash;

		//the root URL path of the application. It is needed only if we use pushState.
		this.root = options.root || window.location.href;
		this.debug = options.debug || true;

		this.urlPrefix = options.urlPrefix || '#';

		this.mixin(options);

		this.config(options);

		return this;
	}


	config(options) {
		this.mode = options && options.mode && options.mode === 'history' && !!(history.pushState) ? 'history' : 'hash';
		this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
		if (options && options.routes) {
			for (var route in options.routes) {
				this.add(route, options.routes[route]);
				//	console.warn('Adding route', route);
			}
		}
		return this;
	}
	
	clearSlashes(path) {
		return path.toString().replace(/\/$/, '').replace(/^\//, '');
	}

	getFragment() {
		var fragment = '';
		if (this.mode === 'history') {
			fragment = this.clearSlashes(decodeURI(location.pathname + location.search));
			fragment = fragment.replace(/\?(.*)$/, '');
			fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
		} else {
			var match = window.location.href.match(/#(.*)$/);
			fragment = match ? match[1] : '';
		}
		return this.clearSlashes(fragment);
	}

	/**
	 * Handle adding a route to the Router.
	 * @example
	 * //Code
	 * @param {RegExp} re - Regular expression to match route against.
	 * @param {Function} handler - Callback function to invoke when route matches.
	 * @return {SimpleRouter} Returns instance of the router.
	 */
	add(re, handler) {
			if (typeof re === 'function') {
				handler = re;
				re = '';
			}

			this._routes.push({
				re: re,
				handler: handler
			});
			this.subscribe(re, handler);

			/*
						this.routes[re] = {
							re: re,
							handler: handler
						};
						*/
			return this;
		}
		/**
		 * Handle removing a param from the handler
		 * @example
		 * //Code
		 */
	remove(param) {
			for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
				if (r.handler === param || r.re.toString() === param.toString()) {
					this._routes.splice(i, 1);
					return this;
				}
			}
			return this;
		}
		/**
		 * Handle flusing all the routes.
		 * @example
		 * //Code
		 */
	flush() {
		this._routes = [];
		this.mode = null;
		this.root = '/';
		return this;
	}

	/**
	 * Handle invoking a route which triggers the callback handler.
	 * @example
	 * //Code
	 */
	check(f) {
		var fragment = f || this.getFragment();
		for (var i = 0; i < this._routes.length; i++) {
			var match = fragment.match(this._routes[i].re);
			if (match) {
				match.shift();
				this._routes[i].handler.apply({}, match);
				return this;
			}
		}
		return this;
	}

	/**
	 * Handle starting the route which then listens for changes.
	 * @example
	 * //Code
	 */
	listen() {
		var self = this;
		var current = self.getFragment();
		var fn = function() {
			if (current !== self.getFragment()) {
				current = self.getFragment();
				self.check(current);
			}

		};
		clearInterval(this.interval);
		this.interval = setInterval(fn, 100);
		this.listening = true;
		return this;
	}

	/**
	 * Handle changing the current routes location.
	 * @example
	 * //Code
	 */
	navigate(path) {
		path = path ? path : '';
		this.publish(path);
		if (this.mode === 'history') {
			history.pushState(null, null, this.root + this.clearSlashes(path));
		} else {
			window.location.href.match(/#(.*)$/);
			window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
		}
		return this;
	}


	/**
	 * Create a RegExp Route from a string. Taken from https://github.com/EngineeringMode/Grapnel.js/blob/master/src/grapnel.js#L49
	 * @example
		var router = new px.mobile.Router()
				router._regexRoute('/users/:action/:id', [':action', ':id']);
				=> /^\/users\/(?:([^\/]+?))\/(?:([^\/]+?))\/?$/i

	 * @param {String} path - Path of route
	 * @param {Array} keys - Array of keys to fill
	 * @param {Bool} sensitive - Case sensitive comparison
	 * @param {Bool} strict - Strict mode
	 * @return {RegExp} A new regular expression
	 */
	regexRoute(path, keys, sensitive, strict) {
		if (path instanceof RegExp) {
			return path;
		}
		if (path instanceof Array) {
			path = '(' + path.join('|') + ')';
		}
		path = path.concat(strict ? '' : '/?')
			.replace(/\/\(/g, '(?:/')
			.replace(/\+/g, '__plus__')
			.replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function(_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || (
					format && '([^/.]+?)' || '([^/]+?)')) + ')' + (optional || '');
			})
			.replace(/([\/.])/g, '\\$1')
			.replace(/__plus__/g, '(.+)')
			.replace(/\*/g, '(.*)');

		return new RegExp('^' + path + '$', sensitive ? '' : 'i');
	}

	start() {
		return this.listen();
	}
}
