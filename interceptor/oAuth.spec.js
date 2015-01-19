/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, global) {
	'use strict';

	/*globals describe, it */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/interceptor/oAuth', function () {

			var oAuth, rest, pubsub;

			oAuth = require('./oAuth');
			pubsub = require('../util/pubsub');
			rest = require('../client/default');

			it('should authenticate the request for a known token', function () {
				var client;

				client = oAuth(
					function (request) { return { request: request, status: { code: 200 } }; },
					{ token: 'bearer abcxyz' }
				);

				return client({}).then(function (response) {
					expect(response.request.headers.Authorization).to.equal('bearer abcxyz');
				});
			});

			it('should use implicit flow to authenticate the request', function () {
				var client, windowStrategy, windowStrategyClose, oAuthCallbackName;

				oAuthCallbackName = 'oAuthCallback' + Math.round(Math.random() * 100000);
				windowStrategyClose = sinon.spy(function () {});
				windowStrategy = function (url) {
					var state;
					expect(url.indexOf('https://www.example.com/auth?response_type=token&redirect_uri=http%3A%2F%2Flocalhost%2FimplicitHandler&client_id=user&scope=openid&state=')).to.equal(0);
					state = url.substring(url.lastIndexOf('=') + 1);
					setTimeout(function () {
						global[oAuthCallbackName]('#state=' + state + '&=token_type=bearer&access_token=abcxyz');
					}, 10);
					return windowStrategyClose;
				};

				client = oAuth(
					function (request) {
						return { request: request, status: { code: 200 } };
					},
					{
						clientId: 'user',
						authorizationUrlBase: 'https://www.example.com/auth',
						redirectUrl: 'http://localhost/implicitHandler',
						scope: 'openid',
						windowStrategy: windowStrategy,
						oAuthCallbackName: oAuthCallbackName
					}
				);

				return client({}).then(function (response) {
					expect(response.request.headers.Authorization).to.equal('bearer abcxyz');
					expect(windowStrategyClose).to.have.callCount(1);
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(oAuth().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(oAuth().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof global === 'undefined' ? this : global
	// Boilerplate for AMD and Node
));
