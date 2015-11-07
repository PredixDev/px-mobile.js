'use strict';
import PubSub from '../core/pubsub';
import BaseClass from '../base';

/**
 * @description Pages class has methods for managing a collection of pages.
 */
export default class Pages extends BaseClass {
	constructor(name, options) {
		super(name, options);

		this.PageList = [];
		this.PageMap = {};

		return this;
	}

	beforeRegister() {


	}
	created() {}
	ready() {}
	attached() {}
	detached() {}
	attributeChanged() {}

	goto(indexOrId) {
		var page = this.PageMap[indexOrId] || this.PageList[indexOrId] | {};
		if (page) {
			this.gotoPage(indexOrId);
			return page;
		}
	}
	gotoPage(id){
		var index = 0;
		if (this.PageMap[id]) {
			index = this.PageList.indexOf(this.PageMap[id]);
		}
		this.selected = index;
		this.logApi('gotoPage', id, index);
	}
	gotoIndex(index){
		this.logApi('gotoIndex', index);
		this.children[index].removeClass('previous');
		this.children[index].removeClass('next');
		this.selected = index;
	}
	current(){
		this.logApi('current', this.selected);
		this.gotoIndex(this.selected);
	}
	prev(){
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
	next(){
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
}
