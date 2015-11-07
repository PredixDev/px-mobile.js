(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsUtils = require('./utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsLog = require('./utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _corePubsub = require('./core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var BaseClass = (function () {
	function BaseClass(name, options) {
		_classCallCheck(this, BaseClass);

		this.utils = utils;
		this._id = name || utils.uuid();
		this.log = new _utilsLog2['default'](name, {
			colors: {
				debug: 'color:blue'
			}
		});
		this.mixin(new _corePubsub2['default'](name, options));
		this.mixin(options);
		return this;
	}

	_createClass(BaseClass, [{
		key: 'mixin',
		value: function mixin(klass) {
			this.utils.addMixin(klass, this);
		}
	}], [{
		key: 'extend',
		value: function extend(obj) {
			return utils.extendClass(obj, this);
		}
	}]);

	return BaseClass;
})();

exports['default'] = BaseClass;
module.exports = exports['default'];
},{"./core/pubsub":3,"./utils/log":25,"./utils/utils":26}],2:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var extensions = {};

var Core = (function (_BaseClass) {
	_inherits(Core, _BaseClass);

	function Core(name, options) {
		_classCallCheck(this, Core);

		_get(Object.getPrototypeOf(Core.prototype), 'constructor', this).call(this, name, options);
		this.modules = {};
		this.messages = {
			'!start': 'Could not start the given module, its either already started or is not registered: ',
			'!stop': 'Could not stop the given module, its either already stopped or is not registered: ',
			'!!module': 'Cant register an already registered module: ',
			'!!listen': 'Theres already an listen handler to the notification: '
		};
		return this;
	}

	_createClass(Core, [{
		key: 'register',
		value: function register(module, constructor) {
			if (this.modules[module]) {
				this.helpers.err('!!module', module);
				return false;
			}
			this.modules[module] = {
				constructor: constructor,
				instance: null
			};
		}
	}, {
		key: 'moduleCheck',
		value: function moduleCheck(module, destroy) {
			if (destroy) {
				return !module || !module.instance;
			}

			return !module || module.instance;
		}
	}, {
		key: 'start',
		value: function start(module) {
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

			cModule.instance.el = el;

			if (cModule.instance.init) {
				return cModule.instance.init();
			}
		}
	}, {
		key: 'stop',
		value: function stop(module) {
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
	}, {
		key: 'stopAll',
		value: function stopAll() {
			this.xAll('stop');
		}
	}, {
		key: 'startAll',
		value: function startAll() {
			this.xAll('start');
		}
	}, {
		key: 'xAll',
		value: function xAll(method) {
			for (var module in this.modules) {
				if (this.modules.hasOwnProperty(module)) {
					this[method](module);
				}
			}
		}
	}, {
		key: 'getElement',
		value: function getElement(id) {
			var el = document.getElementById(id);

			return el && el.id === id && el.parentElement ? el : null;
		}
	}, {
		key: 'err',
		value: (function (_err) {
			function err(_x, _x2) {
				return _err.apply(this, arguments);
			}

			err.toString = function () {
				return _err.toString();
			};

			return err;
		})(function (error, message) {
			this.helpers.log(err.messages[error] + ' - ' + message);
		})
	}], [{
		key: 'extend',
		value: function extend(name, implementation) {
			extensions[name] = implementation;
		}
	}, {
		key: 'getExtension',
		value: function getExtension(extension) {
			return extensions[extension] || null;
		}
	}]);

	return Core;
})(_base2['default']);

exports['default'] = Core;
module.exports = exports['default'];
},{"../base":1}],3:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsDom = require('../utils/dom');

var _utilsDom2 = _interopRequireDefault(_utilsDom);

var PubSub = (function () {
	function PubSub() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'pubsub' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, PubSub);

		this.log = new _utilsLog2['default'](name, {
			colors: {
				debug: 'color:orange'
			}
		});

		this.topics = {};

		this.subUid = -1;
		return this;
	}

	_createClass(PubSub, [{
		key: 'start',
		value: function start() {}
	}, {
		key: 'publish',
		value: function publish(topic, args) {
			var topics = this.topics;

			if (!topics[topic]) {
				return false;
			}

			var subscribers = topics[topic],
			    len = subscribers ? subscribers.length : 0;

			while (len--) {
				subscribers[len].func(topic, args);
			}

			return this;
		}
	}, {
		key: 'subscribe',
		value: function subscribe(topic, fn) {
			var topics = this.topics;

			if (!topics[topic]) {
				topics[topic] = [];
			}

			var token = (++this.subUid).toString();

			this.topics[topic].push({
				token: token,
				func: fn
			});
			return token;
		}
	}, {
		key: 'unsubscribe',
		value: function unsubscribe(token) {
			var topics = this.topics;
			for (var m in topics) {
				if (topics[m]) {
					for (var i = 0, j = topics[m].length; i < j; i++) {
						if (topics[m][i].token === token) {
							topics[m].splice(i, 1);
							return token;
						}
					}
				}
			}
			return this;
		}
	}], [{
		key: 'emit',
		value: function emit(event, data) {
			return (0, _utilsDom2['default'])('*body').trigger(event, data);
		}
	}, {
		key: 'on',
		value: function on(event, cb) {
			return (0, _utilsDom2['default'])('*body').on(event, cb);
		}
	}]);

	return PubSub;
})();

exports['default'] = PubSub;
module.exports = exports['default'];
},{"../base":1,"../utils/dom":22,"../utils/log":25}],4:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var routeStripper = /^[#\/]|\s+$/g;

var rootStripper = /^\/+|\/+$/g;

var pathStripper = /#.*$/;

var RouterHistory = (function (_BaseClass) {
	_inherits(RouterHistory, _BaseClass);

	function RouterHistory(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			root: '/'
		} : arguments[1];

		_classCallCheck(this, RouterHistory);

		_get(Object.getPrototypeOf(RouterHistory.prototype), 'constructor', this).call(this, name, options);
		this.root = ('/' + this.root + '/').replace(rootStripper, '#/');

		if (typeof window !== 'undefined') {
			this.location = window.location;
			this.history = window.history;
		}
		this.pushState = options.pushState || false;
		return this;
	}

	_createClass(RouterHistory, [{
		key: 'go',
		value: function go(route, options) {
			if (this.pushState) {
				this.history.pushState(options, document.title, route);
			} else {
				this.location.hash = route;
			}
		}
	}, {
		key: 'state',
		value: function state() {
			return this.history.state;
		}
	}, {
		key: 'back',
		value: function back() {
			return this.history.back();
		}
	}, {
		key: 'forward',
		value: function forward() {
			return this.history.forward();
		}
	}, {
		key: 'atRoot',
		value: function atRoot() {
			var path = this.location.pathname.replace(/[^\/]$/, '$&/');
			return path === this.root && !this.getSearch();
		}
	}, {
		key: 'matchRoot',
		value: function matchRoot() {
			var path = this.decodeFragment(this.location.pathname);
			var root = path.slice(0, this.root.length - 1) + '/';
			return root === this.root;
		}
	}, {
		key: 'decodeFragment',
		value: function decodeFragment(fragment) {
			return decodeURI(fragment.replace(/%25/g, '%2525'));
		}
	}, {
		key: 'getSearch',
		value: function getSearch() {
			var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
			return match ? match[0] : '';
		}
	}, {
		key: 'getHash',
		value: function getHash(window) {
			var match = (window || this).location.href.match(/#(.*)$/);
			return match ? match[1] : '';
		}
	}, {
		key: 'getPath',
		value: function getPath() {
			var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
			return path.charAt(0) === '/' ? path.slice(1) : path;
		}
	}, {
		key: 'getFragment',
		value: function getFragment(fragment) {
			if (fragment === null) {
				if (this._usePushState || !this._wantsHashChange) {
					fragment = this.getPath();
				} else {
					fragment = this.getHash();
				}
			} else {
				fragment = this.getHash();
			}
			return fragment.replace(routeStripper, '');
		}
	}]);

	return RouterHistory;
})(_base2['default']);

exports['default'] = RouterHistory;
module.exports = exports['default'];
},{"../base":1}],5:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _pubsub = require('./pubsub');

var _pubsub2 = _interopRequireDefault(_pubsub);

var _routerHistory = require('./router-history');

