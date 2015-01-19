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


		describe('rest/mime', function () {

			var mime = require('./mime');

			it('should parse plain mime types', function () {
				var parsed = mime.parse('text/plain');
				expect(parsed.raw).to.equal('text/plain');
				expect(parsed.type).to.equal('text/plain');
				expect(parsed.suffix).to.equal('');
				expect(parsed.params).to.deep.equal({});
			});

			it('should parse suffixed mime types', function () {
				var parsed = mime.parse('application/hal+json');
				expect(parsed.raw).to.equal('application/hal+json');
				expect(parsed.type).to.equal('application/hal');
				expect(parsed.suffix).to.equal('+json');
				expect(parsed.params).to.deep.equal({});
			});

			it('should parse paramerters from mime types', function () {
				var parsed = mime.parse('text/plain; charset=ascii; foo=bar');
				expect(parsed.raw).to.equal('text/plain; charset=ascii; foo=bar');
				expect(parsed.type).to.equal('text/plain');
				expect(parsed.suffix).to.equal('');
				expect(parsed.params).to.deep.equal({ charset: 'ascii', foo: 'bar' });
			});

			it('should parse a naked mime suffix', function () {
				var parsed = mime.parse('+json');
				expect(parsed.raw).to.equal('+json');
				expect(parsed.type).to.equal('');
				expect(parsed.suffix).to.equal('+json');
				expect(parsed.params).to.deep.equal({});
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
