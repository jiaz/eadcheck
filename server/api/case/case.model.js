'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CaseSchema = new Schema({
  name: String,
  caseId: String,
  enabled: Boolean,
  created: Date,
  checkFrequency: String,
  lastChecked: Date,
  status: String,
});

module.exports = mongoose.model('Case', CaseSchema);
