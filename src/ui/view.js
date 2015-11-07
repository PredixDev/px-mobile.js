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

/*


//Produces a DOM element to be assigned to your view. Exposed for subclasses using an alternative DOM manipulation API
_createElement: function(tagName) {
		 return document.createElement(tagName);
	 },
//Ensure that the View has a DOM element to render into.
	 _ensureElement: function() {
	      if (!this.el) {
	        var attrs = _.extend({}, _.result(this, 'attributes'));
	        if (this.id) attrs.id = _.result(this, 'id');
	        if (this.className) attrs['class'] = _.result(this, 'className');
	        this.setElement(this._createElement(_.result(this, 'tagName')));
	        this._setAttributes(attrs);
	      } else {
	        this.setElement(_.result(this, 'el'));
	      }
	    },

//Set attributes from a hash on this view’s element. Exposed for subclasses using an alternative DOM manipulation API.
			_setAttributes: function(attributes) {
			      this.$el.attr(attributes);
			    }
*/
