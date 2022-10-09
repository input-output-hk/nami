"use strict";

exports.__esModule = true;
exports.getOnionDomain = getOnionDomain;
exports.getOrigin = void 0;

var getOrigin = function getOrigin(url) {
  if (typeof url !== 'string') return 'unknown';
  if (url.indexOf('file://') === 0) return 'file://'; // eslint-disable-next-line no-useless-escape

  var parts = url.match(/^.+\:\/\/[^\/]+/);
  return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};

exports.getOrigin = getOrigin;

function getOnionDomain(url, dict) {
  if (Array.isArray(url)) {
    return url.map(function (u) {
      return getOnionDomain(u, dict);
    });
  }

  if (typeof url === 'string') {
    var _url$match;

    var _ref = (_url$match = url.match(/^(http|ws)s?:\/\/([^:/]+\.)?([^/.]+\.[^/.]+)(\/.*)?$/i)) != null ? _url$match : [],
        protocol = _ref[1],
        subdomain = _ref[2],
        _domain = _ref[3],
        rest = _ref[4]; // ^(http|ws)s?:\/\/ - required http(s)/ws(s) protocol
    // ([^:/]+\.)? - optional subdomains, e.g. 'blog.'
    // ([^/.]+\.[^/.]+) - required two-part domain name, e.g. 'trezor.io'
    // (\/.*)?$ - optional path and/or query, e.g. '/api/data?id=1234'


    if (!_domain || !dict[_domain]) return url; // $FlowIssue cannot return string if url is string :)

    return protocol + "://" + (subdomain || '') + dict[_domain] + (rest || '');
  }

  return url;
}