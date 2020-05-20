'use strict';
const { country } = require('config');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DailySchema = new Schema({
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
  },
});

const CountrySchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  iso2: {
    type: String,
    required: false,
  },
  icon: {
    type: String,
    required: false,
  },
  code: {
    type: String,
    required: false,
  },
  aliases: [String],
  population: {
    type: Number,
    required: false,
  },
  lat: {
    type: String,
    required: false,
  },
  long: {
    type: String,
    required: false,
  },
  lastUpdate: {
    type: String,
    required: false,
  },
  newlyAdded: {
    type: Boolean,
    required: false,
    default: false,
  },
  dailyStats: [DailySchema],
});

const Country = mongoose.model(country.modelName, CountrySchema);

module.exports = Country;
