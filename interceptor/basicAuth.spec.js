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


		describe('rest/interceptor/basicAuth', function () {

			var basicAuth, rest;

			basicAuth = require('./basicAuth');
			rest = require('../client/default');

			it('should authenticate the requst from the config', function () {
				var client = basicAuth(
					function (request) { return { request: request }; },
					{ username: 'user', password: 'pass'}
				);
				return client({}).then(function (response) {
					expect(response.request.headers.Authorization).to.equal('Basic dXNlcjpwYXNz');
				});
			});

			it('should authenticate the requst from the request', function () {
				var client = basicAuth(
					function (request) { return { request: request }; }
				);
				return client({ username: 'user', password: 'pass'}).then(function (response) {
					expect(response.request.headers.Authorization).to.equal('Basic dXNlcjpwYXNz');
				});
			});

			it('should not authenticate without a username', function () {
				var client = basicAuth(
					function (request) { return { request: request }; }
				);
				return client({}).then(function (response) {
					expect(response.request.headers.Authorization).to.not.exist();
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(basicAuth().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(basicAuth().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
