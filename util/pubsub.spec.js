/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	/*globals describe, it */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/util/pubsub', function () {

			var pubsub = require('./pubsub');

			it('should pass arguments to subscribed listener', function () {
				var callback = sinon.spy();
				pubsub.subscribe('topic', callback);
				pubsub.publish('topic', 'result');
				expect(callback).to.have.callCount(1);
				expect(callback).to.be.calledWith('result');
			});

			it('should ignore publish with no listeners', function () {
				var callback = sinon.spy();
				pubsub.subscribe('topic', callback);
				pubsub.publish('othertopic', 'result');
				expect(callback).to.have.callCount(0);
			});

			it('should unsubscribe listener after publish', function () {
				var callback = sinon.spy();
				pubsub.subscribe('topic', callback);
				pubsub.publish('topic', 'result');
				pubsub.publish('topic', 'result2');
				expect(callback).to.have.callCount(1);
				expect(callback).to.be.calledWith('result');
			});

			it('should only call most recent listener', function () {
				var callback1, callback2;
				callback1 = sinon.spy();
				callback2 = sinon.spy();
				pubsub.subscribe('topic', callback1);
				pubsub.subscribe('topic', callback2);
				pubsub.publish('topic', 'result');
				expect(callback1).to.have.callCount(0);
				expect(callback2).to.have.callCount(1);
				expect(callback2).to.be.calledWith('result');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
