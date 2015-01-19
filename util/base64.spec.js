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


		describe('rest/util/base64', function () {

			var base64 = require('./base64');

			it('should base64 encode strings', function () {
				expect(base64.encode('foo')).to.equal('Zm9v');
			});

			it('should base64 decode strings', function () {
				expect(base64.decode('Zm9v')).to.equal('foo');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
