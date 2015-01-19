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

		var mocha, chai, sinon, expect;

		mocha = require('mocha');
		chai = require('chai');
		sinon = require('sinon');

		chai.use(require('sinon-chai'));
		expect = chai.expect;


		describe('rest/version', function () {

			var bowerJson, packageJson;

			bowerJson = require('../bower.json');
			packageJson = require('../package.json');

			it('should have the same name for package.json and bower.json', function () {
				expect(bowerJson.name).to.equal(packageJson.name);
			});

			it('should have the same version for package.json and bower.json', function () {
				expect(bowerJson.version).to.equal(packageJson.version);
			});

			it('should have the same depenencies for package.json and bpwer.json', function () {
				// this may not always hold true, but it currently does
				expect(bowerJson.dependencies).to.deep.equal(packageJson.dependencies);
			});

		});

	});

}(
	typeof define === 'function' && define.amd ? define : function (factory) { module.exports = factory(require); }
	// Boilerplate for AMD and Node
));
