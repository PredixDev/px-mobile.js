'use strict';
import PubSub from './pubsub';
import RouterHistory from './router-history';
import BaseClass from '../base';


let _instance = null;
let optionalParam = /\((.*?)\)/g;
let namedParam = /(\(\?)?:\w+/g;
let splatParam = /\*\w+/g;
let escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;



/**
 * This is the Router class that handles simple routing.
 * @example
 * var myRouter = new px.mobile.Router('app', {
 *	routes: {
 * '/': routeHandlers.homeRoute,
 *		 '/about': routeHandlers.aboutRoute,
 *		 '/users': routeHandlers.listRoute,
 *		 '/users/:action/:id': routeHandlers.detailRoute
 *	 }
 * });

 "route:[name]" (params) — Fired by the router when a specific route is matched.
 "route" (route, params) — Fired by the router when any route has been matched.
 "route" (router, route, params) — Fired by history when any route has been matched.
 */
export default class Router extends BaseClass {


	/**
	 * Return the ServiceLocator _instance.
	 * @return the _instance.
	 */
	static getInstance() {
		if (_instance == null) {
			_instance = new Router();
		}

		return _instance;
	}


	/**
	 * This is the Router class constructor
	 * @constructor
	 * @param {String} name - The name of the router
	 * @param {Object} options - The options for the router
	 */
	constructor(name, options) {
		name = name + '.Router';
		super(name, options);

		/**
		 * @type {RouterHistory}
		 */
		this.history = new RouterHistory();

		/**
		 * @type {Object} Initial routes
		 */
		this.routes = {

		};

		this.urlPrefix = '#';
		this.mixin(options);
		this.started = false;
		this._setRegexRoutes();

		return this;
	}

	listen() {
		var self = this;
		var current = this.history.getFragment();
		var fn = function() {
			if (current !== self.history.getFragment()) {
				current = self.history.getFragment();
				self.check(current);
			}
		};
		clearInterval(this.interval);
		this.interval = setInterval(fn, 50);
		return this;
	}

	check(f) {
		var fragment = f || this.history.getFragment();

		for (var i = 0; i < this.routesRegex.length; i++) {
			var match = fragment.match(this.routesRegex[i].regexp);
			if (match) {
				match.shift();
				this.routesRegex[i].success.apply({}, match);
				return this;
			}
		}
		return this;
	}

	/**
	 * Handle starting the router and setting up listeners.
	 */
	start() {
		this.log.logApi('2. start', this);
		if ('onhashchange' in window) {
			this.log.logApi('3. onhashchange', 'The browser supports the hashchange event!');
			this.started = true;
			window.addEventListener('hashchange', (e) => {
				this._handleRoute(e);
			}, this);

		} else {
			//console.error('Hashchange not availble');
		}
		return this;
	}

	/**
	 * Execute a route handler with the provided parameters.
	 * @param {Function} callback - The callback function to invoke
	 * @param {*} args - The arguments to pass to the callback
	 * @param {String} name - The name of the route
	 */
	execute(callback, args, name) {
		//PubSub.emit(name, args);
		this.log.logApi('execute =>' + name, args);
		if (callback) {
			callback.apply(this, args);
		}
		return this;
	}


	/**
	 * Navigate to a route passing options
	 * @example
	 * myRouter.navigate('/login');
	 * @param {String} route - The route to Navigate to
	 * @param {Object} options - The options to pass to the route handler
	 */
	navigate(route, options) {
		this.log.logApi('navigate =>' + route, options);
		/*
		PubSub.emit('route:before', {
			route, options
		});
*/
		this.history.go(route, options);

		return this;
	}

	/**
	 * Trigger callback when route is found
	 * @example
	 *	myRouter.on('/users/:action/:id', function(req, res) {
	 * 		expect(req).toBeDefined();
	 * 		expect(res).toBeDefined();
	 * 		expect(req.url).toBe(window.location.origin + '/users/edit/99');
	 * 		expect(req.pathname).toBe('/users/edit/99');
	 * 		expect(req.params.action).toBe('edit');
	 * 		expect(req.params.id).toBe('99');
	 * });
	 * myRouter.navigate('/users/edit/99', {
	 * 		data: testObj
	 * });
	 * @param {String} route - The route to watch
	 * @param {Function} options - The route options
	 */
	on(route, options) {
		this.subscribe(route, options);
		this.log.logApi('5. on -' + route, options);
		this.routes[route] = options;
		this._setRegexRoutes();
		return this;
	}

	/**
	 * Promise based route handler, use this to add routes that resolve a promise when matched.
	 * @param {String} route - The route to match.
	 * @return {Promise} A promise that is resolved when matched.
	 */
	when(route) {
		this.log.logApi('4. when', route);
		var _this = this;
		return new Promise(function(resolve, reject) {
			_this.on(route, {
				callback: function(req, res) {
					resolve(req, res);
				}
			});
		});
	}


	/**
	 * Manually bind a single named route to a callback. For example:
	 *
	 * // Matches #page/10, passing "10"
	 * this.route("page/:number", "page", function(number){ ... });
	 *
	 * // Matches /117-a/b/c/open, passing "117-a/b/c" to this.open
	 * this.route(/^(.*?)\/open$/, "open");
	 */
	route(route, name, callback) {
		this.log.logApi('route', route);
		return this;
	}

	/**
	 * I handle the routing when the location.hash changes.
	 */
	_handleRoute(e) {
		var _this = this;
		this.log.logApi('_handleRoute', e);
		var _hash = location.hash.replace(/^#\/|\/$/gi, '/');
		var parser = document.createElement('a');
		parser.href = _hash;
		var _routeObj = null;
		var res = {};
		var req = {
			hostname: parser.hostname,
			host: parser.host,
			port: parser.port,
			protocol: parser.protocol,
			pathname: parser.pathname,
			hash: parser.hash,
			url: parser.href,
			query: parser.search,
			params: {}, //needs to be routes named params keys and value the values
			data: {} //Needs to be any other data sent along
		};

		req.query = this._getUrlQuery(parser.href);

		//Loop each regex route and match against hash, if match, invoke route handler function.
		for (var i = 0; i < this.routesRegex.length; i++) {
			_routeObj = this.routesRegex[i];

			//Test if route matches registered route
			if (_routeObj.regexp.test(_hash)) {
				_routeObj.current = _hash;

				_routeObj = this._setRouteParams(_routeObj);

				//setup request params / and data
				req.params = _routeObj.params;

				//Log
				this.log.logApi(_hash, _routeObj);


				_this.publish('route:change', {
					_routeObj, req, res
				});

				//Execute route handler
				this.execute(_routeObj.success, [req, res], _hash);
			} else {

				this.execute(_routeObj.error, [req, res], _hash);
			}
		}
	}

	/**
	 * I handle building the regular expressions from the route patterns.
	 */
	_setRegexRoutes() {
		var _out = [],
			_routeParams = [],
			_reg, _routeObj;

		var routeHandler = null;
		var routeErrorHandler = function() {};
		var routeSuccessHandler = function() {};
		var routeResolver = null;

		this.log.logApi('1. registerRoutes', this.routes);
		for (var _route in this.routes) {


			// TODO: Route handler can be a function or object
			if (this.utils.type(this.routes[_route]) === 'function') {
				routeSuccessHandler = this.routes[_route];
			}

			// TODO:	If object, make sure callback prop exists,
			if (this.utils.type(this.routes[_route]) === 'object') {

				if (this.routes[_route].error) {
					routeErrorHandler.bind(this.routes[_route].error);
				}
				if (this.routes[_route].success) {
					routeSuccessHandler.bind(this.routes[_route].success);
				}



				console.warn('Found route callback');

				if (this.routes[_route].resolve) {
					routeSuccessHandler = this.routes[_route].resolve;
					console.warn('Found route resolver');
				}
			}

			// TODO: if object.resolve (Ensure objects key is added to params once resolved.)
			_routeParams = _route.replace('/', '').split('/');
			_reg = this._regexRoute(_route, _routeParams);
			_routeObj = {
				regexp: _reg,
				route: _route,
				success: routeSuccessHandler,
				error: routeErrorHandler
			};
			_out.push(_routeObj);
			//this.log.logApi('setRegexRoutes', _routeObj);
		}
		this.routesRegex = _out;
		return _out;
	}

	/**
	 * I handle taking a regex route pattern and the route and returning the matches key:value pair object.
	 * @param {Object} routeObj - The route object to set
	 * @return {Object} A route object map of name/value pairs
	 */
	_setRouteParams(routeObj) {
		var normalized = routeObj.route.replace(/\:/g, '');
		var m1 = routeObj.regexp.exec(normalized);
		var m2 = routeObj.regexp.exec(routeObj.current);
		var params = {};
		for (var i = 1; i < m1.length; i++) {
			params[m1[i]] = m2[i];
		}
		routeObj.params = params;
		return routeObj;
	}

	/**
	 * I handle parsing a url string and returning the query object.
	 * @param {String} url - The url to parse
	 * @return {Object} A object map of name/value pairs
	 */
	_getUrlQuery(url) {
		var re = /(?:\?|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g,
			match,
			params = {};

		if (typeof url === 'undefined') {
			url = window.location.href;
		}
		var decode = function(s) {
			return decodeURIComponent(s.replace(/\+/g, ' '));
		};
		while (match = re.exec(url)) {
			params[decode(match[1])] = decode(match[2]);
		}

		this.log.logApi('getUrlQuery', url);
		return params;
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
	_regexRoute(path, keys, sensitive, strict) {
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



	// TODO:
	/*

	// Set pages classess for animationEnd
		 animatePages: function (leftPage, rightPage, direction, view) {
				 // Loading new page
				 var removeClasses = 'page-on-center page-on-right page-on-left';
				 if (direction === 'to-left') {
						 leftPage.removeClass(removeClasses).addClass('page-from-center-to-left');
						 rightPage.removeClass(removeClasses).addClass('page-from-right-to-center');
				 }
				 // Go back
				 if (direction === 'to-right') {
						 leftPage.removeClass(removeClasses).addClass('page-from-left-to-center');
						 rightPage.removeClass(removeClasses).addClass('page-from-center-to-right');

				 }
		 },

	*/

}
