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


		describe('rest/interceptor/entity', function () {

			var entity, rest;

			entity = require('./entity');
			rest = require('../client/default');

			it('should return the response entity', function () {
				var client, body;

				body = {};
				client = entity(function () { return { entity: body }; });

				return client().then(function (response) {
					expect(response).to.equal(body);
				});
			});

			it('should return the whole response if there is no entity', function () {
				var client, response;

				response = {};
				client = entity(function () { return response; });

				return client().then(function (r) {
					expect(r).to.equal(response);
				});
			});

			it('should have the default client as the parent by default', function () {
				expect(entity().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				expect(entity().wrap).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
