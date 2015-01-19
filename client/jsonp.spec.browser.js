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


		describe('rest/client/jsonp', function () {

			var client, jsonpInterceptor, rest;

			client = require('rest/client/jsonp');
			jsonpInterceptor = require('rest/interceptor/jsonp');
			rest = require('rest');

			it('should make a cross origin request', function () {
				var request = { path: 'http://ip.jsontest.com/' };
				return client(request).then(function (response) {
					expect(response.entity.ip).to.exist();
					expect(response.request).to.equal(request);
					expect(request.canceled).to.be.false();
					expect(response.raw.parentNode).to.not.exist();
				});
			});

			it('should use the jsonp client from the jsonp interceptor by default', function () {
				var request = { path: '/test/fixtures/data.js', callback: { name: 'callback' } };
				return jsonpInterceptor()(request).then(function (response) {
					expect(response.entity.data).to.exist();
					expect(response.request).to.equal(request);
					expect(request.canceled).to.be.false();
					expect(response.raw.parentNode).to.not.exist();
				});
			});

			it('should abort the request if canceled', function () {
				var request, response;
				request = { path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'jsonp' } };
				response = client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(request.canceled).to.be.true();
						expect(response.raw.parentNode).to.not.exist();
					}
				);
				expect(request.canceled).to.be.false();
				request.cancel();
				return response;
			});

			it.skip('should propogate request errors', function () {
				// TODO restore test
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
				var request = { canceled: true, path: 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0', params: { q: 'html5' } };
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

			it('should error if callback not invoked', function () {
				var request = { path: '/test/fixtures/noop.js' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('loaderror');
					}
				);
			});

			it.skip('should error if script throws', function () {
				// TODO restore test
				var request = { path: '/test/fixtures/throw.js' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('loaderror');
					}
				);
			});

			it('should normalize a string to a request object', function () {
				var request = 'http://ip.jsontest.com/';
				return client(request).then(function (response) {
					expect(response.request.path).to.equal(request);
				});
			});

			it('should not be the default client', function () {
				rest.resetDefaultClient();
				expect(rest.getDefaultClient()).to.not.equal(client);
			});

			it('should support interceptor wrapping', function () {
				expect(client.wrap).to.be.a('function');
			});

			it('should return a ResponsePromise', function () {
				var request = 'http://ip.jsontest.com/';
				var response = client(request);
				// wait for the request to finish, ignore errors
				return response.otherwise(function () {}).then(function () {
					expect(response.entity).to.be.a('function');
				});
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
