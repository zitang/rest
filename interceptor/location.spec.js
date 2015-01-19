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


		describe('rest/interceptor/location', function () {

			var location, rest;

			location = require('./location');
			rest = require('../client/default');

			it('should follow the location header', function () {
				var client, spy;
				spy = sinon.spy(function (request) {
					var response = { request: request, headers: {  } };
					if (spy.callCount < 3) {
						response.headers.Location = '/foo/' + spy.callCount;
					}
					return response;
				});
				client = location(spy);
				return client({}).then(function (response) {
					expect(response.headers.Location).to.not.exist();
					expect(spy).to.have.callCount(3);
					expect(spy.returnValues[0].headers.Location).to.equal('/foo/1');
					expect(spy.args[1][0].path).to.equal('/foo/1');
					expect(spy.args[1][0].method).to.equal('GET');
					expect(spy.returnValues[1].headers.Location).to.equal('/foo/2');
					expect(spy.args[2][0].path).to.equal('/foo/2');
					expect(spy.args[2][0].method).to.equal('GET');
					expect(spy.returnValues[2].headers.Location).to.not.exist();
				});
			});

			it('should follow the location header when status code is greater or equal to configured status code', function () {
				var client, spy;
				spy = sinon.spy(function (request) {
					var statusCode = 300;
					var response = {
						request: request,
						headers: {  },
						status: { code: statusCode }
					};
					if (spy.callCount === 1) {
						response.headers.Location = '/foo';
					}
					statusCode = statusCode - 1;
					return response;
				});
				client = location(spy, { code: 300 });
				return client({}).then(function () {
					expect(spy).to.have.callCount(2);
					expect(spy.args[1][0].path).to.equal('/foo');
				});
			});

			it('should return the response if there is no location header', function () {
				var client, spy;
				spy = sinon.spy(function () { return { status: { code: 200 } }; });
				client = location(spy);
				return client({}).then(function (response) {
					expect(response.status.code).to.equal(200);
					expect(spy).to.have.callCount(1);
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(location().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(location().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
