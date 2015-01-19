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


		describe('rest/mime/type/text/plain', function () {

			var plain = require('./plain');

			it('should not change when writing string values', function () {
				expect(plain.write('7')).to.equal('7');
			});

			it('should use the string representation for reading non-string values', function () {
				expect(plain.write(7)).to.equal('7');
			});

			it('should not change when reading string values', function () {
				expect(plain.read('7')).to.equal('7');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
