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


		describe('rest/interceptor/hateoas', function () {

			var hateoas, rest, when, supports;

			hateoas = require('./hateoas');
			rest = require('../client/default');
			when = require('when');

			supports = {
				'Object.defineProperty': (function () {
					try {
						var obj = {};
						Object.defineProperty(obj, 'test', { enumerable: false, configurable: true, value: true });
						return obj.test;
					}
					catch (e) {
						return false;
					}
				}()),
				'ES5 getters': (function () {
					try {
						var obj = {};
						Object.defineProperty(obj, 'test', { get: function () { return true; } });
						return obj.test;
					}
					catch (e) {
						return false;
					}
				}())
			};

			it('should parse header links', function () {
				var client, entity, headers;

				headers = {
					Link: [
						'<http://example.com/TheBook/chapter2>; rel="previous"; title="previous chapter"',
						'<http://example.com/TheBook/chapter4>; rel="next"; title="next chapter"'
					]
				};
				entity = {};
				client = hateoas(function () { return { entity: entity, headers: headers }; });

				return client().then(function (response) {
					expect(response.links).to.have.property('previous');
					expect(response.links.previousLink.href).to.equal('http://example.com/TheBook/chapter2');
					expect(response.links.previousLink.title).to.equal('previous chapter');
					expect(response.links).to.have.property('next');
					expect(response.links.nextLink.href).to.equal('http://example.com/TheBook/chapter4');
					expect(response.links.nextLink.title).to.equal('next chapter');
				});
			});

			it('should parse compound header links', function () {
				var client, entity, headers;

				headers = {	Link: '<http://example.com/TheBook/chapter2>; rel="previous"; title="previous chapter", <http://example.com/TheBook/chapter4>; rel="next"; title="next chapter"' };
				entity = {};
				client = hateoas(function () { return { entity: entity, headers: headers }; });

				return client().then(function (response) {
					expect(response.links).to.have.property('previous');
					expect(response.links.previousLink.href).to.equal('http://example.com/TheBook/chapter2');
					expect(response.links.previousLink.title).to.equal('previous chapter');
					expect(response.links).to.have.property('next');
					expect(response.links.nextLink.href).to.equal('http://example.com/TheBook/chapter4');
					expect(response.links.nextLink.title).to.equal('next chapter');
				});
			});

			it('should gracefully recover from maleformed header links', function () {
				var client, entity, headers;

				headers = {	Link: 'foo bar' };
				entity = {};
				client = hateoas(function () { return { entity: entity, headers: headers }; });

				return client().then(function (response) {
					expect(response.entity).to.equal(entity);
				});
			});

			if (supports['Object.defineProperty']) {

				it('should parse links in the entity', function () {
					var client, body, parent, self;

					parent = { rel: 'parent', href: '/' };
					self = { rel: 'self', href: '/resource' };

					body = { links: [ parent, self ]};
					client = hateoas(function () { return { entity: body }; }, { target: '_links' });

					return client().then(function (response) {
						expect(response.entity._links.parentLink).to.equal(parent);
						expect(response.entity._links.selfLink).to.equal(self);
					});
				});

				it('should parse links in the entity into the entity', function () {
					var client, body, parent, self;

					parent = { rel: 'parent', href: '/' };
					self = { rel: 'self', href: '/resource' };

					body = { links: [ parent, self ]};
					client = hateoas(function () { return { entity: body }; });

					return client().then(function (response) {
						expect(response.entity.parentLink).to.equal(parent);
						expect(response.entity.selfLink).to.equal(self);
					});
				});

				it('should create a client for the related resource', function () {
					var client, body, parent, self;

					parent = { rel: 'parent', href: '/' };
					self = { rel: 'self', href: '/resource' };

					body = { links: [ parent, self ]};
					client = hateoas(function () { return { entity: body }; });

					return client().then(function (response) {
						var parentClient = response.entity.clientFor('parent', function (request) { return { request: request }; });
						return parentClient().then(function (response) {
							expect(response.request.path).to.equal(parent.href);
						});
					});
				});

				it('should return the same value for multiple property accesses', function () {
					var client, body;

					body = { links: [ { rel: 'self', href: '/resource' } ]};
					client = hateoas(function (request) {
						return request.path ? { entity: body } : { entity: {} };
					});

					return client().then(function (response) {
						expect(response.entity.self).to.equal(response.entity.self);
					});
				});

			}

			if (supports['ES5 getters']) {
				it('should fetch a related resource', function () {
					var client, parentClient;

					parentClient = function (request) {
						return request.path === '/' ?
							{ request: request, entity: { links: [ { rel: 'self', href: '/' }, { rel: 'child', href: '/resource' } ] } } :
							{ request: request, entity: { links: [ { rel: 'self', href: '/resource' }, { rel: 'parent', href: '/' } ] } };
					};
					client = hateoas(parentClient);

					return client({ path: '/' }).then(function (response) {
						expect(response.request.path).to.equal('/');
						expect(response.entity.selfLink.href).to.equal('/');
						return response.entity.child.then(function (response) {
							expect(response.request.path).to.equal('/resource');
							expect(response.entity.selfLink.href).to.equal('/resource');
						});
					});
				});
			}

			it('should have the default client as the parent by default', function () {
				expect(hateoas().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(hateoas().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