var _routerHistory2 = _interopRequireDefault(_routerHistory);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _instance = null;
var optionalParam = /\((.*?)\)/g;
var namedParam = /(\(\?)?:\w+/g;
var splatParam = /\*\w+/g;
var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;

var Router = (function (_BaseClass) {
	_inherits(Router, _BaseClass);

	_createClass(Router, null, [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance == null) {
				_instance = new Router();
			}

			return _instance;
		}
	}]);

	function Router(name, options) {
		_classCallCheck(this, Router);

		name = name + '.Router';
		_get(Object.getPrototypeOf(Router.prototype), 'constructor', this).call(this, name, options);

		this.history = new _routerHistory2['default']();

		this.routes = {};

		this.urlPrefix = '#';
		this.mixin(options);
		this.started = false;
		this._setRegexRoutes();

		return this;
	}

	_createClass(Router, [{
		key: 'listen',
		value: function listen() {
			var self = this;
			var current = this.history.getFragment();
			var fn = function fn() {
				if (current !== self.history.getFragment()) {
					current = self.history.getFragment();
					self.check(current);
				}
			};
			clearInterval(this.interval);
			this.interval = setInterval(fn, 50);
			return this;
		}
	}, {
		key: 'check',
		value: function check(f) {
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
	}, {
		key: 'start',
		value: function start() {
			var _this2 = this;

			this.log.logApi('2. start', this);
			if ('onhashchange' in window) {
				this.log.logApi('3. onhashchange', 'The browser supports the hashchange event!');
				this.started = true;
				window.addEventListener('hashchange', function (e) {
					_this2._handleRoute(e);
				}, this);
			} else {}
			return this;
		}
	}, {
		key: 'execute',
		value: function execute(callback, args, name) {
			this.log.logApi('execute =>' + name, args);
			if (callback) {
				callback.apply(this, args);
			}
			return this;
		}
	}, {
		key: 'navigate',
		value: function navigate(route, options) {
			this.log.logApi('navigate =>' + route, options);

			this.history.go(route, options);

			return this;
		}
	}, {
		key: 'on',
		value: function on(route, options) {
			this.subscribe(route, options);
			this.log.logApi('5. on -' + route, options);
			this.routes[route] = options;
			this._setRegexRoutes();
			return this;
		}
	}, {
		key: 'when',
		value: function when(route) {
			this.log.logApi('4. when', route);
			var _this = this;
			return new Promise(function (resolve, reject) {
				_this.on(route, {
					callback: function callback(req, res) {
						resolve(req, res);
					}
				});
			});
		}
	}, {
		key: 'route',
		value: function route(_route2, name, callback) {
			this.log.logApi('route', _route2);
			return this;
		}
	}, {
		key: '_handleRoute',
		value: function _handleRoute(e) {
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
				params: {},
				data: {} };

			req.query = this._getUrlQuery(parser.href);

			for (var i = 0; i < this.routesRegex.length; i++) {
				_routeObj = this.routesRegex[i];

				if (_routeObj.regexp.test(_hash)) {
					_routeObj.current = _hash;

					_routeObj = this._setRouteParams(_routeObj);

					req.params = _routeObj.params;

					this.log.logApi(_hash, _routeObj);

					_this.publish('route:change', {
						_routeObj: _routeObj, req: req, res: res
					});

					this.execute(_routeObj.success, [req, res], _hash);
				} else {

					this.execute(_routeObj.error, [req, res], _hash);
				}
			}
		}
	}, {
		key: '_setRegexRoutes',
		value: function _setRegexRoutes() {
			var _out = [],
			    _routeParams = [],
			    _reg,
			    _routeObj;

			var routeHandler = null;
			var routeErrorHandler = function routeErrorHandler() {};
			var routeSuccessHandler = function routeSuccessHandler() {};
			var routeResolver = null;

			this.log.logApi('1. registerRoutes', this.routes);
			for (var _route in this.routes) {
				if (this.utils.type(this.routes[_route]) === 'function') {
					routeSuccessHandler = this.routes[_route];
				}

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

				_routeParams = _route.replace('/', '').split('/');
				_reg = this._regexRoute(_route, _routeParams);
				_routeObj = {
					regexp: _reg,
					route: _route,
					success: routeSuccessHandler,
					error: routeErrorHandler
				};
				_out.push(_routeObj);
			}
			this.routesRegex = _out;
			return _out;
		}
	}, {
		key: '_setRouteParams',
		value: function _setRouteParams(routeObj) {
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
	}, {
		key: '_getUrlQuery',
		value: function _getUrlQuery(url) {
			var re = /(?:\?|&(?:amp;)?)([^=&#]+)(?:=?([^&#]*))/g,
			    match,
			    params = {};

			if (typeof url === 'undefined') {
				url = window.location.href;
			}
			var decode = function decode(s) {
				return decodeURIComponent(s.replace(/\+/g, ' '));
			};
			while (match = re.exec(url)) {
				params[decode(match[1])] = decode(match[2]);
			}

			this.log.logApi('getUrlQuery', url);
			return params;
		}
	}, {
		key: '_regexRoute',
		value: function _regexRoute(path, keys, sensitive, strict) {
			if (path instanceof RegExp) {
				return path;
			}
			if (path instanceof Array) {
				path = '(' + path.join('|') + ')';
			}
			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (optional || '');
			}).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
	}]);

	return Router;
})(_base2['default']);

exports['default'] = Router;
module.exports = exports['default'];
},{"../base":1,"./pubsub":3,"./router-history":4}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _instance = null;
var _services = {};

var ServiceLocator = (function () {
	function ServiceLocator(options) {
		_classCallCheck(this, ServiceLocator);

		this.services = _services;
		this.options = options || {};
		return this;
	}

	_createClass(ServiceLocator, [{
		key: 'register',
		value: function register(key, service) {
			_services[key] = service;
			return this;
		}
	}, {
		key: 'resolve',
		value: function resolve(key) {
			return _services[key];
		}
	}, {
		key: 'start',
		value: function start(key) {
			var service = _services[key];
			console.warn('Starting service', key, service);
			return service.start();
		}
	}, {
		key: 'startAll',
		value: function startAll() {
			var all = [];
			console.warn('startAll', _services);
			for (var service in _services) {
				console.warn('Starting service', service);
				all.push(this.start(service));
			}
			return all;
		}
	}, {
		key: 'reset',
		value: function reset() {
			_services = {};
			return this;
		}
	}], [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance == null) {
				_instance = new ServiceLocator();
			}
			return _instance;
		}
	}]);

	return ServiceLocator;
})();

