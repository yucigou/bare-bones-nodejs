'use strict';
const { country } = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WorldSchema = new Schema({
  confirmed: {
    type: Number,
    required: true,
  },
  recovered: {
    type: Number,
    required: true,
  },
  deaths: {
    type: Number,
    required: true,
  },
  active: {
    type: Number,
    required: true,
  },
  reportDate: {
    type: String,
    required: true,
    index: true,
  },
});

const World = mongoose.model('world', WorldSchema);

module.exports = World;
