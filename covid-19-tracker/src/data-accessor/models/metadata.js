'use strict';
const { country } = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MetadataSchema = new Schema({
  latestReportDate: {
    type: String,
    required: true,
  },
});

const Country = mongoose.model('metadata', MetadataSchema);

module.exports = Country;
