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


		describe('rest/util/urlEncoder', function () {

			var uriEncoder, strings;

			uriEncoder = require('./uriEncoder');

			strings = {
				alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
				digit: '0123456789',
				punctuation: '!"#$%&\'()*+,-./:;<=>?@[]^_`{}~'
			};

			it('#decode()', function () {
				expect(uriEncoder.decode('Hello%20World%21')).to.equal('Hello World!');

				expect(uriEncoder.decode('%41%42%43%44%45%46%47%48%49%4A%4B%4C%4D%4E%4F%50%51%52%53%54%55%56%57%58%59%5A%61%62%63%64%65%66%67%68%69%6A%6B%6C%6D%6E%6F%70%71%72%73%74%75%76%77%78%79%7A')).to.equal(strings.alpha);
				expect(uriEncoder.decode('%30%31%32%33%34%35%36%37%38%39')).to.equal(strings.digit);
				expect(uriEncoder.decode('%21%22%23%24%25%26%27%28%29%2A%2B%2C%2D%2E%2F%3A%3B%3C%3D%3E%3F%40%5B%5D%5E%5F%60%7B%7D%7E')).to.equal(strings.punctuation);
			});

			it('#encode()', function () {
				expect(uriEncoder.encode('Hello World!')).to.equal('Hello%20World%21');

				expect(uriEncoder.encode(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encode(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encode(strings.punctuation)).to.equal('%21%22%23%24%25%26%27%28%29%2A%2B%2C-.%2F%3A%3B%3C%3D%3E%3F%40%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodeScheme()', function () {
				expect(uriEncoder.encodeScheme('http')).to.equal('http');
				expect(uriEncoder.encodeScheme('view-source')).to.equal('view-source');
				expect(uriEncoder.encodeScheme('xmlrpc.beep')).to.equal('xmlrpc.beep');
				expect(uriEncoder.encodeScheme('foo$bar')).to.equal('foo%24bar');

				expect(uriEncoder.encodeScheme(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodeScheme(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodeScheme(strings.punctuation)).to.equal('%21%22%23%24%25%26%27%28%29%2A+%2C-.%2F%3A%3B%3C%3D%3E%3F%40%5B%5D%5E%5F%60%7B%7D%7E');
			});

			it('#encodeUserInfo()', function () {
				expect(uriEncoder.encodeUserInfo(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodeUserInfo(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodeUserInfo(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-.%2F:;%3C=%3E%3F%40%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodeHost()', function () {
				expect(uriEncoder.encodeHost('www.example.com')).to.equal('www.example.com');
				expect(uriEncoder.encodeHost('127.0.0.1')).to.equal('127.0.0.1');
				expect(uriEncoder.encodeHost('foo@bar.example.com')).to.equal('foo%40bar.example.com');

				expect(uriEncoder.encodeHost(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodeHost(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodeHost(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-.%2F%3A;%3C=%3E%3F%40%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodePort()', function () {
				expect(uriEncoder.encodePort(strings.alpha)).to.equal('%41%42%43%44%45%46%47%48%49%4A%4B%4C%4D%4E%4F%50%51%52%53%54%55%56%57%58%59%5A%61%62%63%64%65%66%67%68%69%6A%6B%6C%6D%6E%6F%70%71%72%73%74%75%76%77%78%79%7A');
				expect(uriEncoder.encodePort(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodePort(strings.punctuation)).to.equal('%21%22%23%24%25%26%27%28%29%2A%2B%2C%2D%2E%2F%3A%3B%3C%3D%3E%3F%40%5B%5D%5E%5F%60%7B%7D%7E');
			});

			it('#encodePathSegment()', function () {
				expect(uriEncoder.encodePathSegment('path')).to.equal('path');
				expect(uriEncoder.encodePathSegment('/path')).to.equal('%2Fpath');

				expect(uriEncoder.encodePathSegment(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodePathSegment(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodePathSegment(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-.%2F:;%3C=%3E%3F@%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodePath()', function () {
				expect(uriEncoder.encodePath('path')).to.equal('path');
				expect(uriEncoder.encodePath('/path')).to.equal('/path');
				expect(uriEncoder.encodePath('/path?')).to.equal('/path%3F');

				expect(uriEncoder.encodePath(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodePath(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodePath(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-./:;%3C=%3E%3F@%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodeQuery()', function () {
				expect(uriEncoder.encodeQuery('?foo=bar&baz=bloop')).to.equal('?foo=bar&baz=bloop');
				expect(uriEncoder.encodeQuery('?foo=bar&baz=bloop#')).to.equal('?foo=bar&baz=bloop%23');

				expect(uriEncoder.encodeQuery(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodeQuery(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodeQuery(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-./:;%3C=%3E?@%5B%5D%5E_%60%7B%7D~');
			});

			it('#encodeFragment()', function () {
				expect(uriEncoder.encodeFragment('#foo')).to.equal('%23foo');
				expect(uriEncoder.encodeFragment('#foo=bar&baz=bloop')).to.equal('%23foo=bar&baz=bloop');
				expect(uriEncoder.encodeFragment('#foo=bar&baz=bloop#')).to.equal('%23foo=bar&baz=bloop%23');

				expect(uriEncoder.encodeFragment(strings.alpha)).to.equal(strings.alpha);
				expect(uriEncoder.encodeFragment(strings.digit)).to.equal(strings.digit);
				expect(uriEncoder.encodeFragment(strings.punctuation)).to.equal('!%22%23$%25&\'()*+,-./:;%3C=%3E?@%5B%5D%5E_%60%7B%7D~');
			});

			it('utf-16', function () {
				// airplane ✈
				expect(uriEncoder.encode('\u2708')).to.equal('%E2%9C%88');
				expect(uriEncoder.decode('%E2%9C%88')).to.equal('\u2708');

				// pile of poo
				expect(uriEncoder.encode('\u1F4A9')).to.equal('%E1%BD%8A9');
				expect(uriEncoder.decode('%E1%BD%8A9')).to.equal('\u1F4A9');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
