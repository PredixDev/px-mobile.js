import BaseClass from '../base';
//import Router from './router';
import ServiceLocator from '../core/service-locator';
let _instance = null;

/**
 * The App class is used to manage the state of an application.
 * @example
 *	var app = new px.mobile.App('myApp', {
 *	debug: true,
 *	viewContainer: document.getElementById('appViews'),
 *	navbar: document.getElementById('navbar'),
 *	el: '#emApp',
 *	session: {
 *		user: null
 *	}
 * });
 * var pubsub = new px.mobile.PubSub('emPubSub');
 * var db = new px.mobile.DB('emDB', {
 *		baseUrl: 'http://pmapi/cdb/predixgo'
 * });
 * var http = new px.mobile.HTTP('emHTTP', {
 *	 baseUrl: '/'
 * });
 * app.services.register('db', db);
 * app.services.register('http', http);
 * app.services.register('pubsub', pubsub);
 */
export default class App extends BaseClass {

	/**
	 * Return the ServiceLocator _instance.
	 * @return the _instance.
	 */
	static getInstance() {
		if (_instance === null) {
			_instance = new App();
		}
		return _instance;
	}

	constructor(name, options) {
		super(name, options);
		this.modules = {};
		this.session = {};

		//	this.router = new Router(name, options.routes);
		this.services = new ServiceLocator(name, options);

		// Default Parameters
		this.params = {

			cache: true,
			cacheIgnore: [],
			cacheIgnoreGetParameters: false,
			cacheDuration: 1000 * 60 * 10, // Ten minutes
			preloadPreviousPage: true,
			uniqueHistory: false,
			uniqueHistoryIgnoreGetParameters: false,
			dynamicPageUrl: 'content-{{index}}',
			allowDuplicateUrls: false,
			router: true,

			// Push State
			pushState: false,
			pushStateRoot: undefined,
			pushStateNoAnimation: false,
			pushStateSeparator: '#!/',
			pushStatePreventOnLoad: true,

			// Fast clicks
			fastClicks: true,
			fastClicksDistanceThreshold: 10,
			fastClicksDelayBetweenClicks: 50,

			// Tap Hold
			tapHold: false,
			tapHoldDelay: 750,
			tapHoldPreventClicks: true,

			// Active State
			activeState: true,
			activeStateElements: 'a, button, label, span',

			// Animate Nav Back Icon
			animateNavBackIcon: false,

			// Swipe Back
			swipeBackPage: true,
			swipeBackPageThreshold: 0,
			swipeBackPageActiveArea: 30,
			swipeBackPageAnimateShadow: true,
			swipeBackPageAnimateOpacity: true,

			// Ajax
			ajaxLinks: undefined, // or CSS selector

			// External Links
			externalLinks: '.external', // CSS selector

			// Sortable
			sortable: true,

			// Scroll toolbars
			hideNavbarOnPageScroll: false,
			hideToolbarOnPageScroll: false,
			hideTabbarOnPageScroll: false,
			showBarsOnPageScrollEnd: true,
			showBarsOnPageScrollTop: true,

			// Tap Navbar or Statusbar to scroll to top
			scrollTopOnNavbarClick: false,
			scrollTopOnStatusbarClick: false,

			// Modals
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

			// Lazy Load
			imagesLazyLoadThreshold: 0,
			imagesLazyLoadSequential: true,

			// Name space
			viewClass: 'pxm-view',
			viewMainClass: 'pxm-view-main',
			viewsClass: 'pxm-views',

			// Animate Pages
			animatePages: true,

			// Templates
			templates: {},
			templateData: {},
			templatePages: false,
			precompileTemplates: false,

			// Auto init
			init: true
		};

		// Extend defaults with parameters
		for (var param in options) {
			this.params[param] = options[param];
		}
	}

	configureRouter(config, router) {
		config.title = 'App';
		config.map([
			{
				route: ['', 'welcome'],
				name: 'welcome',
				moduleId: 'welcome',
				nav: true,
				title: 'Welcome'
			}
    ]);

		this.router = router;
	}

	/**
	 * Handle starting all registered services.
	 */
	start() {
		this.log.logApi('start', this);
		return Promise.all(this.services.startAll());
	}

	/**
	 * Handle bootstrapping application.
	 * @param {Function} cb - The callback function to execute when done.
	 */
	bootstrap(cb) {
		this.log.logApi('bootstrap', this);
		cb(this);
	}

	/**
	 * Handle running the application.
	 * @param {Function} cb - The callback function to execute when done.
	 */
	run(cb) {
		this.log.logApi('run', this);
		this.start();
		cb(this);
	}

}
