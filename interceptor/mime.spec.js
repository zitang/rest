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


		describe('rest/interceptor/mime', function () {

			var mime, registry, rest, when;

			mime = require('./mime');
			registry = require('../mime/registry');
			rest = require('../client/default');
			when = require('when');

			it('should return the response entity decoded', function () {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/json' } };
				});

				return client({}).then(function (response) {
					expect(response.entity).to.deep.equal({});
				});
			});

			it('should encode the request entity', function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				return client({ entity: {} }).then(function (response) {
					expect(response.request.entity).to.equal('{}');
				});
			});

			it('should encode the request entity from the Content-Type of the request, ignoring the filter config', function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'text/plain' }
				);

				return client({ entity: {}, headers: { 'Content-Type': 'application/json' } }).then(function (response) {
					expect(response.request.entity).to.equal('{}');
					expect(response.request.headers['Content-Type']).to.equal('application/json');
					expect(response.request.headers.Accept).to.match(/^application\/json/);
				});
			});

			it('should not overwrite the requests Accept header', function () {
				var client;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ mime: 'application/json' }
				);

				return client({ entity: {}, headers: { Accept: 'foo' } }).then(function (response) {
					expect(response.request.entity).to.equal('{}');
					expect(response.request.headers['Content-Type']).to.equal('application/json');
					expect(response.request.headers.Accept).to.equal('foo');
				});
			});

			it('should error the request if unable to find a converter for the desired mime', function () {
				var client, request;

				client = mime();

				request = { headers: { 'Content-Type': 'application/vnd.com.example' }, entity: {} };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('mime-unknown');
						expect(response.request).to.equal(request);
					}
				);
			});

			it('should error the request if unable to find a converter for the desired mime, unless in permissive mode', function () {
				var client, entity, request;

				client = mime(
					function (request) {
						return { request: request, headers: {} };
					},
					{ permissive: true }
				);

				entity = {};
				request = { headers: { 'Content-Type': 'application/vnd.com.example' }, entity: entity };
				return client(request).then(function (response) {
					expect(response.request.entity).to.equal(entity);
					expect(response.request.headers['Content-Type']).to.equal('application/vnd.com.example');
				});
			});

			it('should use text/plain converter for a response if unable to find a converter for the desired mime', function () {
				var client;

				client = mime(function () {
					return { entity: '{}', headers: { 'Content-Type': 'application/vnd.com.example' } };
				});

				return client({}).then(function (response) {
					expect(response.entity).to.equal('{}');
				});
			});

			it('should use the configured mime registry', function () {
				var client, converter, customRegistry;

				converter = {
					read: sinon.spy(function (str) {
						return 'read: ' + str;
					}),
					write: sinon.spy(function (obj) {
						return 'write: ' + obj.toString();
					})
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{ mime: 'application/vnd.com.example', registry: customRegistry }
				);

				return client({ entity: 'request entity' }).then(function (response) {
					expect(response.request.headers['Content-Type']).to.equal('application/vnd.com.example');
					expect(response.request.entity).to.equal('write: request entity');
					expect(response.headers['Content-Type']).to.equal('application/vnd.com.example');
					expect(response.entity).to.equal('read: response entity');

					expect(converter.read).to.be.calledWith('response entity', {
						client: client,
						response: response,
						mime: { raw: 'application/vnd.com.example', type: 'application/vnd.com.example', suffix: '', params: {} },
						registry: customRegistry
					});
					expect(converter.write).to.be.calledWith('request entity', {
						client: client,
						request: response.request,
						mime: { raw: 'application/vnd.com.example', type: 'application/vnd.com.example', suffix: '', params: {} },
						registry: customRegistry
					});
				});
			});

			it('should reject the response if the serializer fails to write the request', function () {
				var client, converter, customRegistry;

				converter = {
					read: function (str) {
						throw str;
					}
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request };
					},
					{ mime: 'application/vnd.com.example', registry: customRegistry }
				);

				return client({ entity: 'request entity' }).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('mime-serialization');
					}
				);
			});

			it('should reject the response if the serializer fails to read the response', function () {
				var client, converter, customRegistry;

				converter = {
					write: function (obj) {
						throw obj;
					}
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{  registry: customRegistry }
				);

				return client({}).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('mime-deserialization');
					}
				);
			});

			it('should reject the response if serializer rejects promise while reading response entity', function () {
				var client, converter, customRegistry;

				converter = {
					read: function (obj) {
						return when.reject(obj);
					}
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{  registry: customRegistry }
				);

				return client({}).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('mime-deserialization');
					}
				);
			});

			it('should wait for entity to resolve before returning when serializer returns a promise while reading response entity', function () {
				var client, converter, customRegistry;

				converter = {
					read: function (obj) {
						return when(obj);
					}
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{  registry: customRegistry }
				);

				return client({}).then(function (response) {
					expect(response.entity).to.equal('response entity');
				});
			});

			it('should wait for entity to resolve before returning when serializer returns a promise while writing request entity', function () {
				var client, converter, customRegistry, entityToPromise;

				entityToPromise = function(obj) { return when(obj); };

				converter = {
					write: entityToPromise,
					read: entityToPromise
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{ registry: customRegistry }
				);

				return client({ entity: 'request entity' }).then(function (response) {
					expect(response.request.entity).to.equal('request entity');
				});
			});

			it('should reject the response if serializer rejects promise while writing request entity', function () {
				var client, converter, customRegistry;

				converter = {
					write: function (obj) {
						return when.reject(obj);
					}
				};

				customRegistry = registry.child();
				customRegistry.register('application/vnd.com.example', converter);

				client = mime(
					function (request) {
						return { request: request, headers: { 'Content-Type': 'application/vnd.com.example' }, entity: 'response entity' };
					},
					{  registry: customRegistry }
				);

				return client({ entity: 'request entity' }).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.equal('mime-deserialization');
					}
				);
			});

			it('should have the default client as the parent by default', function () {
				expect(mime().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(mime().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
