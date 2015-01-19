/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

(function (define, nextTick) {
	'use strict';

	/*globals describe, it, beforeEach, afterEach */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/interceptor/retry', function () {

			var interceptor, retry, rest, when, clock;

			interceptor = require('../interceptor');
			retry = require('./retry');
			rest = require('../client/default');
			when = require('when');

			it('should retry until successful', function () {
				var count = 0, client = retry(
					function (request) {
						count += 1;
						if (count === 2) {
							return { request: request, status: { code: 200 } };
						} else {
							return when.reject({ request: request, error: 'Thrown by fake client' });
						}
					}
				);
				return client({}).then(function (response) {
					expect(response.status.code).to.equal(200);
				});
			});

			describe('should accept custom config', function () {

				beforeEach(function () {
					clock = sinon.useFakeTimers();
				});
				afterEach(function () {
					clock.restore();
				});

				it('', function () {
					var count = 0, client, start, config;

					start = new Date().getTime();
					config = { initial: 10, multiplier: 3, max: 20 };
					client = retry(
						function (request) {
							var tick = Math.min(Math.pow(config.multiplier, count) * config.initial, config.max);
							count += 1;
							if (count === 4) {
								return { request: request, status: { code: 200 } };
							} else {
								nextTick(function () {
									clock.tick(tick);
								}, 0);
								return when.reject({ request: request, error: 'Thrown by fake client' });
							}
						},
						config
					);

					return client({}).then(function (response) {
						expect(response.status.code).to.equal(200);
						expect(count).to.equal(4);
						expect(new Date().getTime() - start).to.equal(50);
					});
				});

			});

			it('should not make propagate request if marked as canceled', function () {
				var parent, client, request, response;

				parent = sinon.spy(function (request) {
					return when.reject({ request: request });
				});
				client = retry(parent, { initial: 10 });

				request = {};
				response = client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(request.canceled).to.be.true();
						expect(response.error).to.equal('precanceled');
						expect(parent).to.have.callCount(1);
					}
				);
				request.canceled = true;

				return response;
			});

			it('should have the default client as the parent by default', function () {
				expect(retry().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(retry().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	// retain access to the native setTimeout function
	(function (setTimeout) {
		return typeof process !== 'undefined' && process.nextTick ?
			function (work) {
				process.nextTick(work);
			} :
			function (work) {
				setTimeout(work, 0);
			};
	}(setTimeout))
	// Boilerplate for AMD and Node
));