exports['default'] = ServiceLocator;
module.exports = exports['default'];
},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var SimpleRouter = (function (_BaseClass) {
	_inherits(SimpleRouter, _BaseClass);

	function SimpleRouter(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			mode: 'hash',
			root: '/',
			urlPrefix: '!#'
		} : arguments[1];

		_classCallCheck(this, SimpleRouter);

		name = name + '.Router';
		_get(Object.getPrototypeOf(SimpleRouter.prototype), 'constructor', this).call(this, name, options);

		this._routes = [];
		this.routes = [];

		this.routeMap = new Map();

		this.mode = options.hash;

		this.root = options.root || window.location.href;
		this.debug = options.debug || true;

		this.urlPrefix = options.urlPrefix || '#';

		this.mixin(options);

		this.config(options);

		return this;
	}

	_createClass(SimpleRouter, [{
		key: 'config',
		value: function config(options) {
			this.mode = options && options.mode && options.mode === 'history' && !!history.pushState ? 'history' : 'hash';
			this.root = options && options.root ? '/' + this.clearSlashes(options.root) + '/' : '/';
			if (options && options.routes) {
				for (var route in options.routes) {
					this.add(route, options.routes[route]);
				}
			}
			return this;
		}
	}, {
		key: 'clearSlashes',
		value: function clearSlashes(path) {
			return path.toString().replace(/\/$/, '').replace(/^\//, '');
		}
	}, {
		key: 'getFragment',
		value: function getFragment() {
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
	}, {
		key: 'add',
		value: function add(re, handler) {
			if (typeof re === 'function') {
				handler = re;
				re = '';
			}

			this._routes.push({
				re: re,
				handler: handler
			});
			this.subscribe(re, handler);

			return this;
		}
	}, {
		key: 'remove',
		value: function remove(param) {
			for (var i = 0, r; i < this.routes.length, r = this.routes[i]; i++) {
				if (r.handler === param || r.re.toString() === param.toString()) {
					this._routes.splice(i, 1);
					return this;
				}
			}
			return this;
		}
	}, {
		key: 'flush',
		value: function flush() {
			this._routes = [];
			this.mode = null;
			this.root = '/';
			return this;
		}
	}, {
		key: 'check',
		value: function check(f) {
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
	}, {
		key: 'listen',
		value: function listen() {
			var self = this;
			var current = self.getFragment();
			var fn = function fn() {
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
	}, {
		key: 'navigate',
		value: function navigate(path) {
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
	}, {
		key: 'regexRoute',
		value: function regexRoute(path, keys, sensitive, strict) {
			if (path instanceof RegExp) {
				return path;
			}
			if (path instanceof Array) {
				path = '(' + path.join('|') + ')';
			}
			path = path.concat(strict ? '' : '/?').replace(/\/\(/g, '(?:/').replace(/\+/g, '__plus__').replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {
				keys.push({
					name: key,
					optional: !!optional
				});
				slash = slash || '';
				return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (format || '') + (capture || format && '([^/.]+?)' || '([^/]+?)') + ')' + (optional || '');
			}).replace(/([\/.])/g, '\\$1').replace(/__plus__/g, '(.+)').replace(/\*/g, '(.*)');

			return new RegExp('^' + path + '$', sensitive ? '' : 'i');
		}
	}, {
		key: 'start',
		value: function start() {
			return this.listen();
		}
	}]);

	return SimpleRouter;
})(_base2['default']);

exports['default'] = SimpleRouter;
module.exports = exports['default'];
},{"../base":1}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var defaults = {
	baseUrl: '/default',
	idField: '_id',
	model: {},
	models: [],
	params: {
		limit: 25,
		startkey: null,
		endkey: null
	}
};

var Collection = (function (_BaseClass) {
	_inherits(Collection, _BaseClass);

	function Collection(name) {
		var options = arguments.length <= 1 || arguments[1] === undefined ? defaults : arguments[1];

		_classCallCheck(this, Collection);

		_get(Object.getPrototypeOf(Collection.prototype), 'constructor', this).call(this, name, options);

		this.model = options.model;
		this.models = options.models;
		this.baseUrl = options.baseUrl;

		this.idField = options.idField || '_id';
		this.params = options.params || {
			startkey: '',
			endkey: '',
			limit: 25
		};
		this.lastResponse = null;

		this.adapter = options.adapter || _http2['default'];
		this.adapter = new this.adapter(name, options);

		return this;
	}

	_createClass(Collection, [{
		key: 'parse',
		value: function parse(resp) {
			return resp;
		}
	}, {
		key: 'add',
		value: function add(model) {
			return this.models.push(model);
		}
	}, {
		key: 'fetch',
		value: function fetch(params) {
			var self = this;
			return self.adapter.get(params).then(function (resp) {
				self.lastResponse = resp;
				self.models = resp.data.rows;
				return resp;
			});
		}
	}, {
		key: 'remove',
		value: function remove(model) {
			this.log.logApi('Find model by', model);
			if (this.utils.type(model) === 'string') {
				this.log.logApi('Find by _id', model);
			}
			if (this.utils.type(model) === 'number') {
				this.log.logApi('Find by index', model);
			}
			if (this.utils.type(model) === 'object') {
				this.log.logApi('Find by model', model);
			}
		}
	}, {
		key: 'where',
		value: function where(filter) {
			return this.models.filter(filter);
		}
	}, {
		key: 'find',
		value: function find(filter) {
			return this.models.filter(filter);
		}
	}, {
		key: 'get',
		value: function get(id) {
			this.log.logApi('get', id);
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			return JSON.stringify(this.models);
		}
	}]);

	return Collection;
})(_base2['default']);

exports['default'] = Collection;
module.exports = exports['default'];
},{"../base":1,"./http":10}],9:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var DB = (function (_BaseClass) {
	_inherits(DB, _BaseClass);

	function DB() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'db' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			baseUrl: '/default'
		} : arguments[1];

		_classCallCheck(this, DB);

		_get(Object.getPrototypeOf(DB.prototype), 'constructor', this).call(this, name, options);

		if (!options.baseUrl) {
			this.log.logApi('[DB] - Using default baseUrl - /default');
		}

		var adapter = options.adapter || new _http2['default'](name, options);
		this.adapter = adapter;

		return this;
	}

	_createClass(DB, [{
		key: 'info',
		value: function info() {
			return this.adapter.get('');
		}
	}, {
		key: 'allDocs',
		value: function allDocs(options) {
			this.log.logApi('allDocs', options);
			return this.adapter.get('/_all_docs', {
				params: options
			});
		}
	}, {
		key: 'get',
		value: function get(docId, options) {
			this.log.logApi('get', docId);
			if (!docId) {
				throw new Error('db.get(docId) - Must provide a document _id!');
			}
			return this.adapter.get('/' + docId, options);
		}
	}, {
		key: 'put',
		value: function put(doc, options) {
			this.log.logApi('put', doc);
			if (!doc) {
				throw new Error('db.put(doc) - Must provide a document object!');
			}
			if (!doc._id) {
				throw new Error('db.put(doc) - Must provide a _id on the document object!');
			}
			if (doc._rev) {
				options = options || {
					params: {
						rev: doc._rev
					}
				};
			}
			return this.adapter.put('/' + doc._id, doc, options).then(this.adapter.parseJSON);
		}
	}, {
		key: 'post',
		value: function post(doc) {
			if (!doc) {
				throw new Error('db.put(doc) - Must provide a document object!');
			}
			doc._id = this.utils.uuid();
			return this.put(doc);
		}
	}, {
		key: 'remove',
		value: function remove(id, rev) {
			this.log.logApi('remove', {
				id: id,
				rev: rev
			});
			if (!id) {
				throw new Error('db.remove(id, rev) - Must provide a id!');
			}
			if (!rev) {
				throw new Error('db.remove(id, rev) - Must provide a rev!');
			}
			return this.adapter['delete']('/' + id, {
				params: {
					rev: rev
				}
			}).then(this.adapter.parseJSON);
		}
	}, {
		key: 'getAttachment',
		value: function getAttachment(id, attachmentId, contentType) {
			this.log.logApi('getAttachment', {
				id: id,
				attachment: attachmentId
			});
			if (!id) {
				throw new Error('db.getAttachment(id, attachmentId) - Must provide a document _id!');
			}
			if (!attachmentId) {
				throw new Error('db.getAttachment(id, attachmentId) - Must provide a document attachment!');
			}
			return this.adapter.request(id + '/' + attachmentId, {
				method: 'GET',
				headers: {
					'Content-Type': contentType || 'application/octet-stream'
				}
			});
		}
	}, {
		key: 'saveAttachment',
		value: function saveAttachment(id, rev, filename, type, file) {
			this.log.logApi('saveAttachment', file);
			return this.adapter.request(id + '/' + filename, {
				method: 'PUT',
				headers: {
					'Content-Type': type || 'application/octet-stream'
				},
				params: {
					rev: rev
				},
				body: file
			});
		}
	}, {
		key: 'bulkDocs',
		value: function bulkDocs(docs) {
			if (!docs) {
				throw new Error('bulkDocs - Must provide an array of documents!');
			}
			this.log.logApi('bulkDocs', docs);
			return this.adapter.post('/_bulk_docs', {
				docs: docs
			}).then(this.adapter.parseJSON);
		}
	}, {
		key: 'changes',
		value: function changes(options) {
			var self = this;
			var defaults = {
				live: false,
				include_docs: false,
				conflicts: false,
				attachments: false,
				binary: false,
				descending: false,
				since: 0,
				limit: null,
				heartbeat: 1000
			};

			options = this.utils.extend(defaults, options);

			self.log.logApi('changes', options);

			var _fetchChanges = function _fetchChanges() {
				self.log.logApi('_fetchChanges', options);

				return self.adapter.get('/_changes', {
					params: options
				}).then(self.adapter.parseJSON).then(function (resp) {
					options.since = resp.data.last_seq;

					if (_callbacks.change) {
						if (resp.data.results) {
							resp.data.results.forEach(function (change) {
								_callbacks.change(change);
								self.log.logApi('change', change);
							});
						}
					}

					if (resp.data.results.length === 0) {
						if (_callbacks.complete) {
							_callbacks.complete(resp);
						}
						self.log.logApi('complete', resp);
					}

					return resp;
				})['catch'](function (err) {
					if (_callbacks.error) {
						_callbacks.error(err);
					}
					return err;
				});
			};

			var _callbacks = {};

			var _feed = setInterval(function () {
				self.log.logApi('_feed', options);
				_fetchChanges();
			}, options.heartbeat);

			return {
				on: function on(e, cb) {
					_callbacks[e] = cb;
					self.log.logApi('on', options);
					return this;
				},
				cancel: function cancel() {
					self.log.logApi('cancel', options);
					clearInterval(_feed);
					return this;
				}
			};
		}
	}]);

	return DB;
})(_base2['default']);

exports['default'] = DB;
module.exports = exports['default'];
},{"../base":1,"./http":10}],10:[function(require,module,exports){

'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x14, _x15, _x16) { var _again = true; _function: while (_again) { var object = _x14, property = _x15, receiver = _x16; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x14 = parent; _x15 = property; _x16 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var HTTP = (function (_BaseClass) {
	_inherits(HTTP, _BaseClass);

	function HTTP() {
		var name = arguments.length <= 0 || arguments[0] === undefined ? 'http' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {
			baseUrl: '/default'
		} : arguments[1];

		_classCallCheck(this, HTTP);

		_get(Object.getPrototypeOf(HTTP.prototype), 'constructor', this).call(this, name, options);

		if (!options.baseUrl) {
			this.log.logApi('[HTTP] - Using default baseUrl - /default');
		}

		return this;
	}

	_createClass(HTTP, [{
		key: 'checkStatus',
		value: function checkStatus(response) {

			if (response.status >= 200 && response.status < 300) {
				return response;
			} else {
				var error = new Error(response.statusText);
				error.response = response;
				return response;
			}
		}
	}, {
		key: 'parseJSON',
		value: function parseJSON(response) {
			if (!response) {
				throw new Error('Must pass a response object to parseJSON!');
			}
			return response.json().then(function (json) {
				response.data = json;
				return response;
			});
		}
	}, {
		key: 'getJSON',
		value: function getJSON() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return fetch(url, options || {
				method: 'GET'
			}).then(this.checkStatus).then(this.parseJSON);
		}
	}, {
		key: 'request',
		value: function request(url, options) {
			var _this2 = this;

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

			if (options.params) {
				url = this.utils.resolveURL(url, options.params);
				delete options.params;
			}

			this.log.logHttp(config.method, url);

			var benchmark = this.log.logTime('request');
			return new Promise(function (resolve, reject) {
				return fetch(url, config).then(function (resp) {
					_this2.log.logHttp(resp.status + ' ' + benchmark.end(), resp, true);

					resp.data = {};
					resolve(resp);
				}, reject);
			});
		}
	}, {
		key: 'get',
		value: function get(url) {
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.log.logApi('get', options);
			return this.request(url, options).then(this.parseJSON);
		}
	}, {
		key: 'put',
		value: function put(url) {
			var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			this.log.logApi('put', data);
			return this.request(url, this.utils.extend({
				method: 'PUT',
				data: data
			}, options));
		}
	}, {
		key: 'post',
		value: function post(url) {
			var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
			var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			return this.request(url, this.utils.extend({
				method: 'POST',
				data: data
			}, options));
		}
	}, {
		key: 'delete',
		value: function _delete() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this.request(url, this.utils.extend({
				method: 'DELETE'
			}, options));
		}
	}, {
		key: 'head',
		value: function head() {
			var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
			var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			return this.request(url, this.utils.extend({
				method: 'HEAD'
			}, options));
		}
	}]);

	return HTTP;
})(_base2['default']);

