var when = require('when');
var serv = require('serv');
var rest = require('../');
var interceptor = require('../interceptor');

var client = rest.wrap(require('../interceptor/mime'), {
                mime: 'application/json'
            }).wrap(require('../interceptor/defaultRequest'), {
                params: { username: process.env.SAUCE_USERNAME }
            }).wrap(require('../interceptor/basicAuth'), {
                username: process.env.SAUCE_USERNAME,
                password: process.env.SAUCE_ACCESS_KEY
            });

var pullingClient = client.wrap(interceptor({
                success: function (response) {
                    process.stdout.write('.');
                    return response.entity.completed ? response : when.reject(response);
                }
            })).wrap(require('../interceptor/retry'), {
                max: 5000
            });

var server = serv();
server.listen();

console.log('Local server running');

client({
    path: 'https://saucelabs.com/rest/v1/{username}/js-tests',
    method: 'POST',
    entity: {
        platforms: JSON.parse(process.env.BROWSERS),
        url: 'http://localhost:8000/',
        framework: 'mocha',
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        build: process.env.TRAVIS_COMMIT,
        name: 'rest.js - ' + process.env.TRAVIS_COMMIT
    }
}).entity().then(function (jobs) {
    process.stdout.write('Remote test queued, waiting for completion');

    return pullingClient({
        path: 'https://saucelabs.com/rest/v1/{username}/js-tests/status',
        method: 'POST',
        entity: jobs
    }).entity().then(function (status) {
        console.log('\n');
        var passed = status['js tests'].reduce(function (passed, job) {
            var result = job.result;

            console.log('%s at %s on %s', job.platform[1], job.platform[2] || 'latest', job.platform[0]);
            console.log('  %d total, %d passed, %d errors', result.tests, result.passes, result.failures);

            if (result.reports.length) {
                console.log();
                console.log('  Failures:');
                result.reports.forEach(function (report) {
                    console.log();
                    console.log('    %s', report.titles.join(' '));
                    console.log('      %s', report.name);
                    if (report.stack) {
                        console.log('      %s', report.stack.replace(/\n/g, '\n      '));
                    }
                });
            }

            console.log();
            return passed && !result.failures;
        }, true);

        if (!passed) {
            return when.reject('Test failures');
        }
    });
}).finally(function () {
    server.close();
}).catch(function (err) {
    if (err) {
        console.error('Error:', err);
    }
    process.exit(-1);
});
