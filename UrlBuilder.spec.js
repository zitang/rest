/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define, location) {
	'use strict';

	/*globals describe, it */
	var undef;

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/UrlBuilder', function () {

			var UrlBuilder = require('./UrlBuilder');

			it('should use the provided template', function () {
				var url = new UrlBuilder('/foo/bar').build();
				expect(url).to.equal('/foo/bar');
			});

			it('should replace values in the provided template', function () {
				var url = new UrlBuilder('/foo/{foo}', { foo: 'bar' }).build();
				expect(url).to.equal('/foo/bar');
			});

			it('should add unused params to the query string', function () {
				var url = new UrlBuilder('/foo/bar', { foo: 'bar' }).build();
				expect(url).to.equal('/foo/bar?foo=bar');
			});

			it('should add only name of unused param to query string if value is null', function () {
				var url = new UrlBuilder('/foo/bar', { foo: null }).build();
				expect(url).to.equal('/foo/bar?foo');
			});

			it('should add only name of unused param to query string if value is undefined', function () {
				var url = new UrlBuilder('/foo/bar', { foo: undef }).build();
				expect(url).to.equal('/foo/bar?foo');
			});

			it('should add unused params to an exsisting query string', function () {
				var url = new UrlBuilder('/foo/{foo}', { foo: 'bar', bleep: 'bloop' }).build();
				expect(url).to.equal('/foo/bar?bleep=bloop');
			});

			it('should url encode all param names and values added to the url', function () {
				var url = new UrlBuilder('/foo/bar', { 'bl%eep': 'bl oop' }).build();
				expect(url).to.equal('/foo/bar?bl%25eep=bl%20oop');
			});

			it('should return a built url for string concatination', function () {
				var url = '/prefix' + new UrlBuilder('/foo/bar');
				expect(url).to.equal('/prefix/foo/bar');
			});

			it('should append additional template to the current template', function () {
				var foo, bar;
				foo = new UrlBuilder('/foo');
				bar = foo.append('/bar');
				expect(foo).to.not.equal(bar);
				expect(foo.build()).to.equal('/foo');
				expect(bar.build()).to.equal('/foo/bar');
			});

			it('should add or override praram with appended values', function () {
				var foo, bar;
				foo = new UrlBuilder('/{foo}', { foo: '' });
				bar = foo.append('/bar', { foo: 'foo', bleep: 'bloop' });
				expect(foo).to.not.equal(bar);
				expect(foo.build()).to.equal('/');
				expect(bar.build()).to.equal('/foo/bar?bleep=bloop');
			});

			if (location) {
				it('should make the URL fully qualified', function () {
					expect(new UrlBuilder('').fullyQualify().build()).to.equal(location.protocol + '//' + location.host + location.pathname);
					expect(new UrlBuilder('/').fullyQualify().build()).to.equal(location.protocol + '//' + location.host + '/');
					expect(new UrlBuilder('/foo').fullyQualify().build()).to.equal(location.protocol + '//' + location.host + '/foo');
					expect(new UrlBuilder('//example.com').fullyQualify().build()).to.equal(location.protocol + '//example.com/');
					expect(new UrlBuilder('http://example.com').fullyQualify().build()).to.equal('http://example.com/');
					expect(new UrlBuilder('https://example.com').fullyQualify().build()).to.equal('https://example.com/');
				});
			}

			it('should indicate if the URL is absolute', function () {
				expect(new UrlBuilder('').isAbsolute()).to.be.false();
				expect(new UrlBuilder('/foo').isAbsolute()).to.be.true();
				expect(new UrlBuilder('//foo').isAbsolute()).to.be.true();
				expect(new UrlBuilder('http://example.com').isAbsolute()).to.be.true();
				expect(new UrlBuilder('https://example.com').isAbsolute()).to.be.true();
				expect(new UrlBuilder('file:///').isAbsolute()).to.be.true();
				expect(new UrlBuilder('file:///home/example/index.html').isAbsolute()).to.be.true();
				expect(new UrlBuilder('file:///C:/Documents%20and%20Settings/example/index.html').isAbsolute()).to.be.true();
			});

			it('should indicate if the URL is fully qualified', function () {
				expect(new UrlBuilder('').isFullyQualified()).to.be.false();
				expect(new UrlBuilder('/foo').isFullyQualified()).to.be.false();
				expect(new UrlBuilder('//foo').isFullyQualified()).to.be.false();
				expect(new UrlBuilder('http://example.com').isFullyQualified()).to.be.false();
				expect(new UrlBuilder('https://example.com').isFullyQualified()).to.be.false();
				expect(new UrlBuilder('http://example.com/').isFullyQualified()).to.be.true();
				expect(new UrlBuilder('https://example.com/').isFullyQualified()).to.be.true();
				expect(new UrlBuilder('file:///').isFullyQualified()).to.be.true();
				expect(new UrlBuilder('file:///home/example/index.html').isFullyQualified()).to.be.true();
				expect(new UrlBuilder('file:///C:/Documents%20and%20Settings/example/index.html').isFullyQualified()).to.be.true();
			});

			if (location) {
				it('should indicate if the URL is cross origin', function () {
					expect(new UrlBuilder('').isCrossOrigin()).to.be.false();
					expect(new UrlBuilder('/foo').isCrossOrigin()).to.be.false();
					expect(new UrlBuilder(location.protocol + '//' + location.host + '/foo').isCrossOrigin()).to.be.false();
					expect(new UrlBuilder('//example.com').isCrossOrigin()).to.be.true();
					expect(new UrlBuilder('http://example.com').isCrossOrigin()).to.be.true();
					expect(new UrlBuilder('https://example.com').isCrossOrigin()).to.be.true();
				});
			}

			describe('should split a URL into its parts', function () {

				it('for a simple http URL', function () {
					var parts = new UrlBuilder('http://www.example.com/').parts();
					expect(parts.href).to.equal('http://www.example.com/');
					expect(parts.protocol).to.equal('http:');
					expect(parts.host).to.equal('www.example.com');
					expect(parts.hostname).to.equal('www.example.com');
					expect(parts.port).to.equal('80');
					expect(parts.origin).to.equal('http://www.example.com');
					expect(parts.pathname).to.equal('/');
					expect(parts.search).to.equal('');
					expect(parts.hash).to.equal('');
				});

				it('for a simple https URL', function () {
					var parts = new UrlBuilder('https://www.example.com/').parts();
					expect(parts.href).to.equal('https://www.example.com/');
					expect(parts.protocol).to.equal('https:');
					expect(parts.host).to.equal('www.example.com');
					expect(parts.hostname).to.equal('www.example.com');
					expect(parts.port).to.equal('443');
					expect(parts.origin).to.equal('https://www.example.com');
					expect(parts.pathname).to.equal('/');
					expect(parts.search).to.equal('');
					expect(parts.hash).to.equal('');
				});

				it('for a complex URL', function () {
					var parts = new UrlBuilder('http://user:pass@www.example.com:8080/some/path?hello=world#main').parts();
					expect(parts.href).to.equal('http://user:pass@www.example.com:8080/some/path?hello=world#main');
					expect(parts.protocol).to.equal('http:');
					expect(parts.host).to.equal('www.example.com:8080');
					expect(parts.hostname).to.equal('www.example.com');
					expect(parts.port).to.equal('8080');
					expect(parts.origin).to.equal('http://www.example.com:8080');
					expect(parts.pathname).to.equal('/some/path');
					expect(parts.search).to.equal('?hello=world');
					expect(parts.hash).to.equal('#main');
				});

				it('for a path-less URL', function () {
					var parts = new UrlBuilder('http://www.example.com/?hello=world#main').parts();
					expect(parts.href).to.equal('http://www.example.com/?hello=world#main');
					expect(parts.protocol).to.equal('http:');
					expect(parts.host).to.equal('www.example.com');
					expect(parts.hostname).to.equal('www.example.com');
					expect(parts.port).to.equal('80');
					expect(parts.origin).to.equal('http://www.example.com');
					expect(parts.pathname).to.equal('/');
					expect(parts.search).to.equal('?hello=world');
					expect(parts.hash).to.equal('#main');
				});

				it('for a path and query-less URL', function () {
					var parts = new UrlBuilder('http://www.example.com/#main').parts();
					expect(parts.href).to.equal('http://www.example.com/#main');
					expect(parts.protocol).to.equal('http:');
					expect(parts.host).to.equal('www.example.com');
					expect(parts.hostname).to.equal('www.example.com');
					expect(parts.port).to.equal('80');
					expect(parts.origin).to.equal('http://www.example.com');
					expect(parts.pathname).to.equal('/');
					expect(parts.search).to.equal('');
					expect(parts.hash).to.equal('#main');
				});

				it('for a Unix file URL', function () {
					var parts = new UrlBuilder('file:///home/example/index.html').parts();
					expect(parts.href).to.equal('file:///home/example/index.html');
					expect(parts.protocol).to.equal('file:');
					expect(parts.host).to.equal('');
					expect(parts.hostname).to.equal('');
					expect(parts.port).to.equal('');
					expect(parts.origin).to.equal('file://');
					expect(parts.pathname).to.equal('/home/example/index.html');
					expect(parts.search).to.equal('');
					expect(parts.hash).to.equal('');
				});

				it('for a Windows file URL', function () {
					var parts = new UrlBuilder('file:///C:/Documents%20and%20Settings/example/index.html').parts();
					expect(parts.href).to.equal('file:///C:/Documents%20and%20Settings/example/index.html');
					expect(parts.protocol).to.equal('file:');
					expect(parts.host).to.equal('');
					expect(parts.hostname).to.equal('');
					expect(parts.port).to.equal('');
					expect(parts.origin).to.equal('file://');
					expect(parts.pathname).to.equal('/C:/Documents%20and%20Settings/example/index.html');
					expect(parts.search).to.equal('');
					expect(parts.hash).to.equal('');
				});

			});

			it('should be forgiving of non constructor calls', function () {
				/*jshint newcap:false */
				expect(UrlBuilder()).to.be.instanceof(UrlBuilder);
			});

			// TODO test .absolute()

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	this.location
	// Boilerplate for AMD and Node
));
