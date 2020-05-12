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
    required: true,
    index: true,
  },
  iso2: {
    type: String,
    required: false,
  },
  iso3: {
    type: String,
    required: false,
  },
  population: {
    type: Number,
    required: false,
  },
  lat: {
    type: String,
    required: true,
  },
  long: {
    type: String,
    required: true,
  },
  lastUpdate: {
    type: Date,
    required: true,
  },
  lastReportDate: {
    type: String,
    required: true,
  },
  dailyStats: [DailySchema],
});

const Country = mongoose.model(country.modelName, CountrySchema);

module.exports = Country;
