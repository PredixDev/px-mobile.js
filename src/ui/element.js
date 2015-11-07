export default class Element {
  // Use createdCallback instead of constructor to init an element.
  createdCallback() {
    this.createShadowRoot().innerHTML = `
    <style>
      :host {
        display: block;
      }
    </style>
    <div id="quotes"><div>
    `;
    // Update the ticker prices.
    this.updateUi();
  }
  attachedCallback() {
    console.log('attachedCallback');
  }
  detachedCallback() {
    console.log('detachedCallback');
  }
  attributeChangedCallback() {
    console.log('attr changed');
  }
  updateUi() {
    console.log('updateUi');
  }
  get myProp() {
    let s = this.getAttribute('my-prop');
    return s ? JSON.parse(s) : [];
  }
  set myProp(val) {
    this.setAttribute('my-prop', JSON.stringify(val));
    this.updateUi();
  }
}
//document.registerElement('pxm-element', Element);
