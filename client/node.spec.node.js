/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Jeremy Grelle
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	/*globals describe, it, beforeEach, afterEach */

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/client/node', function () {

			var rest, client, http, https, fs, serverHttp, serverHttps;

			rest = require('./default');
			client = require('./node');
			http = require('http');
			https = require('https');
			fs = require('fs');

			beforeEach(function () {
				serverHttp = http.createServer();
				serverHttps = https.createServer({
					key: fs.readFileSync(__dirname + '/../test/ssl.key'),
					cert: fs.readFileSync(__dirname + '/../test/ssl.crt')
				});

				function handle(request, response) {
					var requestBody = '';
					request.on('data', function (chunk) {
						requestBody += chunk;
					});
					request.on('end', function () {
						var responseBody = requestBody ? requestBody : 'hello world';
						response.writeHead(200, 'OK', {
							'content-length': responseBody.length,
							'content-type': 'text/plain'
						});
						response.write(responseBody);
						response.end();
					});
					request.on('error', function () { console.log('server error'); });
				}

				serverHttp.on('request', handle);
				serverHttps.on('request', handle);

				// TODO handle port conflicts
				serverHttp.listen(8080);
				serverHttps.listen(8443);
			});
			afterEach(function () {
				serverHttp.close();
				serverHttps.close();
			});

			it('should make a GET by default', function () {
				var request = { path: 'http://localhost:8080/' };
				return client(request).then(function (response) {
					expect(response.raw.request).to.be.an.instanceof(http.ClientRequest);
					// expect(response.raw.response).to.be.an.instanceof(http.ClientResponse);
					expect(response.raw.response).to.exist();
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('GET');
					expect(response.entity).to.equal('hello world');
					expect(response.status.code).to.equal(200);
					expect(response.headers['Content-Type']).to.equal('text/plain');
					expect(parseInt(response.headers['Content-Length'], 10)).to.equal(response.entity.length);
					expect(request.canceled).to.be.false();
				});
			});

			it('should make an explicit GET', function () {
				var request = { path: 'http://localhost:8080/', method: 'GET' };
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('GET');
					expect(response.entity).to.equal('hello world');
					expect(response.status.code).to.equal(200);
					expect(request.canceled).to.be.false();
				});
			});

			it('should make a POST with an entity', function () {
				var request = { path: 'http://localhost:8080/', entity: 'echo' };
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('POST');
					expect(response.entity).to.equal('echo');
					expect(response.status.code).to.equal(200);
					expect(response.headers['Content-Type']).to.equal('text/plain');
					expect(parseInt(response.headers['Content-Length'], 10)).to.equal(response.entity.length);
					expect(request.canceled).to.be.false();
				});
			});

			it('should make an explicit POST with an entity', function () {
				var request = { path: 'http://localhost:8080/', entity: 'echo', method: 'POST' };
				return client(request).then(function (response) {
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('POST');
					expect(response.entity).to.equal('echo');
					expect(response.status.code).to.equal(200);
					expect(request.canceled).to.be.false();
				});
			});

			it('should make an https request', function () {
				var request = {
					path: 'https://localhost:8443/',
					mixin: { rejectUnauthorized: false }
				};
				return client(request).then(function (response) {
					expect(response.raw.request).to.be.an.instanceof(http.ClientRequest);
					// expect(response.raw.response).to.be.an.instanceof(http.ClientResponse);
					expect(response.raw.response).to.exist();
					expect(response.request).to.equal(request);
					expect(response.request.method).to.equal('GET');
					expect(response.entity).to.equal('hello world');
					expect(response.status.code).to.equal(200);
					expect(response.headers['Content-Type']).to.equal('text/plain');
					expect(parseInt(response.headers['Content-Length'], 10)).to.equal(response.entity.length);
					expect(request.canceled).to.be.false();
				});
			});

			it('should abort the request if canceled', function () {
				var request, response;
				request = { path: 'http://localhost:8080/' };
				client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request.canceled).to.be.true();
					}
				);
				expect(request.canceled).to.be.false();
				request.cancel();
				return response;
			});

			it('should propogate request errors', function () {
				var request = { path: 'http://localhost:1234' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.error).to.exist();
					}
				);
			});

			it('should not make a request that has already been canceled', function () {
				var request = { canceled: true, path: 'http://localhost:1234' };
				return client(request).then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.request).to.equal(request);
						expect(request.canceled).to.be.true();
						expect(response.error).to.equal('precanceled');
					}
				);
			});

			it('should normalize a string to a request object', function () {
				return client('http://localhost:8080/').then(function (response) {
					expect(response.request.path).to.equal('http://localhost:8080/');
				});
			});

			it('should be the default client', function () {
				rest.resetDefaultClient();
				expect(rest.getDefaultClient()).to.equal(client);
			});

			it('should support interceptor wrapping', function () {
				expect(client.wrap).to.be.a('function');
			});

			it('should return a ResponsePromise', function () {
				var response = client();
				response.otherwise(function () {});
				expect(response.entity).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
