'use strict';
const { queue } = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PayloadSchema = new Schema({
  reportDate: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model(queue.modelName, PayloadSchema);
