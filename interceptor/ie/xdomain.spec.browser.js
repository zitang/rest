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


		describe('rest/interceptor/ie/xdomain', function () {

			var xdomain, rest, client, xdr, xhrCors;

			xdomain = require('rest/interceptor/ie/xdomain');
			rest = require('rest');

			function defaultClient(request) {
				return { request: request, client: 'default' };
			}

			function xdrClient(request) {
				return { request: request, client: 'xdr' };
			}

			client = xdomain(defaultClient, { xdrClient: xdrClient });

			xdr = 'XDomainRequest' in window;
			xhrCors = window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest();

			if (xdr && !xhrCors) {
				describe('for XDomainRequest enabled browsers', function () {

					it('should use the XDomainRequest engine for cross domain requests', function () {
						return client({ path: 'http://example.com' }).then(function (response) {
							expect(response.client).to.equal('xdr');
						});
					});

					it('should use the standard engine for same domain requests, with absolute paths', function () {
						return client({ path: window.location.toString() }).then(function (response) {
							expect(response.client).to.equal('default');
						});
					});

					it('should use the standard engine for same domain requests, with relative paths', function () {
						return client({ path: '/' }).then(function (response) {
							expect(response.client).to.equal('default');
						});
					});

				});
			}

			if (!xdr && xhrCors) {
				describe('for non-XDomainRequest enabled browsers', function () {

					it('should always use the standard engine', function () {
						return client({ path: 'http://example.com' }).then(function (response) {
							expect(response.client).to.equal('default');
						});
					});

				});
			}

			it('should have the default client as the parent by default', function () {
				expect(xdomain().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(xdomain().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
