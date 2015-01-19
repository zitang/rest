/*
 * Copyright 2014-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	/*globals describe, it, beforeEach, afterEach */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/client/default', function () {

			var rest = require('./default'),
				interceptor = require('../interceptor');

			function stubClient(request) {
				return { request: request };
			}

			var stubInterceptor = interceptor();

			beforeEach(function () {
				rest.resetDefaultClient();
			});
			afterEach(function () {
				rest.resetDefaultClient();
			});

			it('should return a client by default', function () {
				expect(rest.getDefaultClient()).to.be.a('function');
			});

			it('should use the provided client as a default', function () {
				rest.setDefaultClient(stubClient);
				expect(rest.getDefaultClient()).to.equal(stubClient);
				expect(rest('request').request).to.equal('request');
			});

			it('should restore the platform default client', function () {
				var client = rest.getDefaultClient();
				rest.setDefaultClient(stubClient);
				expect(rest.getDefaultClient()).to.not.equal(client);
				rest.resetDefaultClient();
				expect(rest.getDefaultClient()).to.equal(client);
			});

			it('should wrap off the default client, using the lastest default client', function () {
				var client = rest.wrap(stubInterceptor);
				rest.setDefaultClient(stubClient);
				expect(client).to.not.equal(stubClient);
				expect(rest('request').request).to.equal('request');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
