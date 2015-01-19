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


		describe('rest/client/xhr', function () {

			var xhr, rest, xhrFallback, when, client;

			xhr = require('rest/client/xhr');
			rest = require('rest');
			xhrFallback = require('rest/interceptor/ie/xhr');
			when = require('when');

			// use xhrFallback when XHR is not native
			client = !XMLHttpRequest ? xhr.wrap(xhrFallback) : xhr;

			it('should make a GET by default', function () {
				var request = { path: '/' };
				return client(request).then(function (response) {
					var xhr, name;
					xhr = response.raw;
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('GET');
					expect(response.entity).to.equal(xhr.responseText);
					expect(response.status.code).to.equal(xhr.status);
					expect(response.status.text).to.equal(xhr.statusText);
					for (name in response.headers) {
						/*jshint forin:false */
						expect(response.headers[name]).to.equal(xhr.getResponseHeader(name));
					}
					expect(request.canceled).to.be.false();
				});
			});

			it('should make an explicit GET', function () {
				var request = { path: '/', method: 'GET' };
				return client(request).then(function (response) {
					var xhr, name;
					xhr = response.raw;
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('GET');
					expect(response.entity).to.equal(xhr.responseText);
					expect(response.status.code).to.equal(xhr.status);
					expect(response.status.text).to.equal(xhr.statusText);
					for (name in response.headers) {
						/*jshint forin:false */
						expect(response.headers[name]).to.equal(xhr.getResponseHeader(name));
					}
					expect(request.canceled).to.be.false();
				});
			});

			it('should make a POST with an entity', function () {
				var request = { path: '/', entity: 'hello world' };
				return client(request).then(function (response) {
					var xhr, name;
					xhr = response.raw;
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('POST');
					expect(response.entity).to.equal(xhr.responseText);
					expect(response.status.code).to.equal(xhr.status);
					expect(response.status.text).to.equal(xhr.statusText);
					for (name in response.headers) {
						/*jshint forin:false */
						expect(response.headers[name]).to.equal(xhr.getResponseHeader(name));
					}
					expect(request.canceled).to.be.false();
				});
			});

			it('should make an explicit POST with an entity', function () {
				var request = { path: '/', entity: 'hello world', method: 'POST' };
				return client(request).then(function (response) {
					var xhr, name;
					xhr = response.raw;
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('POST');
					expect(response.entity).to.equal(xhr.responseText);
					expect(response.status.code).to.equal(xhr.status);
					expect(response.status.text).to.equal(xhr.statusText);
					for (name in response.headers) {
						/*jshint forin:false */
						expect(response.headers[name]).to.equal(xhr.getResponseHeader(name));
					}
					expect(request.canceled).to.be.false();
				});
			});

			if (XMLHttpRequest && 'timeout' in new XMLHttpRequest()) {
				it('should mixin additional properties', function () {
					var request = { path: '/', mixin: { timeout: 1000, foo: 'bar' } };
					return client(request).then(function (response) {
						var xhr = response.raw;
						expect(xhr.timeout).to.equal(1000);
						expect(xhr.foo).to.not.equal('bar');
					});
				});
			}

			it.skip('should abort the request if canceled', function () {
				// TODO find an endpoint that takes a bit to respond, cached files may return synchronously
				// this test misbehavies in IE6, the response is recieved before the request can cancel
				var request = { path: '/wait/' + new Date().getTime() };
				return when.all([
					client(request).then(
						function () {
							throw new Error('should not be called');
						},
						function (response) {
							expect(request.canceled).to.be.false();
							try {
								// accessing 'status' will throw in older Firefox
								expect(response.raw.status).to.equal(0);
							}
							catch (e) {
								// ignore
							}

							// this assertion is true in every browser except for IE 6
							// assert.same(XMLHttpRequest.UNSENT || 0, response.raw.readyState);
							expect(response.raw.readyState).to.be.at.most(3);
						}
					),
					when({}, function () {
						// push into when's nextTick resolution
						expect(request.canceled).to.be.false();
						request.cancel();
					})
				]);
			});

			it.skip('should propogate request errors', function () {
				// TODO follow up with Sauce Labs
				// this test is valid, but fails with sauce as their proxy returns a 400
				var request = { path: 'http://localhost:1234' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('loaderror');
					}
				);
			});

			it('should not make a request that has already been canceled', function () {
				var request = { canceled: true, path: '/' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(request.canceled).to.be.true();
						expect(response.error).to.equal('precanceled');
					}
				);
			});

			if (!XMLHttpRequest) {
				it('should reject if an XHR impl is not available', function () {
					var request = { path: '/' };
					return xhr(request).then(
						function () {
							throw new Error('should not be called');
						},
						function (response) {
							expect(response.request).to.equal(request);
							expect(response.error).to.equal('xhr-not-available');
						}
					);
				});
			}

			it('should normalize a string to a request object', function () {
				return client('/').then(function (response) {
					expect(response.request.path).to.equal('/');
				});
			});

			it('should be the default client', function () {
				rest.resetDefaultClient();
				expect(rest.getDefaultClient()).to.equal(xhr);
			});

			it('should support interceptor wrapping', function () {
				expect(xhr.wrap).to.be.a('function');
			});

			it('should return a ResponsePromise', function () {
				expect(client().entity).to.be.a('function');
			});

			it('should ignore a "Content-Type: multipart/form-data" header', function () {
				function XMLHttpRequestSpy() {
					var xhr = new XMLHttpRequest();
					xhr.requestHeaders = {};

					var setRequestHeader = xhr.setRequestHeader;
					xhr.setRequestHeader = function (header, value) {
						xhr.requestHeaders[header] = value;
						return setRequestHeader.apply(xhr, arguments);
					};

					return xhr;
				}

				return client({
					engine: XMLHttpRequestSpy,
					path: '/',
					headers: { 'Content-Type': 'multipart/form-data' }
				}).then(function (response) {
					expect(response.raw.requestHeaders).to.not.have.property('Content-Type');
				});
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
