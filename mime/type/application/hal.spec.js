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


		describe('rest/mime/type/application/hal', function () {

			var hal, mime, registry, halMime;

			hal = require('./hal');
			mime = require('../../../interceptor/mime');
			registry = require('../../registry');

			halMime = require('../../../mime').parse('application/hal+json');

			function client(request) {
				return { request: request };
			}

			it('should stringify json', function () {
				return hal.write({ foo: 'bar' }, { mime: halMime, registry: registry }).then(function (resource) {
					expect(resource).to.equal('{"foo":"bar"}');
				});
			});

			it('should read json', function () {
				return hal.read('{"foo":"bar"}', { mime: halMime, registry: registry }).then(function (resource) {
					expect(resource).to.deep.equal({ foo: 'bar' });
				});
			});

			it('should place embedded relationships on the host object', function () {
				return hal.read(JSON.stringify({ _embedded: { prop: 'embed' } }), { mime: halMime, registry: registry }).then(function (resource) {
					return resource.prop.entity().then(function (prop) {
						expect(prop).to.equal('embed');
					});
				});
			});

			it('should not overwrite a property on the host oject with an embedded relationship', function () {
				return hal.read(JSON.stringify({ prop: 'host', _embedded: { prop: 'embed' } }), { mime: halMime, registry: registry }).then(function (resource) {
					expect(resource.prop).to.equal('host');
				});
			});

			it('should place linked relationships on the host object', function () {
				return hal.read(JSON.stringify({ _links: { prop: { href: '/' } } }), { mime: halMime, registry: registry }).then(function (resource) {
					expect(resource.prop.entity).to.be.a('function');
				});
			});

			it('should not overwrite a property on the host oject with a linked relationship', function () {
				return hal.read(JSON.stringify({ prop: 'host', _links: { prop: { href: '/' } } }), { mime: halMime, registry: registry }).then(function (resource) {
					expect(resource.prop).to.equal('host');
				});
			});

			it('should fetch a linked resource', function () {
				var client = mime(function client(request) {
					return request.path === '/' ?
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/' }, child: { href: '/resource' } } }), headers: { 'Content-Type': 'application/hal+json' } } :
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/resource' }, parent: { href: '/' } } }), headers: { 'Content-Type': 'application/hal+json' } };
				});

				return client({ path: '/' }).then(function (response) {
					expect(response.request.path).to.equal('/');
					return response.entity.child.then(function (response) {
						expect(response.request.path).to.equal('/resource');
					});
				});
			});

			it('should fetch a templated linked resource', function () {
				var client = mime(function client(request) {
					return request.path === '/' ?
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/' }, child: { templated: true, href: '/resource{?lang}' } } }), headers: { 'Content-Type': 'application/hal+json' } } :
						{ request: request, entity: JSON.stringify({ _links: { self: { href: '/resource' }, parent: { href: '/' } } }), headers: { 'Content-Type': 'application/hal+json' } };
				});

				return client({ path: '/' }).then(function (response) {
					expect(response.request.path).to.equal('/');
					return response.entity.child.then(function (response) {
						expect(response.request.path).to.equal('/resource');
					});
				});
			});

			it('should make a request for a relationship', function () {
				return hal.read(JSON.stringify({ _links: { prop: { href: '/' } } }), { mime: halMime, registry: registry, client: client }).then(function (resource) {
					return resource.requestFor('prop', { method: 'delete' }).then(function (response) {
						expect(response.request.path).to.equal('/');
						expect(response.request.method).to.equal('delete');
					});
				});
			});

			it('should get a client for a relationship', function () {
				return hal.read(JSON.stringify({ _links: { prop: { href: '/' } } }), { mime: halMime, registry: registry, client: client }).then(function (resource) {
					return resource.clientFor('prop')().then(function (response) {
						expect(response.request.path).to.equal('/');
					});
				});
			});

			it('should get a client for a templated relationship', function () {
				return hal.read(JSON.stringify({ _links: { prop: { templated: true, href: '/{?lang}' } } }), { mime: halMime, registry: registry, client: client }).then(function (resource) {
					return resource.clientFor('prop')({ params: { lang: 'en-us' } }).then(function (response) {
						expect(response.request.path).to.equal('/?lang=en-us');
						expect(response.request).to.not.have.property('params');
					});
				});
			});

			describe('should safely warn when accessing a deprecated relationship', function () {

				it('', function () {
					var console;

					console = {
						warn: sinon.spy(),
						log: sinon.spy()
					};

					return hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { mime: halMime, registry: registry, client: client, console: console }).then(function (resource) {
						return resource.clientFor('prop')().then(function (response) {
							expect(response.request.path).to.equal('/');
							expect(console.warn).to.be.calledWith('Relationship \'prop\' is deprecated, see http://example.com/deprecation');
							expect(console.log).to.have.callCount(0);
						});
					});

				});

				it('falling back to log if warn is not availble', function () {
					var console;

					console = {
						log: sinon.spy()
					};

					return hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { mime: halMime, registry: registry, client: client, console: console }).then(function (resource) {
						return resource.clientFor('prop')().then(function (response) {
							expect(response.request.path).to.equal('/');
							expect(console.log).to.be.calledWith('Relationship \'prop\' is deprecated, see http://example.com/deprecation');
						});
					});
				});

				it('doing nothing if the console is unavailable', function () {
					var console;

					console = {};

					return hal.read(JSON.stringify({ _links: { prop: { href: '/', deprecation: 'http://example.com/deprecation' } } }), { mime: halMime, registry: registry, client: client, console: console }).then(function (resource) {
						return resource.clientFor('prop')().then(function (response) {
							expect(response.request.path).to.equal('/');
						});
					});
				});

			});

			it('should be able to write read entities', function () {
				var raw;

				raw = { _embedded: { prop: 'embed' }, _links: { prop: { href: '/' } }, foo: 'bar' };

				return hal.read(JSON.stringify(raw), { mime: halMime, registry: registry }).then(function (read) {
					return hal.write(read, { mime: halMime, registry: registry });
				}).then(function (written) {
					expect(written).to.include('"foo":"bar"');
					expect(written).to.not.include('_embedded');
					expect(written).to.not.include('_links');
					expect(written).to.not.include('clientFor');
					expect(written).to.not.include('prop');
				});
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