exports['default'] = HTTP;
module.exports = exports['default'];
},{"../base":1}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _http = require('./http');

var _http2 = _interopRequireDefault(_http);

var _utilsUtils = require('../utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var Model = (function (_BaseClass) {
	_inherits(Model, _BaseClass);

	function Model(id, options) {
		_classCallCheck(this, Model);

		id = id || utils.uuid();
		options = options || {};

		_get(Object.getPrototypeOf(Model.prototype), 'constructor', this).call(this, id, options);

		this.uuid = utils.uuid();
		this.baseUrl = options.baseUrl || '/default';
		this.defaults = options.defaults || {};
		this.idField = options.idField || '_id';
		this.scope = options.data || {};
		this.scope[options.idField] = id;

		this.adapter = options.adapter || _http2['default'];
		this.adapter = new this.adapter(id, options);

		this.log = new _utilsLog2['default']('Model:' + id, {
			colors: {
				debug: 'color:blue'
			}
		});
		this.log.logApi('constructor', options);
	}

	_createClass(Model, [{
		key: 'url',
		value: function url() {
			var url = '/' + encodeURIComponent(this.get('_id'));

			if (this.get('_rev')) {
				url += '?rev=' + this.get('_rev');
			}
			this.log.logApi('url()', url);
			return url;
		}
	}, {
		key: 'has',
		value: function has(attribute) {
			return this.scope.hasOwnProperty(attribute);
		}
	}, {
		key: 'get',
		value: function get(attribute) {
			if (this.has(attribute)) {
				return this.scope[attribute];
			} else {
				return false;
			}
		}
	}, {
		key: 'set',
		value: function set(attributes) {
			var force = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

			for (var key in attributes) {
				if (force) {
					this.scope[key] = attributes[key];
				}
				if (this.has(key)) {
					this.scope[key] = attributes[key];
				}
			}
			return this;
		}
	}, {
		key: 'toJSON',
		value: function toJSON() {
			this.log.logApi('toJSON', this.scope);
			return JSON.stringify(this.scope);
		}
	}, {
		key: 'clone',
		value: function clone() {
			return new this.constructor(this.options);
		}
	}, {
		key: 'parse',
		value: function parse(resp) {
			this.log.logApi('parse', resp);
			if (resp.data) {
				this.scope = resp.data;
			}
			return resp;
		}
	}, {
		key: 'fetch',
		value: function fetch(options) {
			var self = this;
			this.log.logApi('fetch', options);
			return this.adapter.get(this.url(), options || {}).then(function (resp) {
				return self.parse(resp);
			});
		}
	}, {
		key: 'save',
		value: function save(options) {
			this.log.logApi('save', options);
			return this.adapter.put('' + this.url(), this.scope);
		}
	}, {
		key: 'destroy',
		value: function destroy(rev) {
			this.log.logApi('destroy', rev);
			return this.adapter['delete']('' + this.url());
		}
	}, {
		key: 'sync',
		value: function sync(options) {
			this.log.logApi('sync', options);
		}
	}], [{
		key: 'extend',
		value: function extend(obj) {
			return _get(Object.getPrototypeOf(Model), 'extend', this).call(this, this, obj);
		}
	}]);

	return Model;
})(_base2['default']);

