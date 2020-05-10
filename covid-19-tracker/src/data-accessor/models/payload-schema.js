'use strict';
const { queue } = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Payload = new Schema({
  first: {
    type: String,
    required: true,
  },
  second: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(queue.payloadModel, Payload);
