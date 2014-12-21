/*
 * Copyright 2014 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (define) {
	'use strict';

	define(function (require) {

		var $, client, UrlBuilder, responsePromise, parseHeaders, mixin;

		$ = require('jquery');
		client = require('../client');
		UrlBuilder = require('../UrlBuilder');
		responsePromise = require('../util/responsePromise');
		parseHeaders = require('../util/parseHeaders');
		mixin = require('../util/mixin');

		function prepareRequest(request) {
			return mixin({
				type: request.method = request.method || (request.entity ? 'POST' : 'GET'),
				url: new UrlBuilder(request.path || '', request.params).build(),
				headers: request.headers || {},
				data: request.entity
			}, request.mixin || {});
		}

		function parseResponse(response, jqXHR, data) {
			response.status = {
				code: jqXHR.status,
				text: jqXHR.statusText
			};
			response.headers = parseHeaders(jqXHR.getAllResponseHeaders());
			response.entity = data;
		}

		/**
		 * Executes the request via jQuery's AJAX support
		 *
		 * @returns {Promise<Response>}
		 */
		return client(function jquery(request) {
			return new responsePromise.ResponsePromise(function (resolve, reject) {

				var jqXHR, transformed, response;

				request = typeof request === 'string' ? { path: request } : request || {};
				response = { request: request };

				if (request.canceled) {
					response.error = 'precanceled';
					reject(response);
					return;
				}

				request.canceled = false;
				request.cancel = function cancel() {
					request.canceled = true;
					jqXHR.abort();
					reject(response);
				};

				transformed = prepareRequest(request);
				jqXHR = $.ajax(transformed);

				response.raw = {
					jqXHR: jqXHR,
					transformed: transformed
				};

				jqXHR.then(function (data, textStatus, jqXHR) {
					parseResponse(response, jqXHR, data);
					resolve(response);
				}, function (jqXHR, textStatus, errorThrown) {
					parseResponse(response, jqXHR);
					response.error = errorThrown;
					reject(response);
				});

			});
		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); },
	typeof window !== 'undefined' ? window : void 0,
	typeof document !== 'undefined' ? document : void 0
	// Boilerplate for AMD and Node
));