exports['default'] = Model;
module.exports = exports['default'];
},{"../base":1,"../utils/log":25,"../utils/utils":26,"./http":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utilsLog = require('../utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsUtils = require('../utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var pmPage = (function () {
  function pmPage() {
    _classCallCheck(this, pmPage);
  }

  _createClass(pmPage, [{
    key: 'createdCallback',
    value: function createdCallback() {
      var logger = new _utilsLog2['default'](this.localName, {
        colors: {
          debug: 'color:orange'
        }
      });
      utils.addMixin(logger, this);

      this.properties = {
        title: {
          type: String,
          value: 'Page Title'
        },

        backText: {
          type: String,
          value: null
        },

        backLink: {
          type: String,
          value: null
        },

        href: {
          type: String,
          notify: true,
          value: null,
          observer: '_tmplChanged'
        },

        active: {
          type: Boolean,
          value: false
        },

        modal: {
          type: Boolean,
          value: false
        },

        query: {
          type: Object
        },

        context: {
          type: Object
        },

        view: {
          type: Object
        },

        fromPage: {
          type: Object
        },
        route: {
          type: String
        },

        url: {
          type: String
        },

        container: {
          type: String
        }
      };

      this.createShadowRoot().innerHTML = '\n\t\t\t\t\t<style>\n\t\t\t\t\t\t:host {\n\t\t\t\t\t    display: block;\n\t\t\t\t\t    box-sizing: border-box;\n\t\t\t\t\t    -webkit-transition: all 0.4s ease-out;\n\t\t\t\t\t    transition: all 0.4s ease-out;\n\t\t\t\t\t  }\n\t\t\t\t\t\t:host header{\n\t\t\t\t\t\t  padding: 10px;\n\t\t\t\t\t\t}\n\t\t\t\t\t  :host .close-btn{\n\t\t\t\t\t    cursor: pointer;\n\t\t\t\t\t    position: absolute;\n\t\t\t\t\t    right: .1em;\n\t\t\t\t\t    top: .2em;\n\t\t\t\t\t    width: 44px;\n\t\t\t\t\t    height: 44px;\n\t\t\t\t\t    display: block;\n\t\t\t\t\t  }\n\t\t\t\t    :host .hamburger {\n\t\t\t\t      width: 20px;\n\t\t\t\t      height: 2px;\n\t\t\t\t      background: #000;\n\t\t\t\t      display: block;\n\t\t\t\t      position: absolute;\n\t\t\t\t      top: 50%;\n\t\t\t\t      left: 15%;\n\t\t\t\t      transition: transform 300ms;\n\t\t\t\t    }\n\t\t\t\t\t  :host .hamburger-1 {\n\t\t\t\t\t    transform: translate3d(0, 0, 0) rotate(45deg);\n\t\t\t\t\t  }\n\t\t\t\t\t  :host .hamburger-2 {\n\t\t\t\t\t    transform: translate3d(0, 0, 0) rotate(-45deg);\n\t\t\t\t\t  }\n\t\t\t\t\t</style>\n\t\t\t\t\t<div class="page-content overthrow">\n\t\t\t\t\t\t<content></content>\n\t\t\t\t\t</div>\n\t\t\t\t\t';

      this.logApi('created', this.id);
    }
  }, {
    key: 'ready',
    value: function ready() {
      this.logApi('ready', this.id);
      if (this.modal) {
        this.toggleClass('modal');
      }
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {}
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {}
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback(prop, oldVal, newVal) {}
  }, {
    key: 'show',
    value: function show() {
      this.logApi('show view', this.id);
      this.toggleClass('current', false, this);
    }
  }, {
    key: 'hide',
    value: function hide() {
      this.logApi('hide view', this.id);
      this.toggleClass('hidden', true, this);
    }
  }, {
    key: 'update',
    value: function update() {
      this.logApi('update view', this.id);
    }
  }, {
    key: 'currentView',
    value: function currentView() {
      this.logApi('current view', this.id);
      this.child()[0].toggleClass('current', true, this);
    }
  }, {
    key: 'nextView',
    value: function nextView() {
      this.logApi('next view', this.id);
      this.toggleClass('next', true, this);
    }
  }, {
    key: 'previousView',
    value: function previousView() {
      this.logApi('previous view', this.id);
      this.toggleClass('previous', true, this);
    }
  }, {
    key: 'contextChanged',
    value: function contextChanged(newContext, oldContext) {
      this.logApi('contextChanged', newContext, oldContext);
    }
  }, {
    key: '_tmplChanged',
    value: function _tmplChanged(newVal, oldVal) {
      var _this = this,
          html = '';
      if (newVal) {
        this.logApi(this.id, 'Load remote html', newVal);
        this.importHref(newVal, function (e) {
          html = e.target['import'].body.innerHTML;
          _this.logApi('inject html', _this.id);
          _this.logApi('inject px-view html', _this.id);
          _this.html(html);
        }, function (e) {
          _this.logApi('Error loading page', e);
        });
      }
    }
  }, {
    key: 'showMenu',
    value: function showMenu() {
      px.mobile.dom('pxm-app').toggleClass('show-menu');
    }
  }, {
    key: 'open',
    value: function open() {
      this.logApi('open', this);
      this.addClass('active');
    }
  }, {
    key: 'close',
    value: function close() {
      this.logApi('close', this);
      this.removeClass('active');
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      this.logApi('toggle', this);
      this.toggleClass('active');
    }
  }]);

  return pmPage;
})();

exports['default'] = pmPage;
module.exports = exports['default'];
},{"../utils/log":25,"../utils/utils":26}],13:[function(require,module,exports){

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _coreCore = require('./core/core');

var _coreCore2 = _interopRequireDefault(_coreCore);

var _coreRouterHistory = require('./core/router-history');

var _coreRouterHistory2 = _interopRequireDefault(_coreRouterHistory);

var _coreRouter = require('./core/router');

var _coreRouter2 = _interopRequireDefault(_coreRouter);

var _coreSimpleRouter = require('./core/simple-router');

var _coreSimpleRouter2 = _interopRequireDefault(_coreSimpleRouter);

var _corePubsub = require('./core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _dsCollection = require('./ds/collection');

var _dsCollection2 = _interopRequireDefault(_dsCollection);

var _dsHttp = require('./ds/http');

var _dsHttp2 = _interopRequireDefault(_dsHttp);

var _dsDb = require('./ds/db');

var _dsDb2 = _interopRequireDefault(_dsDb);

var _dsModel = require('./ds/model');

var _dsModel2 = _interopRequireDefault(_dsModel);

var _elementsPmPage = require('./elements/pm-page');

var _elementsPmPage2 = _interopRequireDefault(_elementsPmPage);

var _uiApp = require('./ui/app');

var _uiApp2 = _interopRequireDefault(_uiApp);

var _uiElement = require('./ui/element');

var _uiElement2 = _interopRequireDefault(_uiElement);

var _uiElements = require('./ui/elements');

var _uiElements2 = _interopRequireDefault(_uiElements);

var _uiPage = require('./ui/page');

var _uiPage2 = _interopRequireDefault(_uiPage);

var _uiPages = require('./ui/pages');

var _uiPages2 = _interopRequireDefault(_uiPages);

var _uiViews = require('./ui/views');

var _uiViews2 = _interopRequireDefault(_uiViews);

var _uiView = require('./ui/view');

var _uiView2 = _interopRequireDefault(_uiView);

var _uiComponent = require('./ui/component');

var _uiComponent2 = _interopRequireDefault(_uiComponent);

var _utilsUtils = require('./utils/utils');

var utils = _interopRequireWildcard(_utilsUtils);

var _utilsInterface = require('./utils/interface');

var _utilsInterface2 = _interopRequireDefault(_utilsInterface);

var _utilsInterfaces = require('./utils/interfaces');

var _utilsInterfaces2 = _interopRequireDefault(_utilsInterfaces);

var _utilsLog = require('./utils/log');

var _utilsLog2 = _interopRequireDefault(_utilsLog);

var _utilsDom = require('./utils/dom');

var _utilsDom2 = _interopRequireDefault(_utilsDom);

var pxMobile = {
	debug: true,
	version: 'es6',
	behaviors: {},

	BaseClass: _base2['default'],
	Core: _coreCore2['default'],
	SimpleRouter: _coreSimpleRouter2['default'],
	Router: _coreRouter2['default'],
	RouterHistory: _coreRouterHistory2['default'],
	PubSub: _corePubsub2['default'],

	Collection: _dsCollection2['default'],
	DB: _dsDb2['default'],
	HTTP: _dsHttp2['default'],
	Model: _dsModel2['default'],

	App: _uiApp2['default'],
	Page: _uiPage2['default'],
	Pages: _uiPages2['default'],
	View: _uiView2['default'],
	Views: _uiViews2['default'],
	Element: _uiElement2['default'],
	Elements: _uiElements2['default'],

	$: _utilsDom.$,
	utils: utils,
	Logger: _utilsLog2['default'],
	Interface: _utilsInterface2['default'],
	Interfaces: _utilsInterfaces2['default'],
	dom: _utilsDom2['default'],
	ui: {
		App: _uiApp2['default'],
		Component: _uiComponent2['default'],
		Element: _uiElement2['default'],
		Page: _uiPage2['default'],
		Pages: _uiPages2['default'],
		View: _uiView2['default'],
		Views: _uiViews2['default']
	},
	elements: {
		pmPage: _elementsPmPage2['default']
	}
};

if (typeof window !== undefined) {
	window.pxMobile = pxMobile;
}

exports['default'] = pxMobile;
module.exports = exports['default'];
},{"./base":1,"./core/core":2,"./core/pubsub":3,"./core/router":5,"./core/router-history":4,"./core/simple-router":7,"./ds/collection":8,"./ds/db":9,"./ds/http":10,"./ds/model":11,"./elements/pm-page":12,"./ui/app":14,"./ui/component":15,"./ui/element":16,"./ui/elements":17,"./ui/page":18,"./ui/pages":19,"./ui/view":20,"./ui/views":21,"./utils/dom":22,"./utils/interface":23,"./utils/interfaces":24,"./utils/log":25,"./utils/utils":26}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _coreCore = require('../core/core');

var _coreCore2 = _interopRequireDefault(_coreCore);

var _coreServiceLocator = require('../core/service-locator');

var _coreServiceLocator2 = _interopRequireDefault(_coreServiceLocator);

var _instance = null;

var App = (function (_Core) {
	_inherits(App, _Core);

	_createClass(App, null, [{
		key: 'getInstance',
		value: function getInstance() {
			if (_instance === null) {
				_instance = new App();
			}
			return _instance;
		}
	}]);

	function App(name, options) {
		_classCallCheck(this, App);

		_get(Object.getPrototypeOf(App.prototype), 'constructor', this).call(this, name, options);
		this.modules = {};
		this.session = {};

		this.services = new _coreServiceLocator2['default'](name, options);

		this.params = {

			cache: true,
			cacheIgnore: [],
			cacheIgnoreGetParameters: false,
			cacheDuration: 1000 * 60 * 10,
			preloadPreviousPage: true,
			uniqueHistory: false,
			uniqueHistoryIgnoreGetParameters: false,
			dynamicPageUrl: 'content-{{index}}',
			allowDuplicateUrls: false,
			router: true,

			pushState: false,
			pushStateRoot: undefined,
			pushStateNoAnimation: false,
			pushStateSeparator: '#!/',
			pushStatePreventOnLoad: true,

			fastClicks: true,
			fastClicksDistanceThreshold: 10,
			fastClicksDelayBetweenClicks: 50,

			tapHold: false,
			tapHoldDelay: 750,
			tapHoldPreventClicks: true,

			activeState: true,
			activeStateElements: 'a, button, label, span',

			animateNavBackIcon: false,

			swipeBackPage: true,
			swipeBackPageThreshold: 0,
			swipeBackPageActiveArea: 30,
			swipeBackPageAnimateShadow: true,
			swipeBackPageAnimateOpacity: true,

			ajaxLinks: undefined,
			externalLinks: '.external',
			sortable: true,

			hideNavbarOnPageScroll: false,
			hideToolbarOnPageScroll: false,
			hideTabbarOnPageScroll: false,
			showBarsOnPageScrollEnd: true,
			showBarsOnPageScrollTop: true,

			scrollTopOnNavbarClick: false,
			scrollTopOnStatusbarClick: false,

			modalButtonOk: 'OK',
			modalButtonCancel: 'Cancel',
			modalUsernamePlaceholder: 'Username',
			modalPasswordPlaceholder: 'Password',
			modalTitle: 'App',
			modalCloseByOutside: false,
			actionsCloseByOutside: true,
			popupCloseByOutside: true,
			modalPreloaderTitle: 'Loading... ',
			modalStack: true,

			imagesLazyLoadThreshold: 0,
			imagesLazyLoadSequential: true,

			viewClass: 'pxm-view',
			viewMainClass: 'pxm-view-main',
			viewsClass: 'pxm-views',

			animatePages: true,

			templates: {},
			templateData: {},
			templatePages: false,
			precompileTemplates: false,

			init: true
		};

		for (var param in options) {
			this.params[param] = options[param];
		}
	}

	_createClass(App, [{
		key: 'configureRouter',
		value: function configureRouter(config, router) {
			config.title = 'App';
			config.map([{
				route: ['', 'welcome'],
				name: 'welcome',
				moduleId: 'welcome',
				nav: true,
				title: 'Welcome'
			}]);

			this.router = router;
		}
	}, {
		key: 'start',
		value: function start() {
			this.log.logApi('start', this);
			return Promise.all(this.services.startAll());
		}
	}, {
		key: 'bootstrap',
		value: function bootstrap(cb) {
			this.log.logApi('bootstrap', this);
			cb(this);
		}
	}, {
		key: 'run',
		value: function run(cb) {
			this.log.logApi('run', this);
			this.start();
			cb(this);
		}
	}]);

	return App;
})(_coreCore2['default']);

exports['default'] = App;
module.exports = exports['default'];
},{"../core/core":2,"../core/service-locator":6}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = function Component() {
  _classCallCheck(this, Component);
};

exports["default"] = Component;
module.exports = exports["default"];
},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Element = (function () {
  function Element() {
    _classCallCheck(this, Element);
  }

  _createClass(Element, [{
    key: 'createdCallback',
    value: function createdCallback() {
      this.createShadowRoot().innerHTML = '\n    <style>\n      :host {\n        display: block;\n      }\n    </style>\n    <div id="quotes"><div>\n    ';

      this.updateUi();
    }
  }, {
    key: 'attachedCallback',
    value: function attachedCallback() {
      console.log('attachedCallback');
    }
  }, {
    key: 'detachedCallback',
    value: function detachedCallback() {
      console.log('detachedCallback');
    }
  }, {
    key: 'attributeChangedCallback',
    value: function attributeChangedCallback() {
      console.log('attr changed');
    }
  }, {
    key: 'updateUi',
    value: function updateUi() {
      console.log('updateUi');
    }
  }, {
    key: 'myProp',
    get: function get() {
      var s = this.getAttribute('my-prop');
      return s ? JSON.parse(s) : [];
    },
    set: function set(val) {
      this.setAttribute('my-prop', JSON.stringify(val));
      this.updateUi();
    }
  }]);

  return Element;
})();

exports['default'] = Element;
module.exports = exports['default'];
},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Elements = (function (_BaseClass) {
	_inherits(Elements, _BaseClass);

	function Elements(id, options) {
		_classCallCheck(this, Elements);

		_get(Object.getPrototypeOf(Elements.prototype), 'constructor', this).call(this, id, options);
		this.logger.logApi('constructor', id);
	}

	return Elements;
})(_base2['default']);

