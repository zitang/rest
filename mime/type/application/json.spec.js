/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	/*globals describe, it */
	var undef;

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/mime/type/application/json', function () {

			var json = require('./json');

			it('should read json', function () {
				expect(json.read('{"foo":"bar"}')).to.deep.equal({ foo: 'bar' });
			});

			it('should stringify json', function () {
				expect(json.write({ foo: 'bar' })).to.equal('{"foo":"bar"}');
			});

			it('should use provided reviver and replacer', function () {
				var reviver, replacer, customJson;

				reviver = function reviver() {};
				replacer = [];
				customJson = json.extend(reviver, replacer);

				expect(customJson.read('{"foo":"bar"}')).to.equal(undef);
				expect(customJson.write({ foo: 'bar' })).to.equal('{}');

				// old json convert is unmodified
				expect(json.read('{"foo":"bar"}')).to.deep.equal({ foo: 'bar' });
				expect(json.write({ foo: 'bar' })).to.equal('{"foo":"bar"}');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
