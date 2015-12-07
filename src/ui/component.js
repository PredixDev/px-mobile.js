/*
createdCallback – Called when a custom element is created.
attachedCallback – Called when a custom element is inserted into the DOM.
detachedCallback – Called when a custom element is removed from the DOM.
attributeChangedCallback(attrName, oldValue, newValue) – Called when an attribute on a custom element changes.


var XTreehouseProto = Object.create(HTMLElement.prototype);

XTreehouseProto.createdCallback = function() {}
XTreehouseProto.attachedCallback = function() {}
XTreehouseProto.detachedCallback = function() {}
XTreehouseProto.attributeChangedCallback = function(attrName, oldValue, newValue) {}

var XTreehouse = document.registerElement('x-treehouse', {
  prototype: XTreehouseProto
});
*/
export default class Component {
	
}
