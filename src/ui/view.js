/**
 * View class provides event dispatching.
 * @example
 * var View = new View('namespace');
			 View.publish('event', {name: value});

 * @param {String} name - The name of the View.
 * @return {View} Instance of the View.
 */
export default class View {

	constructor(options) {
		console.warn('new View', options);
		this.id = options.id;
		this.params = options.params || {};
		this.url = options.url || '';
		this.main = options.main || false;
		this.element = document.createElement('pxm-view');
	}
	toHTML() {
		this.log.logApi(this, this.element);
	}
}
