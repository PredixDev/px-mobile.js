'use strict';
import BaseClass from '../base';

//regex for stripping a leading hash/slash and trailing space.
var routeStripper = /^[#\/]|\s+$/g;

//regex for stripping leading and trailing slashes.
var rootStripper = /^\/+|\/+$/g;

// regex for stripping urls of hash.
var pathStripper = /#.*$/;

/**
 * Router history manages the state of the router.
 * Handles cross-browser history management, based on either pushState and real URLs, or onhashchange and URL fragments.
 * Inspired by http://backbonejs.org/docs/backbone.html#section-196
 */
export default class RouterHistory extends BaseClass {
	constructor(name, options = {
		root: '/'
	}) {
		super(name, options);
		this.root = ('/' + this.root + '/').replace(rootStripper, '#/');

		if (typeof window !== 'undefined') {
			this.location = window.location;
			this.history = window.history;
		}
		this.pushState = options.pushState || false;
		return this;
	}

	go(route, options) {
			if (this.pushState) {
				this.history.pushState(options, document.title, route);
			} else {
				this.location.hash = route;
			}
		}
		/**
		 *
		 */
	state() {
			return this.history.state;
		}
		/**
		 *
		 */
	back() {
		return this.history.back();
	}

	/**
	 *
	 */
	forward() {
		return this.history.forward();
	}

	atRoot() {
		var path = this.location.pathname.replace(/[^\/]$/, '$&/');
		return path === this.root && !this.getSearch();
	}

	matchRoot() {
		var path = this.decodeFragment(this.location.pathname);
		var root = path.slice(0, this.root.length - 1) + '/';
		return root === this.root;
	}

	decodeFragment(fragment) {
		return decodeURI(fragment.replace(/%25/g, '%2525'));
	}

	/**
	 *
	 */
	getSearch() {
		var match = this.location.href.replace(/#.*/, '').match(/\?.+/);
		return match ? match[0] : '';
	}

	/**
	 * Gets the true hash value.
	 */
	getHash(window) {
		var match = (window || this).location.href.match(/#(.*)$/);
		return match ? match[1] : '';
	}

	/**
	 * Get the pathname and search params, without the root.
	 */
	getPath() {
			var path = this.decodeFragment(this.location.pathname + this.getSearch()).slice(this.root.length - 1);
			return path.charAt(0) === '/' ? path.slice(1) : path;
		}
		/**
		 * Get the browser normailzed URL fragment form the path or hash.
		 */
	getFragment(fragment) {
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
}