exports['default'] = Elements;
module.exports = exports['default'];
},{"../base":1}],18:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _corePubsub = require('../core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Page = (function (_BaseClass) {
	_inherits(Page, _BaseClass);

	function Page(name, options) {
		_classCallCheck(this, Page);

		_get(Object.getPrototypeOf(Page.prototype), 'constructor', this).call(this, name, options);

		this.properties = {
			title: {
				type: String,
				value: null
			},
			backText: {
				type: String,
				value: null
			},
			backLink: {
				type: String,
				value: null
			},

			href: {
				type: String,
				notify: true,
				value: null,
				observer: '_tmplChanged'
			},
			active: {
				type: Boolean,
				value: false
			},
			dialog: {
				type: Boolean,
				value: false
			},

			query: {
				type: Object
			},
			context: {
				type: Object
			},

			view: {
				type: Object
			},

			fromPage: {
				type: Object
			},
			route: {
				type: String
			},

			url: {
				type: String
			},

			container: {
				type: String
			}
		};

		this.utils.addMixin(new _corePubsub2['default'](name), this);

		return this;
	}

	_createClass(Page, [{
		key: 'created',
		value: function created() {
			var logger = new px.mobile.Logger(this.tagName, {
				colors: {
					debug: 'color:orange'
				}
			});
			px.mobile.utils.addMixin(logger, this);
			this.log.logApi('created', this.id);
			this.emit('page:' + this.id + ':init', this);
		}
	}, {
		key: 'ready',
		value: function ready() {
			this.log.logApi('ready', this.id);
			if (this.dialog) {
				this.toggleClass('dialog');
			}
			this.emit('page:' + this.id + ':ready', this);
		}
	}, {
		key: 'show',
		value: function show() {
			console.warn('INFO', 'show view', this.id);
			this.toggleClass('current', false, this);
		}
	}, {
		key: 'hide',
		value: function hide() {
			console.warn('INFO', 'hide view', this.id);
			this.toggleClass('hidden', true, this);
		}
	}, {
		key: 'update',
		value: function update() {
			console.warn('INFO', 'update view', this.id);
		}
	}, {
		key: 'currentView',
		value: function currentView() {
			console.warn('INFO', 'current view', this.id);
			this.child()[0].toggleClass('current', true, this);
		}
	}, {
		key: 'nextView',
		value: function nextView() {
			console.warn('INFO', 'next view', this.id);
			this.toggleClass('next', true, this);
		}
	}, {
		key: 'previousView',
		value: function previousView() {
			console.warn('INFO', 'previous view', this.id);
			this.toggleClass('previous', true, this);
		}
	}, {
		key: 'contextChanged',
		value: function contextChanged(newContext, oldContext) {
			console.warn('contextChanged', newContext, oldContext);
		}
	}, {
		key: '_tmplChanged',
		value: function _tmplChanged(newVal, oldVal) {
			var _this = this,
			    html = '';
			if (newVal) {
				console.warn(this.id, 'Load remote html', newVal);
				this.importHref(newVal, function (e) {
					html = e.target['import'].body.innerHTML;
					_this.log.logApi('inject html', _this.id);
					console.warn('inject px-view html', _this.id);
					_this.html(html);
				}, function (e) {
					console.error('Error loading page', e);
				});
			}
		}
	}, {
		key: 'showMenu',
		value: function showMenu() {
			px.mobile.dom('px-app').toggleClass('show-menu');
		}
	}, {
		key: 'open',
		value: function open() {
			if (this.dialog) {
				this.toggleClass('open');
			}
		}
	}, {
		key: 'close',
		value: function close() {
			if (this.dialog) {
				this.toggleClass('open');
			}
		}
	}]);

	return Page;
})(_base2['default']);

exports['default'] = Page;
module.exports = exports['default'];
},{"../base":1,"../core/pubsub":3}],19:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _corePubsub = require('../core/pubsub');

var _corePubsub2 = _interopRequireDefault(_corePubsub);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var Pages = (function (_BaseClass) {
	_inherits(Pages, _BaseClass);

	function Pages(name, options) {
		_classCallCheck(this, Pages);

		_get(Object.getPrototypeOf(Pages.prototype), 'constructor', this).call(this, name, options);

		this.PageList = [];
		this.PageMap = {};

		return this;
	}

	_createClass(Pages, [{
		key: 'beforeRegister',
		value: function beforeRegister() {}
	}, {
		key: 'created',
		value: function created() {}
	}, {
		key: 'ready',
		value: function ready() {}
	}, {
		key: 'attached',
		value: function attached() {}
	}, {
		key: 'detached',
		value: function detached() {}
	}, {
		key: 'attributeChanged',
		value: function attributeChanged() {}
	}, {
		key: 'goto',
		value: function goto(indexOrId) {
			var page = this.PageMap[indexOrId] || this.PageList[indexOrId] | {};
			if (page) {
				this.gotoPage(indexOrId);
				return page;
			}
		}
	}, {
		key: 'gotoPage',
		value: function gotoPage(id) {
			var index = 0;
			if (this.PageMap[id]) {
				index = this.PageList.indexOf(this.PageMap[id]);
			}
			this.selected = index;
			this.logApi('gotoPage', id, index);
		}
	}, {
		key: 'gotoIndex',
		value: function gotoIndex(index) {
			this.logApi('gotoIndex', index);
			this.children[index].removeClass('previous');
			this.children[index].removeClass('next');
			this.selected = index;
		}
	}, {
		key: 'current',
		value: function current() {
			this.logApi('current', this.selected);
			this.gotoIndex(this.selected);
		}
	}, {
		key: 'prev',
		value: function prev() {
			if (this.selected <= 0) {
				if (this.loop) {
					this.reset(true);
				} else {
					this.current();
				}
			} else {
				this.gotoIndex(this.selected - 1);
			}
		}
	}, {
		key: 'next',
		value: function next() {
			this.logApi('next', this.selected);
			if (this.selected >= this.PageList.length - 1) {
				if (this.loop) {
					this.reset();
				} else {
					this.current();
				}
			} else {
				this.gotoIndex(this.selected + 1);
			}
		}
	}]);

	return Pages;
})(_base2['default']);

exports['default'] = Pages;
module.exports = exports['default'];
},{"../base":1,"../core/pubsub":3}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var View = (function () {
	function View(options) {
		_classCallCheck(this, View);

		console.warn('new View', options);
		this.id = options.id;
		this.params = options.params || {};
		this.url = options.url || '';
		this.main = options.main || false;
		this.element = document.createElement('pxm-view');
	}

	_createClass(View, [{
		key: 'toHTML',
		value: function toHTML() {
			this.log.logApi(this, this.element);
		}
	}]);

	return View;
})();

exports['default'] = View;
module.exports = exports['default'];
},{}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

