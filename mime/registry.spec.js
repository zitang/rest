/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	/*globals describe, it, beforeEach */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/mime/registry', function () {

			var mimeRegistry, when, registry;

			mimeRegistry = require('./registry');
			when = require('when');

			beforeEach(function () {
				registry = mimeRegistry.child();
			});

			it('should discover unregisted converter', function () {
				return registry.lookup('text/plain').then(function (converter) {
					expect(converter.read).to.be.a('function');
					expect(converter.write).to.be.a('function');
				});
			});

			it('should return registed converter', function () {
				var converter = {};
				registry.register('application/vnd.com.example', converter);
				return registry.lookup('application/vnd.com.example').then(function (c) {
					expect(c).to.equal(converter);
				});
			});

			it('should reject for non-existant converter', function () {
				return registry.lookup('application/bogus').then(
					function() {
						throw new Error('should not be called');
					},
					function () {
						// handle rejection
					}
				);
			});

			it('should resolve converters from parent registries', function () {
				var child, converter;
				child = registry.child();
				converter = {};
				registry.register('application/vnd.com.example', converter);
				return child.lookup('application/vnd.com.example').then(function (c) {
					expect(c).to.equal(converter);
				});
			});

			it('should override parent registries when registering in a child', function () {
				var child, converterParent, converterChild;
				child = registry.child();
				converterParent = {};
				converterChild = {};
				registry.register('application/vnd.com.example', converterParent);
				child.register('application/vnd.com.example', converterChild);
				return child.lookup('application/vnd.com.example').then(function (c) {
					expect(c).to.equal(converterChild);
				});
			});

			it('should not have any side effects in a parent registry from a child', function () {
				var child, converterParent, converterChild;
				child = registry.child();
				converterParent = {};
				converterChild = {};
				registry.register('application/vnd.com.example', converterParent);
				child.register('application/vnd.com.example', converterChild);
				return registry.lookup('application/vnd.com.example').then(function (c) {
					expect(c).to.equal(converterParent);
				});
			});

			it('should ignore charset in mime resolution', function () {
				var converter = {};
				registry.register('application/vnd.com.example', converter);
				return registry.lookup('application/vnd.com.example;charset=utf-8').then(function (c) {
					expect(c).to.equal(converter);
				});
			});

			it('should ignore suffix in mime resolution', function () {
				var converter = {};
				registry.register('application/vnd.com.example', converter);
				return registry.lookup('application/vnd.com.example+foo').then(function (c) {
					expect(c).to.equal(converter);
				});
			});

			it('should fallback to suffix if mime type is not resolved', function () {
				var converter = {};
				registry.register('+foo', converter);
				return registry.lookup('application/vnd.com.example+foo').then(function (c) {
					expect(c).to.equal(converter);
				});
			});

			it('should invoke the delegate mime converter', function () {
				var converter = {
					read: function (obj) {
						return 'read ' + obj;
					},
					write: function (obj) {
						return 'write ' + obj;
					}
				};
				registry.register('+bar', registry.delegate('+foo'));
				registry.register('+foo', converter);
				return registry.lookup('application/vnd.com.example+foo').then(function (converter) {
					expect(converter.read('hello')).to.equal('read hello');
					expect(converter.write('world')).to.equal('write world');
				});
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
