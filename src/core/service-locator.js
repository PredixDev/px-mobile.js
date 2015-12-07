// TODO: Service Location
/**
 * A simple Service Locator that handles regisering services and resolving services.
 * @example
 var app = new px.mobile.App();
 app.register('router', new px.mobile.Router('default', {
	 routes: {
		 '/users': {
			 callback: function(req, res) {
				 console.warn('route callback', req, res);
			 },
			 resolve: {
				 users: function() {
					 return new Promise(function(resolve, reject) {
						 setTimeout(function() {
							 resolve({});
						 }, 5000);
					 });
				 }
			 }
		 }
	 }
 }));
 */
let _instance = null;
let _services = {};
export default class ServiceLocator {
	constructor(options) {
		this.services = _services;
		this.options = options || {};
		return this;
	}
	register(key, service) {
		_services[key] = service;
		return this;
	}
	resolve(key) {
			return _services[key];
		}
		/**
		* I start a service by calling the start() method on the service.
		*/
	start(key) {
		var service = _services[key];
		console.warn('Starting service', key, service);
		return service.start();
	}

	startAll() {
		var all = [];
		console.warn('startAll', _services);
		for (var service in _services) {
			console.warn('Starting service', service);
			all.push(this.start(service));
		}
		return all;
	}

	reset() {
			_services = {};
      this.services = _services;
			return this;
		}
		/**
		* Return the ServiceLocator _instance.
		* @return the _instance.
		*/
	static getInstance() {
		if (_instance == null) {
			_instance = new ServiceLocator();
		}
		return _instance;
	}
}