var Views = (function (_BaseClass) {
	_inherits(Views, _BaseClass);

	function Views(options) {
		var _this = this;

		_classCallCheck(this, Views);

		_get(Object.getPrototypeOf(Views.prototype), 'constructor', this).call(this, options.id, options);
		this.id = options.id;
		this.selected = options.selected || 0;
		this.selectedView = {};
		this.views = [];
		this.viewMap = new Map();

		if (options.views) {
			options.views.forEach(function (view) {
				_this.add(view);
			});
		}

		this.selectViewByIndex(this.selected);
		return this;
	}

	_createClass(Views, [{
		key: 'created',
		value: function created() {
			this.log.logApi('Views created');
		}
	}, {
		key: 'attached',
		value: function attached() {
			this.log.logApi('Views attached');
		}
	}, {
		key: 'add',
		value: function add(v) {
			var view = new _view2['default'](v);
			view.index = this.views.length;
			this[view.id] = view;
			this.views.push(view);
			this.viewMap.set(view.id, view);
			return this;
		}
	}, {
		key: 'get',
		value: function get(key) {
			return this.viewMap.get(key);
		}
	}, {
		key: 'getViews',
		value: function getViews() {
			return this.viewMap.entries();
		}
	}, {
		key: 'selectView',
		value: function selectView(key) {
			this.log.logApi('Views.selectView()', key);
			this.selectedView = this.viewMap.get(key);
			this.selected = this.views.indexOf(this.selectedView);
			return this;
		}
	}, {
		key: 'getSelectedView',
		value: function getSelectedView() {
			return this.selectedView;
		}
	}, {
		key: 'getSelectedIndex',
		value: function getSelectedIndex() {
			return this.views.indexOf(this.getSelectedView());
		}
	}, {
		key: 'nextView',
		value: function nextView() {
			var items = this.views,
			    len = items.length,
			    counter = this.selected,
			    index = this.selected + 1;
			counter++;

			if (counter >= len) {
				this.log.logApi('Reached last item');
				counter = 0;
			}
			this.selected = counter;
			this.selectView(this.views[this.selected].id);

			this.log.logApi('nextView', items, len, 'index', index, 'selected', this.selected);
			return this.selected;
		}
	}, {
		key: 'prevView',
		value: function prevView() {
			var items = this.views,
			    len = items.length,
			    counter = this.selected,
			    index = this.selected;

			counter--;

			if (counter >= len) {
				counter = index - len;
			} else if (counter < 0) {
				counter = 0;
				this.log.logApi('Reached first item');
			}
			this.selected = counter;
			this.selectView(this.views[this.selected].id);

			this.log.logApi('prevView', items, len, 'index', index, 'selected', this.selected);

			return this.selected;
		}
	}, {
		key: 'selectViewByIndex',
		value: function selectViewByIndex(i) {
			this.selectView(this.views[i].id);
		}
	}, {
		key: 'changeView',
		value: function changeView(id) {
			this.selectView(id);
		}
	}]);

	return Views;
})(_base2['default']);

