'use strict';
import BaseClass from '../base';
import Logger from '../utils/log';
import dom from '../utils/dom';
/**
 * PubSub class provides event dispatching.
 * @example
 * var pubsub = new PubSub('namespace');
			 pubsub.publish('event', {name: value});

 * @param {String} name - The name of the pubsub.
 * @return {PubSub} Instance of the pubsub.
 */
export default class PubSub {
	constructor(name = 'pubsub', options = {}) {
		//	super(name, options);
		this.log = new Logger(name, {
			colors: {
				debug: 'color:orange'
			}
		});

		/**
		 * @type {Object} Storage for topics that can be broadcast or listened to
		 */
		this.topics = {};

		/**
		 * @type {Number} A topic identifier
		 */
		this.subUid = -1;
		return this;
	}

	start() {

	}

	/**
	 * Publish or broadcast events of interest with a specific topic name and arguments such as the data to pass along
	 * @example
	 * pubsub.publish('event', {name: 'value'});
	 * @param {String} topic - The event topic name
	 * @return {PubSub}
	 */
	publish(topic, args) {
		let topics = this.topics;

		if (!topics[topic]) {
			return false;
		}

		var subscribers = topics[topic],
			len = subscribers ? subscribers.length : 0;

		while (len--) {
			subscribers[len].func(topic, args);
		}

		return this;
	}

	/**
	 * Subscribe to events of interest with a specific topic name and a callback function, to be executed when the topic/event is observed
	 * @example
	 * pubsub.subscribe('event', function(data){

		});
	 * @param {String} topic - The name of the event.
	 * @return {String} A string token
	 */
	subscribe(topic, fn) {
		let topics = this.topics;

		if (!topics[topic]) {
			topics[topic] = [];
		}

		var token = (++this.subUid).toString();

		this.topics[topic].push({
			token: token,
			func: fn
		});
		return token;
	}

	/**
	 * Unsubscribe from a specific topic, based on a tokenized reference to the subscription
	 * @example
	 *
	 * @param {String} token - The event token
	 * @return {PubSub} PubSub instance
	 */
	unsubscribe(token) {
		let topics = this.topics;
		for (var m in topics) {
			if (topics[m]) {
				for (var i = 0, j = topics[m].length; i < j; i++) {
					if (topics[m][i].token === token) {
						topics[m].splice(i, 1);
						return token;
					}
				}
			}
		}
		return this;
	}

	static emit(event, data) {
		return dom('*body').trigger(event, data);
	}

	static on(event, cb) {
		return dom('*body').on(event, cb);
	}
}
