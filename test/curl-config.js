/*
 * Copyright 2012-2015 the original author or authors
 * @license MIT, see LICENSE.txt for details
 *
 * @author Scott Andrews
 */

(function (global) {
	'use strict';

	global.curl = {
		packages: [
			{ name: 'rest', location: '/', main: 'browser' },
			{ name: 'curl', location: '/node_modules/curl-amd/src/curl', main: 'curl' },
			{ name: 'when', location: '/node_modules/when', main: 'when' },
			{ name: 'wire', location: '/node_modules/wire', main: 'wire' },
			{ name: 'mocha', location: '/node_modules/mocha', main: 'mocha', config: { moduleLoader: 'curl/loader/legacy', exports: 'mocha' } },
			{ name: 'sinon-chai', location: '/node_modules/sinon-chai', main: 'lib/sinon-chai' }
		],
		paths: {
			'chai': '/node_modules/chai/chai',
			'sinon': '/node_modules/sinon/pkg/sinon'
		}
	};

}(this));
