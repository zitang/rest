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


		describe('rest/interceptor/pathPrefix', function () {

			var pathPrefix, rest;

			pathPrefix = require('./pathPrefix');
			rest = require('../client/default');

			it('should prepend prefix before path', function () {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo' }
				);
				return client({ path: '/bar' }).then(function (response) {
					expect(response.request.path).to.equal('/foo/bar');
				});
			});

			it('should prepend prefix before path, adding slash between path segments', function () {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo' }
				);
				return client({ path: 'bar' }).then(function (response) {
					expect(response.request.path).to.equal('/foo/bar');
				});
			});

			it('should prepend prefix before path, not adding extra slash between path segments', function () {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo/' }
				);
				return client({ path: 'bar' }).then(function (response) {
					expect(response.request.path).to.equal('/foo/bar');
				});
			});

			it('should not prepend prefix before a fully qualified path', function () {
				var client = pathPrefix(
					function (request) { return { request: request }; },
					{ prefix: '/foo' }
				);
				return client({ path: 'http://www.example.com/' }).then(function (response) {
					expect(response.request.path).to.equal('http://www.example.com/');
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(pathPrefix().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(pathPrefix().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
