/*
 * Copyright 2014-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Michael Jackson
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


		describe('rest/mime/type/multipart/form-data', function () {

			var encoder = require('./form-data');

			if ('FormData' in global) {

				it('should pass a FormData object through unmodified', function () {
					var data = new FormData();
					expect(encoder.write(data)).to.equal(data);
				});

				it('should encode a form element as FormData', function () {
					var form = document.createElement('form');
					expect(encoder.write(form)).to.be.instanceof(FormData);
				});

				it('should encode a plain object as FormData', function () {
					expect(encoder.write({ a: 'string', b: 5 })).to.be.instanceof(FormData);
				});

				it('should throw when given a non-object', function () {
					expect(function () {
						encoder.write('hello world');
					}).to.throw(Error);
				});

			}

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window === 'object' ? window : global
	// Boilerplate for AMD and Node
));
