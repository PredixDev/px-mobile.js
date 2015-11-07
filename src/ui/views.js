import BaseClass from '../base';
import View from './view';



/**
 * Views class provides event dispatching.
 * @example
 * var Views = new Views('namespace');
			 Views.publish('event', {name: value});

 * @param {String} name - The name of the Views.
 * @return {Views} Instance of the Views.
 */
export default class Views extends BaseClass {

	constructor(options) {
		super(options.id, options);
		this.id = options.id;
		this.selected = options.selected || 0;
		this.selectedView = {};
		this.views = [];
		this.viewMap = new Map();
		//	this.router = new Router(options);

		if (options.views) {
			options.views.forEach((view) => {
				this.add(view);
			});
		}

		this.selectViewByIndex(this.selected);
		return this;
	}

	created() {
		this.log.logApi('Views created');
	}

	attached() {
		this.log.logApi('Views attached');
	}

	add(v) {
		let view = new View(v);
		view.index = this.views.length;
		this[view.id] = view;
		this.views.push(view);
		this.viewMap.set(view.id, view);
		return this;
	}

	get(key) {
		return this.viewMap.get(key);
	}

	getViews() {
		return this.viewMap.entries();
	}

	selectView(key) {
		this.log.logApi('Views.selectView()', key);
		this.selectedView = this.viewMap.get(key);
		this.selected = this.views.indexOf(this.selectedView);
		return this;
	}

	getSelectedView() {
		return this.selectedView;
	}

	getSelectedIndex() {
		return this.views.indexOf(this.getSelectedView());
	}

	nextView() {
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

	prevView() {
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

	selectViewByIndex(i) {
		this.selectView(this.views[i].id);
	}

	changeView(id) {
		this.selectView(id);
	}

}
