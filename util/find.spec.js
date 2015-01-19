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


		describe('rest/util/find', function () {

			var find = require('./find');

			it('should find objects that contain a given property name', function () {
				var graph, spy;

				graph = { foo: { foo: {}, bar: { bar: { foo: {} } } } };
				spy = sinon.spy();

				find.findProperties(graph, 'foo', spy);

				expect(spy).to.be.callCount(3);
				expect(spy).to.be.calledWithExactly(graph.foo, graph, 'foo');
				expect(spy).to.be.calledWithExactly(graph.foo.foo, graph.foo, 'foo');
				expect(spy).to.be.calledWithExactly(graph.foo.bar.bar.foo, graph.foo.bar.bar, 'foo');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
