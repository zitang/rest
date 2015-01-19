/*
 * Copyright 2015 the original author or authors
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


		describe('rest/interceptor/template', function () {

			var template, rest;

			template = require('./template');
			rest = require('../client/default');

			function parent(request) {
				return { request: request };
			}

			it('should apply the params to the path template', function () {
				var client, config;

				config = {};
				client = template(parent, config);

				return client({ path: 'http://example.com/dictionary{/term:1,term}{?lang}', params: { term: 'hypermedia' } }).then(function (response) {
					expect(response.request.path).to.equal('http://example.com/dictionary/h/hypermedia');
					expect(response.request).to.not.have.property('params');
				});
			});

			it('should apply the template and params from the config if not defined on the request', function () {
				var client, config;

				config = { template: 'http://example.com/dictionary{/term:1,term}{?lang}', params: { term: 'hypermedia' } };
				client = template(parent, config);

				return client().then(function (response) {
					expect(response.request.path).to.equal('http://example.com/dictionary/h/hypermedia');
					expect(response.request).to.not.have.property('params');
				});
			});

			it('should individually mix config params into the request', function () {
				var client, config;

				config = { params: { lang: 'en-us' } };
				client = template(parent, config);

				return client({ path: 'http://example.com/dictionary{/term:1,term}{?lang}', params: { term: 'hypermedia' } }).then(function (response) {
					expect(response.request.path).to.equal('http://example.com/dictionary/h/hypermedia?lang=en-us');
					expect(response.request).to.not.have.property('params');
				});
			});

			it('should ignore missing and overdefined params', function () {
				var client, config;

				config = {};
				client = template(parent, config);

				return client({ path: 'http://example.com/dictionary{/term:1,term}{?lang}', params: { q: 'hypermedia' } }).then(function (response) {
					expect(response.request.path).to.equal('http://example.com/dictionary');
					expect(response.request).to.not.have.property('params');
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(template().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(template().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
