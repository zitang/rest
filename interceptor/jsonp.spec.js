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


		describe('rest/interceptor/jsonp', function () {

			var jsonp, rest, jsonpClient, when;

			jsonp = require('./jsonp');
			jsonpClient = require('../client/jsonp');
			rest = require('../client/default');
			when = require('when');

			it('should include callback info from config in request by default', function () {
				var client = jsonp(
					function (request) { return when({ request: request }); },
					{ callback: { param: 'callback', prefix: 'jsonp', name: 'jsonp123456' } }
				);
				return client({}).then(function (response) {
					expect(response.request.callback.param).to.equal('callback');
					expect(response.request.callback.prefix).to.equal('jsonp');
					expect(response.request.callback.name).to.equal('jsonp123456');
				});
			});

			it('should include callback info from request overridding config values', function () {
				var client = jsonp(
					function (request) { return when({ request: request }); },
					{ callback: { param: 'callback', prefix: 'jsonp', name: 'jsonp123456' } }
				);
				return client({ callback: { param: 'customCallback', prefix: 'customPrefix', name: 'customName' } }).then(function (response) {
					expect(response.request.callback.param).to.equal('customCallback');
					expect(response.request.callback.prefix).to.equal('customPrefix');
					expect(response.request.callback.name).to.equal('customName');
				});
			});

			it('should have the jsonp client as the parent by default', function () {
				expect(jsonp().skip()).to.not.equal(rest);
				expect(jsonp().skip()).to.equal(jsonpClient);
			});

			it('should support interceptor wrapping', function () {
				expect(jsonp().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
