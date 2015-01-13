/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /cases              ->  index
 * POST    /cases              ->  create
 * GET     /cases/:id          ->  show
 * PUT     /cases/:id          ->  update
 * DELETE  /cases/:id          ->  destroy
 */

'use strict';

var _ = require('lodash');
var Case = require('./case.model');

// Get list of things
exports.index = function(req, res) {
  Case.find(function (err, cases) {
    if(err) { return handleError(res, err); }
    return res.json(200, cases);
  });
};

// Get a single thing
exports.show = function(req, res) {
  Case.findById(req.params.id, function (err, cs) {
    if(err) { return handleError(res, err); }
    if(!cs) { return res.send(404); }
    return res.json(cs);
  });
};

// Creates a new thing in the DB.
exports.create = function(req, res) {
  Case.create(req.body, function(err, cs) {
    if(err) { return handleError(res, err); }
    return res.json(201, cs);
  });
};

// Updates an existing thing in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Case.findById(req.params.id, function (err, cs) {
    if (err) { return handleError(res, err); }
    if(!cs) { return res.send(404); }
    var updated = _.merge(cs, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, cs);
    });
  });
};

// Deletes a thing from the DB.
exports.destroy = function(req, res) {
  Case.findById(req.params.id, function (err, cs) {
    if(err) { return handleError(res, err); }
    if(!cs) { return res.send(404); }
    cs.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
