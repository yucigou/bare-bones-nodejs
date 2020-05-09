'use strict';

var Payload = require('./models/payload-schema');

module.exports = {
  randomPayload: function () {
    return new Payload({
      first: 'asdasdasd',
      second: 'asdasdadadasdas',
    });
  },
};
