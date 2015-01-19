/*
 * Copyright 2014-2015 the original author or authors
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


		describe('rest/browser', function () {

			var rest, defaultClient, xhr;

			rest = require('./browser');
			defaultClient = require('./client/default');
			xhr = require('./client/xhr');

			it('should be the default client', function () {
				expect(defaultClient).to.equal(rest);
			});

			it('should wrap the xhr client', function () {
				expect(rest.getDefaultClient()).to.equal(xhr);
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
