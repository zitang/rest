/*
 * Copyright 2013-2015 the original author or authors
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


		describe('rest/interceptor/defaultRequest', function () {

			var defaultRequest, rest;

			defaultRequest = require('./defaultRequest');
			rest = require('../client/default');

			function defaultClient(request) {
				return { request: request };
			}

			it('should do nothing by default', function () {
				var client = defaultRequest(defaultClient);
				return client({}).then(function (response) {
					expect(response.request.originator).to.equal(client);
					delete response.request.originator;
					expect(response.request).to.deep.equal({});
				});
			});

			it('should default the method', function () {
				var client = defaultRequest(defaultClient, { method: 'PUT' });
				return client({}).then(function (response) {
					expect(response.request.method).to.equal('PUT');
				});
			});

			it('should not overwrite the method', function () {
				var client = defaultRequest(defaultClient, { method: 'PUT' });
				return client({ method: 'GET' }).then(function (response) {
					expect(response.request.method).to.equal('GET');
				});
			});

			it('should default the path', function () {
				var client = defaultRequest(defaultClient, { path: '/foo' });
				return client({}).then(function (response) {
					expect(response.request.path).to.equal('/foo');
				});
			});

			it('should not overwrite the path', function () {
				var client = defaultRequest(defaultClient, { path: '/foo' });
				return client({ path: '/bar' }).then(function (response) {
					expect(response.request.path).to.equal('/bar');
				});
			});

			it('should default params', function () {
				var client = defaultRequest(defaultClient, { params: { foo: 'bar', bool: 'false' } });
				return client({}).then(function (response) {
					expect(response.request.params.foo).to.equal('bar');
					expect(response.request.params.bool).to.equal('false');
				});
			});

			it('should merge params', function () {
				var client = defaultRequest(defaultClient, { params: { foo: 'bar', bool: 'false' } });
				return client({ params: { bool: 'true', bleep: 'bloop' } }).then(function (response) {
					expect(response.request.params.foo).to.equal('bar');
					expect(response.request.params.bool).to.equal('true');
					expect(response.request.params.bleep).to.equal('bloop');
				});
			});

			it('should default headers', function () {
				var client = defaultRequest(defaultClient, { headers: { foo: 'bar', bool: 'false' } });
				return client({}).then(function (response) {
					expect(response.request.headers.foo).to.equal('bar');
					expect(response.request.headers.bool).to.equal('false');
				});
			});

			it('should merge headers', function () {
				var client = defaultRequest(defaultClient, { headers: { foo: 'bar', bool: 'false' } });
				return client({ headers: { bool: 'true', bleep: 'bloop' } }).then(function (response) {
					expect(response.request.headers.foo).to.equal('bar');
					expect(response.request.headers.bool).to.equal('true');
					expect(response.request.headers.bleep).to.equal('bloop');
				});
			});

			it('should default the entity', function () {
				var client = defaultRequest(defaultClient, { entity: Math });
				return client({}).then(function (response) {
					expect(response.request.entity).to.equal(Math);
				});
			});

			it('should not overwrite the entity', function () {
				var client = defaultRequest(defaultClient, { entity: Math });
				return client({ entity: Date }).then(function (response) {
					expect(response.request.entity).to.equal(Date);
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(defaultRequest().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(defaultRequest().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
