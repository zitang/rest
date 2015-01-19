// TODO make this dynamic

define([
    'rest/browser.spec.browser',
    'rest/UrlBuilder.spec',
    'rest/wire.spec',

    'rest/client.spec',
    'rest/client/default.spec',
    'rest/client/jsonp.spec.browser',
    'rest/client/xdr.spec.browser',
    'rest/client/xhr.spec.browser',

    'rest/interceptor.spec',
    'rest/interceptor/basicAuth.spec',
    'rest/interceptor/csrf.spec',
    'rest/interceptor/defaultRequest.spec',
    'rest/interceptor/entity.spec',
    'rest/interceptor/errorCode.spec',
    'rest/interceptor/hateoas.spec',
    'rest/interceptor/jsonp.spec',
    'rest/interceptor/location.spec',
    'rest/interceptor/mime.spec',
    'rest/interceptor/oAuth.spec',
    'rest/interceptor/pathPrefix.spec',
    'rest/interceptor/retry.spec',
    'rest/interceptor/template.spec',
    'rest/interceptor/timeout.spec',
    'rest/interceptor/ie/xdomain.spec.browser',
    'rest/interceptor/ie/xhr.spec.browser',

    'rest/mime.spec',
    'rest/mime/registry.spec',
    'rest/mime/type/application/hal.spec',
    'rest/mime/type/application/json.spec',
    'rest/mime/type/application/x-www-form-urlencoded.spec',
    'rest/mime/type/multipart/form-data.spec.browser',
    'rest/mime/type/text/plain.spec',

    'rest/util/base64.spec',
    'rest/util/find.spec',
    'rest/util/lazyPromise.spec',
    'rest/util/mixin.spec',
    'rest/util/normalizeHeaderName.spec',
    'rest/util/pubsub.spec',
    'rest/util/responsePromise.spec',
    'rest/util/uriEncoder.spec',
    'rest/util/uriTemplate.spec'
], {});
