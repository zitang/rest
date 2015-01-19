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


		describe('rest/util/lazyPromise', function () {

			var lazyPromise = require('./lazyPromise');

			it('should not start work until a handler is attached', function () {
				var promise, spy;

				spy = sinon.spy(function () { return 'lazy'; });
				promise = lazyPromise(spy);

				expect(spy).to.have.callCount(0);

				return promise.then(function (value) {
					expect(spy).to.have.callCount(1);
					expect(value).to.equal('lazy');
				});
			});

			it('should reject if the work function throws', function () {
				var promise, spy;

				spy = sinon.spy(function () { throw 'lazy'; });
				promise = lazyPromise(spy);

				expect(spy).to.have.callCount(0);

				return promise.then(
					function () {
						throw new Error('should not be called');
					},
					function (value) {
						expect(spy).to.have.callCount(1);
						expect(value).to.equal('lazy');
					}
				);
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
