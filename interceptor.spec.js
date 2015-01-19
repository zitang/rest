/*
* Copyright 2013-2015 the original author or authors
* @license MIT, see LICENSE.txt for details
*
* @author Scott Andrews
*/

(function (define) {
	'use strict';

	/*globals describe, it */
	var undef;

	define(function (require) {

		var chai, sinon, expect;

		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/interceptor', function () {

			var interceptor, rest, when;

			interceptor = require('./interceptor');
			rest = require('./client/default');
			when = require('when');

			function defaultClient(request) {
				return { request: request, id: 'default' };
			}

			function otherClient(request) {
				return { request: request, id: 'other' };
			}

			function errorClient(request) {
				return when.reject({ request: request, id: 'error' });
			}

			function unresponsiveClient(request) {
				request.id = 'unresponsive';
				return when.defer().promise;
			}

			it('should set the originator client on the request for the, but do not overwrite', function () {
				var theInterceptor, client;
				theInterceptor = interceptor();
				client = theInterceptor(defaultClient).wrap(theInterceptor);
				return client().then(function (response) {
					expect(response.id).to.equal('default');
					expect(response.request.originator).to.equal(client);
				});
			});

			it('should use the client configured into the interceptor by default', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					client: defaultClient
				});
				client = theInterceptor();
				return client().then(function (response) {
					expect(response.id).to.equal('default');
					expect(response.request.originator).to.equal(client);
				});
			});

			it('should override the client configured into the interceptor by default', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					client: defaultClient
				});
				client = theInterceptor(otherClient);
				return client().then(function (response) {
					expect(response.id).to.equal('other');
					expect(response.request.originator).to.equal(client);
				});
			});

			it('should intercept the request phase', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						request.phase = 'request';
						return request;
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.request.phase).to.equal('request');
				});
			});

			it('should intercept the request phase and handle a promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						return when().delay(5).then(function () {
							request.phase = 'request';
							return request;
						});
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.id).to.equal('default');
					expect(response.request.phase).to.equal('request');
				});
			});

			it('should intercept the request phase and handle a rejected promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						request.phase = 'request';
						return when.reject('rejected request');
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						// request never makes it to the root client
						expect(response.id).not.to.exist();
						expect(response.request.phase).to.equal('request');
						expect(response.error).to.equal('rejected request');
					}
				);
			});

			it('should intercept the response phase', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('response');
				});
			});

			it('should intercept the response phase and handle a promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						return when().delay(5).then(function () {
							response.phase = 'response';
							return response;
						});
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('response');
				});
			});

			it('should intercept the response phase and handle a rejceted promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when.reject(response);
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('response');
					}
				);
			});

			it('should intercept the response phase for an error', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return response;
					}
				});
				client = theInterceptor(errorClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('response');
					}
				);
			});

			it('should intercept the response phase for an error and handle a promise maintaining the error', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when(response);
					}
				});
				client = theInterceptor(errorClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('response');
					}
				);
			});

			it('should intercept the response phase for an error and handle a rejected promise maintaining the error', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function (response) {
						response.phase = 'response';
						return when.reject(response);
					}
				});
				client = theInterceptor(errorClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('response');
					}
				);
			});

			it('should intercept the success phase', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					success: function (response) {
						response.phase = 'success';
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('success');
				});
			});

			it('should intercept the success phase and handle a promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					success: function (response) {
						return when().delay(5).then(function () {
							response.phase = 'success';
							return response;
						});
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('success');
				});
			});

			it('should intercept the success phase and handle a rejceted promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					success: function (response) {
						response.phase = 'success';
						return when.reject(response);
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('success');
					}
				);
			});

			it('should intercept the error phase', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					error: function (response) {
						response.phase = 'error';
						return response;
					}
				});
				client = theInterceptor(errorClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('error');
				});
			});

			it('should intercept the error phase and handle a promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					error: function (response) {
						response.phase = 'error';
						return when(response);
					}
				});
				client = theInterceptor(errorClient);
				return client().then(function (response) {
					expect(response.phase).to.equal('error');
				});
			});

			it('should intercept the error phase and handle a rejceted promise', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					response: function () {
						throw new Error('should not be called');
					},
					error: function (response) {
						response.phase = 'error';
						return when.reject(response);
					}
				});
				client = theInterceptor(errorClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.phase).to.equal('error');
					}
				);
			});

			it('should pass interceptor config to handlers', function () {
				var theInterceptor, client, theConfig;
				theConfig = { foo: 'bar' };
				theInterceptor = interceptor({
					request: function (request, config) {
						request.phase = 'request';
						expect(config).to.equal(theConfig);
						return request;
					},
					response: function (response, config) {
						response.phase = 'response';
						expect(config).to.equal(theConfig);
						return response;
					}
				});
				client = theInterceptor(defaultClient, theConfig);
				return client().then(function (response) {
					expect(response.request.phase).to.equal('request');
					expect(response.phase).to.equal('response');
				});
			});

			it('should share context between handlers that is unique per request', function () {
				var theInterceptor, client, count, counted;
				count = 0;
				counted = [];
				theInterceptor = interceptor({
					request: function (request) {
						count += 1;
						if (count % 2) {
							this.count = count;
						}
						return request;
					},
					response: function (response) {
						counted.push(this.count);
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				return when.all([client(), client(), client()]).then(function () {
					expect(counted).to.have.length(3);
					expect(counted.indexOf(1)).to.equal(0);
					// if 'this' was shared between requests, we'd have 1 twice and no undef
					expect(counted.indexOf(2)).to.equal(-1);
					expect(counted.indexOf(undef)).to.equal(1);
					expect(counted.indexOf(3)).to.equal(2);
				});
			});

			it('should use the client provided by a ComplexRequest', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						return new interceptor.ComplexRequest({
							request: request,
							client: defaultClient
						});
					}
				});
				client = theInterceptor();
				return client().then(function (response) {
					expect(response.id).to.equal('default');
					expect(response.request.originator).to.equal(client);
				});
			});

			it('should use the repsponse provided by a ComplexRequest', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						return new interceptor.ComplexRequest({
							response: { request: request, id: 'complex-response' }
						});
					}
				});
				client = theInterceptor();
				return client().then(function (response) {
					expect(response.id).to.equal('complex-response');
					expect(response.request.originator).to.equal(client);
				});
			});

			it('should cancel requests with the abort trigger provided by a ComplexRequest', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request) {
						expect(request.id).to.not.equal('unresponsive');
						return new interceptor.ComplexRequest({
							request: request,
							abort: when.reject({ request: request, id: 'abort' })
						});
					}
				});
				client = theInterceptor(unresponsiveClient);
				return client().then(
					function () {
						throw new Error('should not be called');
					},
					function (response) {
						expect(response.id).to.equal('abort');
						expect(response.request.id).to.equal('unresponsive');
					}
				);
			});

			it('should have access to the client for subsequent requests', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request, config, meta) {
						request.client = meta.client;
						return request;
					},
					response: function (response, config, meta) {
						response.client = meta.client;
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				return client().then(function (response) {
					expect(response.client).to.equal(client);
					expect(response.request.client).to.equal(client);
					expect(response.id).to.equal('default');
				});
			});

			it('should have access to the invocation args', function () {
				var theInterceptor, client;
				theInterceptor = interceptor({
					request: function (request, config, meta) {
						request['arguments'] = meta['arguments'];
						return request;
					},
					response: function (response, config, meta) {
						response['arguments'] = meta['arguments'];
						return response;
					}
				});
				client = theInterceptor(defaultClient);
				return client('foo', 'bar').then(function (response) {
					expect(response['arguments'][0]).to.equal('foo');
					expect(response['arguments'][1]).to.equal('bar');
					expect(response.request['arguments']).to.equal(response['arguments']);
					expect(response.id).to.equal('default');
				});
			});

			it('should initialize the config object, modifying the provided object', function () {
				var theConfig, theInterceptor, client;
				theConfig = { foo: 'bar' };
				theInterceptor = interceptor({
					init: function (config) {
						expect(config).to.equal(theConfig);
						config.bleep = 'bloop';
						return config;
					},
					request: function (request, config) {
						expect(config).to.equal(theConfig);
						request.phase = 'request';
						return request;
					},
					response: function (response, config) {
						expect(config).to.equal(theConfig);
						response.phase = 'response';
						return response;
					}
				});
				expect(theConfig).not.to.have.property('bleep');
				client = theInterceptor(defaultClient, theConfig);
				expect(theConfig.bleep).to.equal('bloop');
				return client().then(function (response) {
					expect(response.request.phase).to.equal('request');
					expect(response.phase).to.equal('response');
					expect(response.id).to.equal('default');
				});
			});

			it('should normalize a string to a request object', function () {
				var theInterceptor, client;
				theInterceptor = interceptor();
				client = theInterceptor(defaultClient);
				return client('/').then(function (response) {
					expect(response.request.path).to.equal('/');
				});
			});

			it('should have the default client as the parent by default', function () {
				var theInterceptor = interceptor();
				expect(theInterceptor().skip()).to.equal(rest);
			});

			it('should support interceptor wrapping', function () {
				var theInterceptor = interceptor();
				expect(theInterceptor().wrap).to.be.a('function');
			});

			it('should return a ResponsePromise from intercepted clients', function () {
				var theInterceptor, client;
				theInterceptor = interceptor();
				client = theInterceptor(defaultClient);
				expect(client().entity).to.be.a('function');
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
