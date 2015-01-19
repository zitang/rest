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


		describe('rest/client', function () {

			var client, rest, interceptor, defaultClient, skippableClient, defaultInterceptor;

			client = require('./client');
			rest = require('./client/default');
			interceptor = require('./interceptor');

			defaultClient = client(function (request) {
				return { request: request, id: 'default' };
			});
			skippableClient = client(function (request) {
				return { request: request, id: 'default' };
			}, rest);
			defaultInterceptor = interceptor();

			it('should wrap the client with an interceptor', function () {
				expect(defaultClient.wrap(defaultInterceptor)).is.a('function');
			});

			it('should continue to support chain as a alias for wrap', function () {
				var config = {};
				sinon.spy(defaultClient, 'wrap');
				defaultClient.chain(defaultInterceptor, config);
				expect(defaultClient.wrap).to.be.calledWith(defaultInterceptor, config);
				defaultClient.wrap.restore();
			});

			it('should return the next client in the chain', function () {
				expect(skippableClient.skip()).to.equal(rest);
				expect(defaultClient.skip).to.not.exist();
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
