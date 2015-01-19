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


		describe('rest/util/uriTemplate', function () {

			var uriTemplate = require('./uriTemplate');

			describe('examples from rfc6570', function () {
				var params = {
					count : ['one', 'two', 'three'],
					dom   : ['example', 'com'],
					dub   : 'me/too',
					hello : 'Hello World!',
					half  : '50%',
					'var' : 'value',
					who   : 'fred',
					base  : 'http://example.com/home/',
					path  : '/foo/bar',
					list  : ['red', 'green', 'blue'],
					keys  : { semi: ';', dot: '.', comma: ',' },
					v     : '6',
					x     : '1024',
					y     : '768',
					empty : '',
					'empty_keys' : {},
					undef : null
				};

				it('3.2.1. Variable Expansion', function () {
					expect(uriTemplate.expand('{count}', params)).to.equal('one,two,three');
					expect(uriTemplate.expand('{count*}', params)).to.equal('one,two,three');
					expect(uriTemplate.expand('{/count}', params)).to.equal('/one,two,three');
					expect(uriTemplate.expand('{/count*}', params)).to.equal('/one/two/three');
					expect(uriTemplate.expand('{;count}', params)).to.equal(';count=one,two,three');
					expect(uriTemplate.expand('{;count*}', params)).to.equal(';count=one;count=two;count=three');
					expect(uriTemplate.expand('{?count}', params)).to.equal('?count=one,two,three');
					expect(uriTemplate.expand('{?count*}', params)).to.equal('?count=one&count=two&count=three');
					expect(uriTemplate.expand('{&count*}', params)).to.equal('&count=one&count=two&count=three');
				});

				it('3.2.2. Simple String Expansion: {var}', function () {
					expect(uriTemplate.expand('{var}', params)).to.equal('value');
					expect(uriTemplate.expand('{hello}', params)).to.equal('Hello%20World%21');
					expect(uriTemplate.expand('{half}', params)).to.equal('50%25');
					expect(uriTemplate.expand('O{empty}X', params)).to.equal('OX');
					expect(uriTemplate.expand('O{undef}X', params)).to.equal('OX');
					expect(uriTemplate.expand('{x,y}', params)).to.equal('1024,768');
					expect(uriTemplate.expand('{x,hello,y}', params)).to.equal('1024,Hello%20World%21,768');
					expect(uriTemplate.expand('?{x,empty}', params)).to.equal('?1024,');
					expect(uriTemplate.expand('?{x,undef}', params)).to.equal('?1024');
					expect(uriTemplate.expand('?{undef,y}', params)).to.equal('?768');
					expect(uriTemplate.expand('{var:3}', params)).to.equal('val');
					expect(uriTemplate.expand('{var:30}', params)).to.equal('value');
					expect(uriTemplate.expand('{list}', params)).to.equal('red,green,blue');
					expect(uriTemplate.expand('{list*}', params)).to.equal('red,green,blue');
					expect(uriTemplate.expand('{keys}', params)).to.equal('semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('{keys*}', params)).to.equal('semi=%3B,dot=.,comma=%2C');
				});

				it('3.2.3. Reserved Expansion: {+var}', function () {
					expect(uriTemplate.expand('{+var}', params)).to.equal('value');
					expect(uriTemplate.expand('{+hello}', params)).to.equal('Hello%20World!');
					expect(uriTemplate.expand('{+half}', params)).to.equal('50%25');

					expect(uriTemplate.expand('{base}index', params)).to.equal('http%3A%2F%2Fexample.com%2Fhome%2Findex');
					expect(uriTemplate.expand('{+base}index', params)).to.equal('http://example.com/home/index');
					expect(uriTemplate.expand('O{+empty}X', params)).to.equal('OX');
					expect(uriTemplate.expand('O{+undef}X', params)).to.equal('OX');

					expect(uriTemplate.expand('{+path}/here', params)).to.equal('/foo/bar/here');
					expect(uriTemplate.expand('here?ref={+path}', params)).to.equal('here?ref=/foo/bar');
					expect(uriTemplate.expand('up{+path}{var}/here', params)).to.equal('up/foo/barvalue/here');
					expect(uriTemplate.expand('{+x,hello,y}', params)).to.equal('1024,Hello%20World!,768');
					expect(uriTemplate.expand('{+path,x}/here', params)).to.equal('/foo/bar,1024/here');

					expect(uriTemplate.expand('{+path:6}/here', params)).to.equal('/foo/b/here');
					expect(uriTemplate.expand('{+list}', params)).to.equal('red,green,blue');
					expect(uriTemplate.expand('{+list*}', params)).to.equal('red,green,blue');
					expect(uriTemplate.expand('{+keys}', params)).to.equal('semi,;,dot,.,comma,,');
					expect(uriTemplate.expand('{+keys*}', params)).to.equal('semi=;,dot=.,comma=,');
				});

				it('3.2.4. Fragment Expansion: {#var}', function () {
					expect(uriTemplate.expand('{#var}', params)).to.equal('#value');
					expect(uriTemplate.expand('{#hello}', params)).to.equal('#Hello%20World!');
					expect(uriTemplate.expand('{#half}', params)).to.equal('#50%25');
					expect(uriTemplate.expand('foo{#empty}', params)).to.equal('foo#');
					expect(uriTemplate.expand('foo{#undef}', params)).to.equal('foo');
					expect(uriTemplate.expand('{#x,hello,y}', params)).to.equal('#1024,Hello%20World!,768');
					expect(uriTemplate.expand('{#path,x}/here', params)).to.equal('#/foo/bar,1024/here');
					expect(uriTemplate.expand('{#path:6}/here', params)).to.equal('#/foo/b/here');
					expect(uriTemplate.expand('{#list}', params)).to.equal('#red,green,blue');
					expect(uriTemplate.expand('{#list*}', params)).to.equal('#red,green,blue');
					expect(uriTemplate.expand('{#keys}', params)).to.equal('#semi,;,dot,.,comma,,');
					expect(uriTemplate.expand('{#keys*}', params)).to.equal('#semi=;,dot=.,comma=,');
				});

				it('3.2.5. Label Expansion with Dot-Prefix: {.var}', function () {
					expect(uriTemplate.expand('{.who}', params)).to.equal('.fred');
					expect(uriTemplate.expand('{.who,who}', params)).to.equal('.fred.fred');
					expect(uriTemplate.expand('{.half,who}', params)).to.equal('.50%25.fred');
					expect(uriTemplate.expand('www{.dom*}', params)).to.equal('www.example.com');
					expect(uriTemplate.expand('X{.var}', params)).to.equal('X.value');
					expect(uriTemplate.expand('X{.empty}', params)).to.equal('X.');
					expect(uriTemplate.expand('X{.undef}', params)).to.equal('X');
					expect(uriTemplate.expand('X{.var:3}', params)).to.equal('X.val');
					expect(uriTemplate.expand('X{.list}', params)).to.equal('X.red,green,blue');
					expect(uriTemplate.expand('X{.list*}', params)).to.equal('X.red.green.blue');
					expect(uriTemplate.expand('X{.keys}', params)).to.equal('X.semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('X{.keys*}', params)).to.equal('X.semi=%3B.dot=..comma=%2C');
					expect(uriTemplate.expand('X{.empty_keys}', params)).to.equal('X');
					expect(uriTemplate.expand('X{.empty_keys*}', params)).to.equal('X');
				});

				it('3.2.6. Path Segment Expansion: {/var}', function () {
					expect(uriTemplate.expand('{/who}', params)).to.equal('/fred');
					expect(uriTemplate.expand('{/who,who}', params)).to.equal('/fred/fred');
					expect(uriTemplate.expand('{/half,who}', params)).to.equal('/50%25/fred');
					expect(uriTemplate.expand('{/who,dub}', params)).to.equal('/fred/me%2Ftoo');
					expect(uriTemplate.expand('{/var}', params)).to.equal('/value');
					expect(uriTemplate.expand('{/var,empty}', params)).to.equal('/value/');
					expect(uriTemplate.expand('{/var,undef}', params)).to.equal('/value');
					expect(uriTemplate.expand('{/var,x}/here', params)).to.equal('/value/1024/here');
					expect(uriTemplate.expand('{/var:1,var}', params)).to.equal('/v/value');
					expect(uriTemplate.expand('{/list}', params)).to.equal('/red,green,blue');
					expect(uriTemplate.expand('{/list*}', params)).to.equal('/red/green/blue');
					expect(uriTemplate.expand('{/list*,path:4}', params)).to.equal('/red/green/blue/%2Ffoo');
					expect(uriTemplate.expand('{/keys}', params)).to.equal('/semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('{/keys*}', params)).to.equal('/semi=%3B/dot=./comma=%2C');
				});

				it('3.2.7. Path-Style Parameter Expansion: {;var}', function () {
					expect(uriTemplate.expand('{;who}', params)).to.equal(';who=fred');
					expect(uriTemplate.expand('{;half}', params)).to.equal(';half=50%25');
					expect(uriTemplate.expand('{;empty}', params)).to.equal(';empty');
					expect(uriTemplate.expand('{;v,empty,who}', params)).to.equal(';v=6;empty;who=fred');
					expect(uriTemplate.expand('{;v,bar,who}', params)).to.equal(';v=6;who=fred');
					expect(uriTemplate.expand('{;x,y}', params)).to.equal(';x=1024;y=768');
					expect(uriTemplate.expand('{;x,y,empty}', params)).to.equal(';x=1024;y=768;empty');
					expect(uriTemplate.expand('{;x,y,undef}', params)).to.equal(';x=1024;y=768');
					expect(uriTemplate.expand('{;hello:5}', params)).to.equal(';hello=Hello');
					expect(uriTemplate.expand('{;list}', params)).to.equal(';list=red,green,blue');
					expect(uriTemplate.expand('{;list*}', params)).to.equal(';list=red;list=green;list=blue');
					expect(uriTemplate.expand('{;keys}', params)).to.equal(';keys=semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('{;keys*}', params)).to.equal(';semi=%3B;dot=.;comma=%2C');
				});

				it('3.2.8. Form-Style Query Expansion: {?var}', function () {
					expect(uriTemplate.expand('{?who}', params)).to.equal('?who=fred');
					expect(uriTemplate.expand('{?half}', params)).to.equal('?half=50%25');
					expect(uriTemplate.expand('{?x,y}', params)).to.equal('?x=1024&y=768');
					expect(uriTemplate.expand('{?x,y,empty}', params)).to.equal('?x=1024&y=768&empty=');
					expect(uriTemplate.expand('{?x,y,undef}', params)).to.equal('?x=1024&y=768');
					expect(uriTemplate.expand('{?var:3}', params)).to.equal('?var=val');
					expect(uriTemplate.expand('{?list}', params)).to.equal('?list=red,green,blue');
					expect(uriTemplate.expand('{?list*}', params)).to.equal('?list=red&list=green&list=blue');
					expect(uriTemplate.expand('{?keys}', params)).to.equal('?keys=semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('{?keys*}', params)).to.equal('?semi=%3B&dot=.&comma=%2C');
				});

				it('3.2.9. Form-Style Query Continuation: {&var}', function () {
					expect(uriTemplate.expand('{&who}', params)).to.equal('&who=fred');
					expect(uriTemplate.expand('{&half}', params)).to.equal('&half=50%25');
					expect(uriTemplate.expand('?fixed=yes{&x}', params)).to.equal('?fixed=yes&x=1024');
					expect(uriTemplate.expand('{&x,y,empty}', params)).to.equal('&x=1024&y=768&empty=');
					expect(uriTemplate.expand('{&x,y,undef}', params)).to.equal('&x=1024&y=768');

					expect(uriTemplate.expand('{&var:3}', params)).to.equal('&var=val');
					expect(uriTemplate.expand('{&list}', params)).to.equal('&list=red,green,blue');
					expect(uriTemplate.expand('{&list*}', params)).to.equal('&list=red&list=green&list=blue');
					expect(uriTemplate.expand('{&keys}', params)).to.equal('&keys=semi,%3B,dot,.,comma,%2C');
					expect(uriTemplate.expand('{&keys*}', params)).to.equal('&semi=%3B&dot=.&comma=%2C');
				});
			});

			it('should support number params', function () {
				expect(uriTemplate.expand('http://example.com/{a}', { a: 123 })).to.equal('http://example.com/123');
			});
			it('should support boolean params', function () {
				expect(uriTemplate.expand('http://example.com/{a}', { a: true })).to.equal('http://example.com/true');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
