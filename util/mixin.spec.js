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


		describe('rest/util/mixin', function () {

			var mixin = require('./mixin');

			it('should return an emtpy object for no args', function () {
				var mixed, prop;
				mixed = mixin();
				expect(mixed).to.exist();
				for (prop in mixed) {
					/*jshint forin:false */
					expect(mixed).to.not.have.ownProperty(prop);
				}
			});

			it('should return original object', function () {
				var orig, mixed;
				orig = { foo: 'bar' };
				mixed = mixin(orig);
				expect(mixed).to.equal(orig);
			});

			it('should return original object, supplemented', function () {
				var orig, supplemented, mixed;
				orig = { foo: 'bar' };
				supplemented = { foo: 'foo' };
				mixed = mixin(orig, supplemented);
				expect(mixed).to.equal(orig);
				expect(mixed.foo).to.equal('foo');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
