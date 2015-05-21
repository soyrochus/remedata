// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
//
// This file is part of [Remedata](remedata.html)
// It is a demo of how Remedata can be used.
// The application consists of a standard Express 4.* application. Instead of defining function callbacks directly on the
// Express app routing methods (get, post etc.), a handl

// Import standard ES6 API
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _coreJs = require('core-js');

var corejs = _interopRequireWildcard(_coreJs);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var bodyParser = _interopRequireWildcard(_bodyParser);

var _remedata = require('./remedata');

var remedata = _interopRequireWildcard(_remedata);

var app = (0, _express2['default'])();
// for parsing application/json
app.use(bodyParser.json());

// create json db from file with property 'id' as key
var db = remedata.jsondb('data/_data.json', { key: 'id' });

// define default GET handler; retrieves data from given db
// If the url refers to a plural or collection, i.e. 'path/', the while json file is returned,
// If the url refers to an id, i.e. 'path/id', a single item with given id is returned
app.get('/men/*', remedata.handleGET(db));

// Define GET handler with callback which is called *after* db retrieval
// Parameter 'data' contains the content of the specific resoure
// In case the callback is given, it is expected that the code returns data to the called
// The return value of the handler has no effect on the further processing of the request
app.get('/hombres/*', remedata.handleGET(db, function (err, data, req, res) {
  var result = undefined;
  if (data instanceof Array) {
    result = data.map(function (e) {
      e.beard = true;
      return e;
    });
  } else {
    data.beard = true;
    result = data;
  }
  res.json(result);
}));

// Define default PUT handler; writes data with given id in url, i.e. 'path/id'. Existing items are over-written
// Data should be passed as json formatted data in the request body with content-type 'application/json'
app.put('/men/*', remedata.handlePUT(db));

// Define PUT handler with callback which is called *before* db write
// PUT handlers (like POST and DELETE) MUST return modified data as the function result
// if not, it would not be usefull to define the handler anyway
app.put('/hombres/*', remedata.handlePUT(db, function (data, req, res) {

  var modified = undefined;
  if (data instanceof Array) {
    modified = data.map(function (e) {
      e.beard = true;
      return e;
    });
  } else {
    data.beard = true;
    modified = data;
  }

  return modified;
}));

// Define default POST handler;
// Data should be passed as json formatted data in the request body with content-type 'application/json'
// If the url refers to a plural or collection, i.e. 'path/', the while json file is written to de db (data should be an array)
app.post('/men/*', remedata.handlePOST(db));

// Define PUT handler with callback which is called *before* db write.
// Rules for return value of the handle are like those for the PUT handler
app.post('/hombres/*', remedata.handlePOST(db, function (data, req, res) {
  data.beard = true;
  return data;
}));

// Define DELETE handler; deletes data with given id in url, i.e. 'path/id'.
app['delete']('/men/*', remedata.handleDELETE(db));

// Define PUT handler with callback which is called *before* db write
// Return value is the actual id of the item to be deleted, but for the remainder
// the rules for return value of the handle are like those for the PUT handler
app['delete']('/hombres/*', remedata.handleDELETE(db, function (id, req, res) {
  console.log('DELETE:', id);
  return id + 1;
}));

// Start test server on port 3000; not needed for Remedata itself
var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Remedata listening at http://%s:%s', host, port);
});
//# sourceMappingURL=app.js.map