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


		describe('rest/mime/type/applicatino/x-www-form-urlencoded', function () {

			var encodeder = require('./x-www-form-urlencoded');

			it('should place an equals sign between value pairs', function () {
				expect(encodeder.write({ foo: 'bar', bleep: 'bloop' })).to.equal('foo=bar&bleep=bloop');
			});

			it('should treat array as multiple values with the same name', function () {
				expect(encodeder.write({ foo: [ 'bar', 'bloop'] })).to.equal('foo=bar&foo=bloop');
			});

			it('should url encode names and values', function () {
				expect(encodeder.write({ 'fo=o': 'b&ar' })).to.equal('fo%3Do=b%26ar');
			});

			it('should encode spaces as plus', function () {
				expect(encodeder.write({ 'fo o': 'b ar' })).to.equal('fo+o=b+ar');
			});

			it('should not include an equals if their is no value', function () {
				expect(encodeder.write({ 'foo': undefined })).to.equal('foo');
				expect(encodeder.write({ 'foo': null })).to.equal('foo');
				expect(encodeder.write({ 'foo': '' })).to.equal('foo=');
			});

			it('should parse an eqauls sign between value pairs', function () {
				expect(encodeder.read('foo=bar&bleep=bloop')).to.deep.equal({ foo: 'bar', bleep: 'bloop' });
			});

			it('should parse multiple values with the same name as an array', function () {
				expect(encodeder.read('foo=bar&foo=bloop')).to.deep.equal({ foo: ['bar', 'bloop'] });
			});

			it('should url decode names and values', function () {
				expect(encodeder.read('fo%3Do=b%26ar')).to.deep.equal({ 'fo=o': 'b&ar' });
			});

			it('should decode a plus as a space', function () {
				expect(encodeder.read('fo+o=b+ar')).to.deep.equal({ 'fo o': 'b ar' });
			});

			it('should parse missing value as null', function () {
				expect(encodeder.read('foo')).to.have.property('foo', null);
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
