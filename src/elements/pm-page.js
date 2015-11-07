import Logger from '../utils/log';
import * as utils from '../utils/utils';


export default class pmPage {
  createdCallback() {
    const logger = new Logger(this.localName, {
      colors: {
        debug: 'color:orange'
      }
    });
    utils.addMixin(logger, this);

    this.properties = {
      //Title of the page
      title: {
        type: String,
        value: 'Page Title'
      },
      //Text for the back button
      backText: {
        type: String,
        value: null
      },
      //Enable back button
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
      //If the page is the current page.
      active: {
        type: Boolean,
        value: false
      },
      //If the page is a dialog
      modal: {
        type: Boolean,
        value: false
      },
      //with URL query parameters. If your page URL is "about.html?id=10&count=20&color=blue"
      query: {
        type: Object
      },
      //The context that was passed for this page when using pxm-pages
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

    this.createShadowRoot().innerHTML =
      `
					<style>
						:host {
					    display: block;
					    box-sizing: border-box;
					    -webkit-transition: all 0.4s ease-out;
					    transition: all 0.4s ease-out;
					  }
						:host header{
						  padding: 10px;
						}
					  :host .close-btn{
					    cursor: pointer;
					    position: absolute;
					    right: .1em;
					    top: .2em;
					    width: 44px;
					    height: 44px;
					    display: block;
					  }
				    :host .hamburger {
				      width: 20px;
				      height: 2px;
				      background: #000;
				      display: block;
				      position: absolute;
				      top: 50%;
				      left: 15%;
				      transition: transform 300ms;
				    }
					  :host .hamburger-1 {
					    transform: translate3d(0, 0, 0) rotate(45deg);
					  }
					  :host .hamburger-2 {
					    transform: translate3d(0, 0, 0) rotate(-45deg);
					  }
					</style>
					<div class="page-content overthrow">
						<content></content>
					</div>
					`;

    this.logApi('created', this.id);

  }
  ready() {
    this.logApi('ready', this.id);
    if (this.modal) {
      this.toggleClass('modal');
    }
    //return this.emit('init', this);
  }
  attachedCallback() {
    //  return this.emit('after:init', this);
  }
  detachedCallback() {

  }
  attributeChangedCallback(prop, oldVal, newVal) {

  }
  show() {
    this.logApi('show view', this.id);
    this.toggleClass('current', false, this);
  }
  hide() {
    this.logApi('hide view', this.id);
    this.toggleClass('hidden', true, this);
  }
  update() {
    this.logApi('update view', this.id);
  }
  currentView() {
    this.logApi('current view', this.id);
    this.child()[0].toggleClass('current', true, this);
  }
  nextView() {
    this.logApi('next view', this.id);
    this.toggleClass('next', true, this);
  }
  previousView() {
    this.logApi('previous view', this.id);
    this.toggleClass('previous', true, this);
  }
  contextChanged(newContext, oldContext) {
    this.logApi('contextChanged', newContext, oldContext);
  }

  //I handle loading a page from a url
  _tmplChanged(newVal, oldVal) {
    let _this = this,
      html = '';
    if (newVal) {
      this.logApi(this.id, 'Load remote html', newVal);
      this.importHref(newVal, e => {
        html = e.target.import.body.innerHTML;
        _this.logApi('inject html', _this.id);
        _this.logApi('inject px-view html', _this.id);
        _this.html(html);
      }, e => {
        // loading error
        _this.logApi('Error loading page', e);
      });
    }
  }
  showMenu() {
    px.mobile.dom('pxm-app').toggleClass('show-menu');
  }
  open() {
    this.logApi('open', this);
    this.addClass('active');
  }
  close() {
    this.logApi('close', this);
    this.removeClass('active');
  }
  toggle() {
    this.logApi('toggle', this);
    this.toggleClass('active');
  }
}
