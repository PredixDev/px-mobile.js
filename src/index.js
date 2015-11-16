/*global require*/
'use strict';

// TODO: Vendor
//require('../vendor/overthrow/overthrow')
//require('../../vendor/es6-shim')
//require('../../bower_components/fetch/fetch.js')
//xrequire('../../bower_components/es6-shim/es6-shim.js')



// TODO: Core scripts
import BaseClass from './base';
import Core from './core/core';
import ServiceLocator from './core/service-locator';
import RouterHistory from './core/router-history';
import Router from './core/router';
import SimpleRouter from './core/simple-router';
import PubSub from './core/pubsub';

// TODO: Data scripts
import Collection from './ds/collection';
import HTTP from './ds/http';
import DB from './ds/db';
import Model from './ds/model';

// TODO: Elements
import pmPage from './elements/pm-page';

// TODO: UI
import App from './core/app';
import Element from './ui/element';
import Elements from './ui/elements';
import Page from './ui/page';
import Pages from './ui/pages';
import Views from './ui/views';
import View from './ui/view';

// TODO: Components
import Component from './ui/component';

// TODO: Uitls
import * as utils from './utils/utils';
import Interface from './utils/interface';
import Interfaces from './utils/interfaces';
import Logger from './utils/log';
import dom from './utils/dom';
import {
	$
}
from './utils/dom';

var pxMobile = {
	debug: true,
	version: 'es6',
	behaviors: {},

	//Core
	BaseClass,
	Core,
	SimpleRouter,
	Router,
	RouterHistory,
	ServiceLocator,
	PubSub,

	//Data
	Collection,
	DB,
	HTTP,
	Model,
	//UI
	App,
	Page,
	Pages,
	View,
	Views,
	Element,
	Elements,

	//Utils
	$,
	utils,
	Logger,
	Interface,
	Interfaces,
	dom,
	ui: {
		App,
		Component,
		Element,
		Page,
		Pages,
		View,
		Views
	},
	elements: {
		pmPage
	}
};


export default pxMobile;
