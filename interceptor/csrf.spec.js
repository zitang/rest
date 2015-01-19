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


		describe('rest/interceptor/csrf', function () {

			var csrf, rest;

			csrf = require('./csrf');
			rest = require('../client/default');

			it('should protect the requst from the config', function () {
				var client = csrf(
					function (request) { return { request: request }; },
					{ token: 'abc123xyz789'}
				);
				return client({}).then(function (response) {
					expect(response.request.headers['X-Csrf-Token']).to.equal('abc123xyz789');
				});
			});

			it('should protect the requst from the request', function () {
				var client = csrf(
					function (request) { return { request: request }; }
				);
				return client({ csrfToken: 'abc123xyz789' }).then(function (response) {
					expect(response.request.headers['X-Csrf-Token']).to.equal('abc123xyz789');
				});
			});

			it('should protect the requst from the config using a custom header', function () {
				var client = csrf(
					function (request) { return { request: request }; },
					{ token: 'abc123xyz789', name: 'Csrf-Token' }
				);
				return client({}).then(function (response) {
					expect(response.request.headers['Csrf-Token']).to.equal('abc123xyz789');
				});
			});

			it('should protect the requst from the request using a custom header', function () {
				var client = csrf(
					function (request) { return { request: request }; }
				);
				return client({ csrfToken: 'abc123xyz789', csrfTokenName: 'Csrf-Token' }).then(function (response) {
					expect(response.request.headers['Csrf-Token']).to.equal('abc123xyz789');
				});
			});

			it('should not protect without a token', function () {
				var client = csrf(
					function (request) { return { request: request }; }
				);
				return client({}).then(function (response) {
					expect(response.request.headers['X-Csrf-Token']).to.not.exist();
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(csrf().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(csrf().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
