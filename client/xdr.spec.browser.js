/*
 * Copyright 2013-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, global) {
	'use strict';

	/*globals describe, it */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/client/xdr', function () {

			var client, rest, flickrUrl;

			client = require('rest/client/xdr');
			rest = require('rest');

			flickrUrl = 'http://api.flickr.com/services/rest/?method=flickr.test.echo&api_key=95f41bfa4faa0f43bf7c24795eabbed4&format=rest';

			if ('XDomainRequest' in global) {

				it('should make a GET by default', function () {
					var request = { path: flickrUrl };
					return client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						expect(response.request).to.equal(request);
						expect(response.request.method).to.equal('GET');
						expect(response.entity).to.equal(xdr.responseText);
						expect(request.canceled).to.be.false();
					});
				});

				it('should make an explicit GET', function () {
					var request = { path: flickrUrl, method: 'GET' };
					return client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						expect(response.request).to.equal(request);
						expect(response.request.method).to.equal('GET');
						expect(response.entity).to.equal(xdr.responseText);
						expect(request.canceled).to.be.false();
					});
				});

				it('should make a POST with an entity', function () {
					var request = { path: flickrUrl, entity: 'hello world' };
					return client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						expect(response.request).to.equal(request);
						expect(response.request.method).to.equal('POST');
						expect(response.entity).to.equal(xdr.responseText);
						expect(request.canceled).to.be.false();
					});
				});

				it('should make an explicit POST with an entity', function () {
					var request = { path: flickrUrl, entity: 'hello world', method: 'POST' };
					return client(request).then(function (response) {
						var xdr;
						xdr = response.raw;
						expect(response.request).to.equal(request);
						expect(response.request.method).to.equal('POST');
						expect(response.entity).to.equal(xdr.responseText);
						expect(request.canceled).to.be.false();
					});
				});

				it('should abort the request if canceled', function () {
					// TDOO find an endpoint that takes a bit to respond, cached files may return synchronously
					var request, response;
					request = { path: flickrUrl, params: { q: Date.now() } };
					response = client(request).then(
						function () {
							throw new Error('should not be called');
						},
						function (response) {
							expect(response.request.canceled).to.be.true();
						}
					);
					expect(request.canceled).to.be.false();
					request.cancel();
					return response;
				});

				it('should propogate request errors', function () {
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

				it('should normalize a string to a request object', function () {
					return client(flickrUrl).then(function (response) {
						expect(response.request.path).to.equal(flickrUrl);
					});
				});

				it('should return a ResponsePromise', function () {
					expect(client().entity).to.be.a('function');
				});

			}

			it('should not be the default client', function () {
				rest.resetDefaultClient();
				expect(rest.getDefaultClient()).to.not.equal(client);
			});

			it('should support interceptor wrapping', function () {
				expect(client.wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window === 'object' ? window : global
	// Boilerplate for AMD and Node
));
