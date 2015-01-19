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


		describe('rest/util/normalizeHeaderName', function () {

			var normalizeHeaderName = require('./normalizeHeaderName');

			it('should normalize header names', function () {
				expect(normalizeHeaderName('accept')).to.equal('Accept');
				expect(normalizeHeaderName('ACCEPT')).to.equal('Accept');
				expect(normalizeHeaderName('content-length')).to.equal('Content-Length');
				expect(normalizeHeaderName('x-some-custom-header')).to.equal('X-Some-Custom-Header');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
