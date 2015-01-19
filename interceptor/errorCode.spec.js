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


		describe('rest/interceptor/errorCode', function () {

			var errorCode, rest;

			errorCode = require('./errorCode');
			rest = require('../client/default');

			it('should resolve for less than 400 by default', function () {
				var client = errorCode(
					function () { return { status: { code: 399 } }; }
				);
				return client({}).then(function (response) {
					expect(response.status.code).to.equal(399);
				});
			});

			it('should reject for 400 or greater by default', function () {
				var client = errorCode(
					function () { return { status: { code: 400 } }; }
				);
				return client({}).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.status.code).to.equal(400);
					}
				);
			});

			it('should reject lower then 400 with a custom code', function () {
				var client = errorCode(
					function () { return { status: { code: 300 } }; },
					{ code: 300 }
				);
				return client({}).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.status.code).to.equal(300);
					}
				);
			});

			it('should have the default client as the parent by default', function () {
				expect(errorCode().skip()).to.equal(rest);
			});

			it('should support interceptor warpping', function () {
				expect(errorCode().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
