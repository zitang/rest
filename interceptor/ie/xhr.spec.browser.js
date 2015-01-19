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


		describe('rest/interceptor/ie/xhr', function () {

			var xhr, rest;

			xhr = require('./xhr');
			rest = require('../../client/default');

			function defaultClient(request) {
				return { request: request };
			}

			if (!!XMLHttpRequest) {
				it('should provide the native XHR object as the engine', function () {
					var client = xhr(defaultClient);
					return client({}).then(function (response) {
						expect(response.request.engine).to.equal(XMLHttpRequest);
					});
				});
			}

			if (!XMLHttpRequest) {
				it('should fall back to an ActiveX XHR-like object as the engine', function () {
					var client = xhr(defaultClient);
					return client({}).then(function (response) {
						expect(response.request.engine).to.not.equal(XMLHttpRequest);
						expect(response.request.engine).to.be.a('function');
					});
				});
			}

			it('should have the default client as the parent by default', function () {
				expect(xhr().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(xhr().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
