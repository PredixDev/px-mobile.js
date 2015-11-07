'use strict';
import PubSub from '../core/pubsub';
import BaseClass from '../base';

/**
 * @description Page class has methods for managing a page.
 */
export default class Page extends BaseClass {
	constructor(name, options) {
		super(name, options);



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
			//Path to remote view that will be loaded
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
			//with URL query parameters. If your page URL is "about.html?id=10&count=20&color=blue"
			query: {
				type: Object
			},
			context: {
				type: Object
			},
			//View instance that contains this page (if this View was initialized)
			view: {
				type: Object
			},
			//Page Data object of the previously active page
			fromPage: {
				type: Object
			},
			route: {
				type: String
			},
			//Contains string URL of just loaded page
			url: {
				type: String
			},
			//Link to Page HTMLElement
			container: {
				type: String
			}
		};

		this.utils.addMixin(new PubSub(name), this);


		return this;
	}
	created() {
		const logger = new px.mobile.Logger(this.tagName, {
			colors: {
				debug: 'color:orange'
			}
		});
		px.mobile.utils.addMixin(logger, this);
		this.log.logApi('created', this.id);
		this.emit(`page:${ this.id }:init`, this);
	}
	ready() {
		this.log.logApi('ready', this.id);
		if (this.dialog) {
			this.toggleClass('dialog');
		}
		this.emit(`page:${ this.id }:ready`, this);
	}
	show() {
		console.warn('INFO', 'show view', this.id);
		this.toggleClass('current', false, this);
	}
	hide() {
		console.warn('INFO', 'hide view', this.id);
		this.toggleClass('hidden', true, this);
	}
	update() {
		console.warn('INFO', 'update view', this.id);
	}
	currentView() {
		console.warn('INFO', 'current view', this.id);
		this.child()[0].toggleClass('current', true, this);
	}
	nextView() {
		console.warn('INFO', 'next view', this.id);
		this.toggleClass('next', true, this);
	}
	previousView() {
		console.warn('INFO', 'previous view', this.id);
		this.toggleClass('previous', true, this);
	}
	contextChanged(newContext, oldContext) {
			console.warn('contextChanged', newContext, oldContext);
		}
		//I handle loading a page from a url
	_tmplChanged(newVal, oldVal) {
		let _this = this,
			html = '';
		if (newVal) {
			console.warn(this.id, 'Load remote html', newVal);
			this.importHref(newVal, e => {
				html = e.target.import.body.innerHTML;
				_this.log.logApi('inject html', _this.id);
				console.warn('inject px-view html', _this.id);
				_this.html(html);
			}, e => {
				// loading error
				console.error('Error loading page', e);
			});
		}
	}
	showMenu() {
		px.mobile.dom('px-app').toggleClass('show-menu');
	}
	open() {
		if (this.dialog) {
			this.toggleClass('open');
		}
	}
	close() {
		if (this.dialog) {
			this.toggleClass('open');
		}
	}
}