exports['default'] = Views;
module.exports = exports['default'];
},{"../base":1,"./view":20}],22:[function(require,module,exports){
(function (global){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DOM = (function () {
	function DOM(selector, context) {
		_classCallCheck(this, DOM);

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
			el = (context === undefined ? document : context)[matches](selector.slice(1));
			out = el.length < 2 ? el[0] : el;
		} catch (err) {}
		this.length = el.length || 0;
		Object.assign(this, out);
		return this;
	}

	_createClass(DOM, [{
		key: 'find',
		value: function find(selector, context) {}
	}, {
		key: 'clone',
		value: function clone() {}
	}, {
		key: 'each',
		value: function each(callback) {
			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = Array.from(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var el = _step.value;

					callback.call(el);
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			return this;
		}
	}, {
		key: 'addClass',
		value: function addClass(className) {
			return this.each(function () {
				if (this.classList) {
					this.classList.add(className);
				} else {
					this.className += ' ' + className;
				}
			});
		}
	}, {
		key: 'removeClass',
		value: function removeClass(className) {
			return this.each(function () {
				this.classList.remove(className);
			});
		}
	}, {
		key: 'hasClass',
		value: function hasClass(className) {
			if (this.classList) {
				return this.classList.contains(className);
			} else {
				return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
			}
		}
	}, {
		key: 'toggleClass',
		value: function toggleClass(className) {
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
	}, {
		key: 'css',
		value: function css(prop, value) {
			if (value) {
				this.style[prop] = value;
				return this;
			} else if (prop) {
				return this.style[prop];
			} else {
				return this.style;
			}
		}
	}, {
		key: 'attr',
		value: function attr(name, value) {
			name = name.toLowerCase();

			if (value) {
				this.setAttribute(name, value);
				return this;
			} else {
				return this.getAttribute(name);
			}
		}
	}, {
		key: 'data',
		value: function data(name, value) {
			if (value) {
				this.setAttribute('data-' + name, value);
				return this;
			} else {
				return this.getAttribute('data-' + name);
			}
		}
	}, {
		key: 'on',
		value: function on(event, callback) {
			return this.each(function () {
				this.addEventListener(event, callback, false);
			});
		}
	}, {
		key: '_on',
		value: function _on(eventName, eventHandler) {
			eventType = eventType.split(' ');
			for (var i = 0; i < eventType.length; i++) {
				this.addEventListener(eventType[i], callback);
			}
			return this;
		}
	}, {
		key: 'off',
		value: function off(eventName, eventHandler) {
			this.removeEventListener(eventName, eventHandler);
		}
	}, {
		key: 'trigger',
		value: function trigger(eventName, eventData) {
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
	}, {
		key: 'empty',
		value: function empty() {
			this.innerHTML = '';
			return this;
		}
	}, {
		key: 'html',
		value: function html(_html) {
			if (_html) {
				this.innerHTML = _html;
				return this;
			} else {
				return this.innerHTML;
			}
		}
	}, {
		key: 'text',
		value: function text(_text) {
			if (_text) {
				this.textContent = _text;
				return this;
			} else {
				return this.textContent;
			}
		}
	}, {
		key: 'next',
		value: function next() {
			return this.nextElementSibling;
		}
	}, {
		key: 'prev',
		value: function prev() {}
	}, {
		key: 'parent',
		value: function parent() {
			return this.parentNode;
		}
	}, {
		key: 'child',
		value: function child() {}
	}, {
		key: 'position',
		value: function position() {}
	}]);

	return DOM;
})();

exports['default'] = DOM;

var dom = function dom(selector, context, undefined) {

	var matches = ({
		'#': 'getElementById',
		'.': 'getElementsByClassName',
		'@': 'getElementsByName',
		'=': 'getElementsByTagName',
		'*': 'querySelectorAll'
	})[selector[0]];

	var out = null,
	    el;
	try {
		el = (context === undefined ? document : context)[matches](selector.slice(1));
		out = el.length < 2 ? el[0] : el;
	} catch (err) {}

	return out;
};

dom.extend = function (out) {
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

(function (win) {
	if (!win || !win.Element) {
		return;
	}

	win.Element.prototype.find = function (selector) {
		return dom(selector, this);
	};

	win.Element.prototype.append = function (el) {
		return this.appendChild(el);
	};

	win.Element.prototype.clone = function () {
		return this.cloneNode(true);
	};

	window.Element.prototype.hasClass = function (className) {
		if (this.classList) {
			return this.classList.contains(className);
		} else {
			return new RegExp('(^| )' + className + '( |$)', 'gi').test(this.className);
		}
	};

	win.Element.prototype.addClass = function (className) {
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

	win.Element.prototype.removeClass = function (className) {
		var el = this;
		if (el.classList && className) {
			el.classList.remove(className);
		} else if (el.classList && !className) {
			el.classList.forEach(function (cla) {
				el.removeClass(cla);
			});
		} else {
			el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
		}
		return this;
	};

	win.Element.prototype.toggleClass = function (className) {
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

	win.Element.prototype.css = function (prop, value) {
		if (value) {
			this.style[prop] = value;
			return this;
		} else if (prop) {
			return this.style[prop];
		} else {
			return this.style;
		}
	};

	win.Element.prototype.attr = function (name, value) {
		name = name.toLowerCase();

		if (value) {
			this.setAttribute(name, value);
			return this;
		} else {
			return this.getAttribute(name);
		}
	};

	win.Element.prototype.data = function (name, value) {
		if (value) {
			this.setAttribute('data-' + name, value);
			return this;
		} else {
			return this.getAttribute('data-' + name);
		}
	};

	win.Element.prototype.on = function (eventType, callback) {
		eventType = eventType.split(' ');
		for (var i = 0; i < eventType.length; i++) {
			this.addEventListener(eventType[i], callback);
		}
		return this;
	};

	win.Element.prototype.off = function (eventName, eventHandler) {
		this.removeEventListener(eventName, eventHandler);
	};

	win.Element.prototype.trigger = function (eventName, eventData) {
		var event;
		if (win.CustomEvent) {
			event = new CustomEvent(eventName, {
				detail: eventData
			});
		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(eventName, true, true, eventData);
		}
		return this.dispatchEvent(event);
	};

	win.Element.prototype.empty = function () {
		this.innerHTML = '';
		return this;
	};

	win.Element.prototype.html = function (html) {
		if (html) {
			this.innerHTML = html;
			return this;
		} else {
			return this.innerHTML;
		}
	};

	win.Element.prototype.text = function (text) {
		if (text) {
			this.textContent = text;
			return this;
		} else {
			return this.textContent;
		}
	};

	win.Element.prototype.next = function () {
		return this.nextElementSibling;
	};

	win.Element.prototype.parent = function () {
		return this.parentNode;
	};

	win.Element.prototype.remove = function () {
		return this.parentNode.removeChild(this);
	};

	win.Element.prototype.child = function (el) {
		if (el) {
			return this.querySelectorAll(el);
		} else {
			return this.children;
		}
	};

	win.Element.prototype.position = function () {
		var pos = {
			left: this.offsetLeft,
			top: this.offsetTop
		};
		return pos;
	};

	win.NodeList.prototype.addClass = function (name) {
		this.each(function (el) {
			el.classList.add(name);
		});
		return this;
	};

	win.NodeList.prototype.removeClass = function (name) {
		this.each(function (el) {
			el.classList.remove(name);
		});
		return this;
	};

	win.NodeList.prototype.find = function find(elem) {
		console.error('You cannot find in a NodeList. Just use $(*selector %s)', elem);
		return this;
	};

	win.NodeList.prototype.each = Array.prototype.forEach;

	win.NodeList.prototype.attr = function (name, value) {
		this.each(function (el) {
			if (value) {
				el.setAttribute(name, value);
			} else {
				return el.getAttribute(name);
			}
		});
		return this;
	};

	win.NodeList.prototype.toggleClass = function (className) {
		this.each(function (el) {
			el.toggleClass(className);
		});
		return this;
	};

	win.NodeList.prototype.css = function (prop, value) {
		this.each(function (el) {
			el.css(prop, value);
		});
		return this;
	};

	win.NodeList.prototype.on = function (eventType, callback) {
		this.each(function (el) {
			el.on(eventType, callback);
		});
		return this;
	};

	win.NodeList.prototype.first = function () {
		return this.length < 2 ? this : this[0];
	};

	win.NodeList.prototype.last = function () {
		return this.length > 1 ? this[this.length - 1] : this;
	};
})(typeof window == "undefined" ? global : window);

var $ = function $(selector) {
	return dom(selector);
};
exports.$ = $;
exports['default'] = dom;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],23:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interface = (function () {
	function Interface(name, methods) {
		_classCallCheck(this, Interface);

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

	_createClass(Interface, null, [{
		key: "ensureImplements",
		value: function ensureImplements(object) {
			if (arguments.length < 2) {
				throw new Error('Function Interface.ensureImplements called with ' + arguments.length + 'arguments, but expected at least 2.');
			}

			for (var i = 1, len = arguments.length; i < len; i++) {
				var _interface = arguments[i];
				if (_interface.constructor !== Interface) {
					throw new Error('Function Interface.ensureImplements expects arguments two and above to be instances of Interface.');
				}

				for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
					var method = _interface.methods[j];
					if (!object[method] || typeof object[method] !== 'function') {
						throw new Error('Function Interface.ensureImplements: object does not implement the ' + _interface.name + ' interface. Method ' + method + ' was not found. ');
					}
				}
			}
			return true;
		}
	}]);

	return Interface;
})();

exports["default"] = Interface;
module.exports = exports["default"];
},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _interface = require('./interface');

var _interface2 = _interopRequireDefault(_interface);

var Interfaces = {};

Interfaces.IDBInterface = new _interface2['default']('IDBInterface', ['getAttachment', 'saveAttachment', 'get', 'put', 'post', 'remove', 'allDocs', 'bulkDocs', 'changes']);

Interfaces.IHTTPInterface = new _interface2['default']('IHTTPInterface', ['get', 'put', 'post', 'delete', 'head', 'request']);

exports['default'] = Interfaces;
module.exports = exports['default'];
},{"./interface":23}],25:[function(require,module,exports){
'use strict';
Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Logger = (function () {
	function Logger() {
		var category = arguments.length <= 0 || arguments[0] === undefined ? 'log' : arguments[0];
		var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

		_classCallCheck(this, Logger);

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

	_createClass(Logger, [{
		key: 'log',
		value: function log(level, args) {
			var timestamp = new Date().toLocaleString();
			var log = window.console ? window.console.log.bind(window.console) : function () {};
			log('[' + timestamp + '] [' + level + '] [' + this.category + ']', arguments);
		}
	}, {
		key: 'debug',
		value: function debug(args) {
			return this.log('DEBUG', args);
		}
	}, {
		key: 'info',
		value: function info(args) {
			return this.log('INFO', args);
		}
	}, {
		key: 'warn',
		value: function warn(args) {
			return this.log('WARN', args);
		}
	}, {
		key: 'error',
		value: function error(args) {
			return this.log('ERROR', args);
		}
	}, {
		key: 'logApi',
		value: function logApi(method, params, success) {
			if (!params) {
				params = {};
			}
			console.log('%c[%s:api] %s %o', success ? this.colors.success : this.colors.debug, this.category, method, params);
		}
	}, {
		key: 'logHttp',
		value: function logHttp(method, url, success) {
			console.log('%c[%s:http] %c%s %c%o', success ? this.colors.success : this.colors.info, this.category, null, method, null, url);
		}
	}, {
		key: 'logTime',
		value: function logTime(name) {
			var start = new Date();
			return {
				end: function end() {
					return new Date().getMilliseconds() - start.getMilliseconds() + 'ms';
				}
			};
		}
	}]);

	return Logger;
})();

exports['default'] = Logger;
module.exports = exports['default'];
},{}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

exports.resolveURL = resolveURL;
exports.extend = extend;
exports.extendDeep = extendDeep;
exports.extendClass = extendClass;
exports.type = type;
exports.addMixin = addMixin;
exports.debounce = debounce;
exports.mixin = mixin;
exports.mix = mix;
exports.uuid = uuid;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function resolveURL() {
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

function extend(dest, src) {
	var out = dest;
	for (var i in src) {
		out[i] = src[i];
	}
	return out;
}

function extendDeep(parent, child) {
	var i,
	    toStr = Object.prototype.toString,
	    astr = '[object Array]';
	child = child || {};
	for (i in parent) {
		if (parent.hasOwnProperty(i)) {
			if (typeof parent[i] === 'object') {
				child[i] = toStr.call(parent[i]) === astr ? [] : {};
				extendDeep(parent[i], child[i]);
			} else {
				child[i] = parent[i];
			}
		}
	}
	return child;
}

function extendClass(child, parent) {
	var hasProp = ({}).hasOwnProperty;
	for (var key in parent) {
		if (hasProp.call(parent, key)) {
			child[key] = parent[key];
		}
	}

	function ctor() {
		this.constructor = child;
	}
	ctor.prototype = parent.prototype;
	child.prototype = new ctor();
	child.__super__ = parent.prototype;

	return child;
}

function type(obj) {
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

function addMixin(obj, mixin) {
	return this.extend(mixin, obj);
}

function debounce(name, func, wait, immediate) {
	var timeout;
	return function () {
		var context = this,
		    args = arguments;
		var later = function later() {
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

function mixin(target, source) {
	target = target.prototype;
	source = source.prototype;

	Object.getOwnPropertyNames(source).forEach(function (name) {
		if (name !== 'constructor') {
			Object.defineProperty(target, name, Object.getOwnPropertyDescriptor(source, name));
		}
	});
}

function mix() {
	var arg,
	    prop,
	    child = {};
	for (arg = 0; arg < arguments.length; arg += 1) {
		for (prop in arguments[arg]) {
			if (arguments[arg].hasOwnProperty(prop)) {
				child[prop] = arguments[arg][prop];
			}
		}
	}
	return child;
}

var chars = ('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz').split('');

function getValue(radix) {
	return 0 | Math.random() * radix;
}

function uuid(len, radix) {
	radix = radix || chars.length;
	var out = '';
	var i = -1;

	if (len) {
		while (++i < len) {
			out += chars[getValue(radix)];
		}
		return out;
	}

	while (++i < 36) {
		switch (i) {
			case 8:
			case 13:
			case 18:
			case 23:
				out += '-';
				break;
			case 19:
				out += chars[getValue(16) & 0x3 | 0x8];
				break;
			default:
				out += chars[getValue(16)];
		}
	}

	return out;
}

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

Interface.ensureImplements = function (object) {
	if (arguments.length < 2) {
		throw new Error('Function Interface.ensureImplements called with ' + arguments.length + 'arguments, but expected at least 2.');
	}

	for (var i = 1, len = arguments.length; i < len; i++) {
		var _interface = arguments[i];
		if (_interface.constructor !== Interface) {
			throw new Error('Function Interface.ensureImplements expects arguments two and above to be instances of Interface.');
		}

		for (var j = 0, methodsLen = _interface.methods.length; j < methodsLen; j++) {
			var method = _interface.methods[j];
			if (!object[method] || typeof object[method] !== 'function') {
				throw new Error('Function Interface.ensureImplements: object does not implement the ' + _interface.name + ' interface. Method ' + method + ' was not found. ');
			}
		}
	}
	return true;
};

var aggregation = function aggregation(baseClass) {
	for (var _len = arguments.length, mixins = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		mixins[_key - 1] = arguments[_key];
	}

	var base = (function (_baseClass) {
		_inherits(_Combined, _baseClass);

		function _Combined() {
			var _this = this;

			_classCallCheck(this, _Combined);

			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			_get(Object.getPrototypeOf(_Combined.prototype), 'constructor', this).apply(this, args);
			mixins.forEach(function (mixin) {
				mixin.prototype.initializer.call(_this);
			});
		}

		return _Combined;
	})(baseClass);
	var copyProps = function copyProps(target, source) {
		Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source)).forEach(function (prop) {
			if (prop.match(/^(?:constructor|prototype|arguments|caller|name|bind|call|apply|toString|length)$/)) {
				return;
			}

			Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
		});
	};
	mixins.forEach(function (mixin) {
		copyProps(base.prototype, mixin.prototype);
		copyProps(base, mixin);
	});
	return base;
};
exports.aggregation = aggregation;
},{}]},{},[13]);
