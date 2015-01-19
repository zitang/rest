/*
 * Copyright 2014-2015 the original author or authors
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


		describe('rest/util/responsePromise', function () {

			var responsePromise, mime, when, client;

			responsePromise = require('./responsePromise');
			mime = require('../interceptor/mime');
			when = require('when');

			client = mime(function (request) {
				var page = request.params && request.params.page || 0;
				return {
					request: request,
					headers: {
						'Content-Type': 'application/hal+json'
					},
					entity: JSON.stringify({
						page: page,
						_links: {
							self: { href: request.path },
							next: { href: request.path + '/next' },
							search: { href: request.path + '/{?q}', templated: true }
						}
					})
				};
			});

			it('should be an instance of Promise', function () {
				expect(responsePromise()).to.be.instanceof(when.Promise);
			});

			it('should resolve the response entity', function () {
				var response = responsePromise({ entity: 43 });

				return response.entity().then(
					function (entity) {
						expect(entity).to.equal(43);
					}
				);
			});

			it('should resolve the response entity for a rejected promise', function () {
				var response = responsePromise.reject({ entity: 43 });

				return response.entity().then(
					function () {
						throw new Error('should not be called');
					},
					function (entity) {
						expect(entity).to.equal(43);
					}
				);
			});

			it('should resolve the response status code', function () {
				var response = responsePromise({ status: { code: 200 } });

				return response.status().then(
					function (status) {
						expect(status).to.equal(200);
					}
				);
			});

			it('should resolve the response status code for a rejected promise', function () {
				var response = responsePromise.reject({ status: { code: 200 } });

				return response.status().then(
					function () {
						throw new Error('should not be called');
					},
					function (status) {
						expect(status).to.equal(200);
					}
				);
			});

			it('should resolve the response headers', function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise({ headers: headers });

				return response.headers().then(
					function (_headers) {
						expect(_headers).to.equal(headers);
					}
				);
			});

			it('should resolve the response headers for a rejected promise', function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise.reject({ headers: headers });

				return response.headers().then(
					function () {
						throw new Error('should not be called');
					},
					function (_headers) {
						expect(_headers).to.equal(headers);
					}
				);
			});

			it('should resolve a response header', function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise({ headers: headers });

				return response.header('Content-Type').then(
					function (header) {
						expect(header).to.equal(headers['Content-Type']);
					}
				);
			});

			it('should resolve a response header for a rejected promise', function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise.reject({ headers: headers });

				return response.header('Content-Type').then(
					function () {
						throw new Error('should not be called');
					},
					function (header) {
						expect(header).to.equal(headers['Content-Type']);
					}
				);
			});

			it('should resolve a response header, by the normalized name', function () {
				var headers = { 'Content-Type': 'text/plain' };
				var response = responsePromise({ headers: headers });

				return response.header('content-type').then(
					function (header) {
						expect(header).to.equal(headers['Content-Type']);
					}
				);
			});

			describe('should follow hypermedia reltionships', function () {

				it('', function () {
					return client('http://example.com').follow('next').entity().then(
						function (response) {
							expect(response._links.self.href).to.equal('http://example.com/next');
						}
					);
				});

				it('passing params', function () {
					return client('http://example.com').follow({ rel: 'next', params: { projection: 'limited' } }).then(
						function (response) {
							expect(response.request.params.projection).to.equal('limited');
							expect(response.entity._links.self.href).to.equal('http://example.com/next');
						}
					);
				});

				it('applying params to templates', function () {
					return client('http://example.com').follow({ rel: 'search', params: { q: 'hypermedia client' } }).then(
						function (response) {
							expect(response.request.path).to.equal('http://example.com/?q=hypermedia%20client');
							expect(response.request).to.not.have.property('params');
						}
					);
				});

				it('by chaining', function () {
					return client('http://example.com').follow('next').follow('next').entity().then(
						function (response) {
							expect(response._links.self.href).to.equal('http://example.com/next/next');
						}
					);
				});

				it('by inline chaining', function () {
					return client('http://example.com').follow(['next', 'next']).entity().then(
						function (response) {
							expect(response._links.self.href).to.equal('http://example.com/next/next');
						}
					);
				});

				it('with errors for non hypermedia responses', function () {
					return responsePromise({ entity: {} }).follow('next').then(
						function () {
							throw new Error('should not be called');
						},
						function (err) {
							expect(err.message).to.equal('Hypermedia response expected');
						}
					);
				});

				it('with errors for unknown relationships', function () {
					return client('http://example.com').follow('prev').then(
						function () {
							throw new Error('should not be called');
						},
						function (err) {
							expect(err.message).to.equal('Unknown relationship: prev');
						}
					);
				});

			});

		});
	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
