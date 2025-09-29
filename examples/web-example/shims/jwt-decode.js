const jwtDecode = require('jwt-decode');

module.exports = jwtDecode.default || jwtDecode;
module.exports.jwtDecode = jwtDecode.default || jwtDecode;
module.exports.default = jwtDecode.default || jwtDecode;