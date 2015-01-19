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


		describe('rest/wire', function () {

			var rest, pathPrefixInterceptor, wire;

			rest = require('./client/default');
			pathPrefixInterceptor = require('./interceptor/pathPrefix');
			wire = require('wire');

			describe('should use the rest factory', function () {

				function _require(moduleName, resolve, reject) {
					if (Array.isArray(moduleName)) {
						// AMD
						require(moduleName, resolve, reject);
					}
					else {
						// Node
						if (moduleName.indexOf('rest') === 0) {
							moduleName = '.' + moduleName.slice(4);
						}
						return require(moduleName);
					}
				}

				it('', function () {
					var spec, client;
					client = function (request) {
						return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: 'rest/interceptor/mime', config: { mime: 'application/json' } },
									{ module: 'rest/interceptor/pathPrefix', config: { prefix: 'http://example.com' } },
									{ module: 'rest/interceptor/errorCode' }
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip().skip().skip()).to.equal(client);
						return spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							expect(response.request.path).to.equal('http://example.com/');
							expect(response.entity).to.deep.equal({ foo: 'bar' });
							expect(response.request.entity).to.equal('{"bleep":"bloop"}');
							expect(response.request.headers.Accept.indexOf('application/json')).to.equal(0);
							expect(response.request.headers['Content-Type']).to.equal('application/json');
						});
					});
				});

				it('with interceptor references', function () {
					var spec, client;
					client = function (request) {
						return { request: request, status: { code: 200 }, headers: { 'Content-Type': 'application/json' }, entity: '{"foo":"bar"}' };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ $ref: 'mime', config: { mime: 'application/json' } },
									{ $ref: 'pathPrefix', config: { prefix: 'http://example.com' } },
									{ $ref: 'errorCode' }
								]
							}
						},
						mime: { module: 'rest/interceptor/mime' },
						pathPrefix: { module: 'rest/interceptor/pathPrefix' },
						errorCode: { module: 'rest/interceptor/errorCode' },
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip().skip().skip()).to.equal(client);
						return spec.client({ method: 'post', path: '/', entity: { bleep: 'bloop' } }).then(function (response) {
							expect(response.request.path).to.equal('http://example.com/');
							expect(response.entity).to.deep.equal({ foo: 'bar' });
							expect(response.request.entity).to.equal('{"bleep":"bloop"}');
							expect(response.request.headers.Accept.indexOf('application/json')).to.equal(0);
							expect(response.request.headers['Content-Type']).to.equal('application/json');
						});
					});
				});

				it('with interceptor string shortcuts', function () {
					var spec, client;
					client = function () {};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									'rest/interceptor/mime',
									'rest/interceptor/pathPrefix',
									'rest/interceptor/errorCode'
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip().skip().skip()).to.equal(client);
					});
				});

				it('with concrete interceptors', function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: pathPrefixInterceptor, config: { prefix: 'thePrefix' } }
								]
							}
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip()).to.equal(client);
						spec.client().then(function (response) {
							expect(response.request.path).to.equal('thePrefix');
						});
					});
				});

				it('using the default client', function () {
					var spec;
					spec = {
						client: {
							rest: [
								'rest/interceptor/pathPrefix'
							]
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip()).to.equal(rest);
					});
				});

				it('using a referenced parent client', function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: { $ref: 'parentClient' },
								interceptors: [
									{ module: 'rest/interceptor/pathPrefix' }
								]
							}
						},
						parentClient: client,
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip()).to.equal(client);
					});
				});

				it('wiring interceptor configurations', function () {
					var spec, client;
					client = function (request) {
						return { request: request };
					};
					spec = {
						client: {
							rest: {
								parent: client,
								interceptors: [
									{ module: 'rest/interceptor/pathPrefix', config: { $ref: 'basePath', prefix: 'dontUseThisOne' } }
								]
							}
						},
						basePath: {
							literal: { prefix: 'useThisOne' }
						},
						$plugins: [{ module: 'rest/wire' }]
					};
					return wire(spec, { require: _require }).then(function (spec) {
						expect(spec.client.skip()).to.equal(client);
						return spec.client().then(function (response) {
							expect(response.request.path).to.equal('useThisOne');
						});
					});
				});

			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
