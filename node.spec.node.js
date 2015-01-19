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


		describe('rest/node', function () {

			var rest, defaultClient, node;

			rest = require('./node');
			defaultClient = require('./client/default');
			node = require('./client/node');

			it('should be the default client', function () {
				expect(defaultClient).to.equal(rest);
			});

			it('should wrap the node client', function () {
				expect(rest.getDefaultClient()).to.equal(node);
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
