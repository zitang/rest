/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
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


		describe('rest/interceptor/timeout', function () {

			var timeout, rest, when;

			timeout = require('./timeout');
			rest = require('../client/default');
			when = require('when');

			function hangClient(/* request */) {
				return when.defer().promise;
			}

			function immediateClient(request) {
				return { request: request };
			}

			function delayedClient(request) {
				return when({ request: request }).delay(50);
			}

			function cancelableClient(request) {
				/*jshint validthis:true */
				var d = when.defer();
				request.canceled = false;
				request.cancel = sinon.spy(function () {
					request.canceled = true;
					d.resolver.reject({ request: request });
				});
				return d.promise;
			}

			it('should resolve if client responds immediately', function () {
				var client, request;
				client = timeout(immediateClient, { timeout: 20 });
				request = {};
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.error).to.not.exist();
					return when().delay(40).then(function () {
						// delay to make sure timeout has fired, but not rejected the response
						expect(request.canceled).to.not.be.ok();
					});
				});
			});

			it('should resolve if client responds before timeout', function () {
				var client, request;
				client = timeout(delayedClient, { timeout: 200 });
				request = {};
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.error).to.not.exist();
					expect(request.canceled).to.not.be.ok();
				});
			});

			it('should reject even if client responds after timeout', function () {
				var client, request;
				client = timeout(delayedClient, { timeout: 10 });
				request = {};
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(response.error).to.equal('timeout');
						expect(request.canceled).to.be.true();
					}
				);
			});

			it('should reject if client hanges', function () {
				var client, request;
				client = timeout(hangClient, { timeout: 50 });
				request = {};
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(response.error).to.equal('timeout');
						expect(request.canceled).to.be.true();
					}
				);
			});

			it('should use request timeout value in perference to interceptor value', function () {
				var client, request;
				client = timeout(delayedClient, { timeout: 10 });
				request = { timeout: 0 };
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.error).to.not.exist();
					expect(request.canceled).to.not.be.ok();
				});
			});

			it('should not reject without a configured timeout value', function () {
				var client, request;
				client = timeout(delayedClient);
				request = {};
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.error).to.not.exist();
					expect(request.canceled).to.not.be.ok();
				});
			});

			it('should cancel request if client support cancelation', function () {
				var client, request, response;
				client = timeout(cancelableClient, { timeout: 11 });
				request = {};
				response = client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(response.error).to.equal('timeout');
						expect(request.cancel).to.have.callCount(1);
						expect(request.canceled).to.be.true();
					}
				);
				expect(request.canceled).to.not.be.ok();
				return response;
			});

			it('should not cancel request if transient config enabled', function () {
				var client, request, response;
				client = timeout(cancelableClient, { timeout: 11, transient: true });
				request = {};
				response = client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(response.error).to.equal('timeout');
						expect(request.cancel).to.have.callCount(1);
						expect(request.canceled).to.be.false();
					}
				);
				expect(request.canceled).to.not.be.ok();
				return response;
			});

			it('should use request transient value rather then interceptor', function () {
				var client, request, response;
				client = timeout(cancelableClient, { timeout: 11, transient: false });
				request = { transient: true };
				response = client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(response.error).to.equal('timeout');
						expect(request.cancel).to.have.callCount(1);
						expect(request.canceled).to.be.false();
					}
				);
				expect(request.canceled).to.not.be.ok();
				return response;
			});

			it('should have the default client as the parent by default', function () {
				expect(timeout().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(timeout().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
