// #### Remedata.js - easy Express middle-ware to provide json web-services with mock data-access
// ##### v 1.0.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
//
// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree.
//
// Be aware that Remedata is written in ECMAScript 6 (2015). If to be executed in an ECMAScript 5 compatible run-time, you´ll need
// [Babel](http://babeljs.io) to compile, or transpile, the source files (in src) to their transformed target files (in dist).
// For an excellent overview of ES6 see: [https://babeljs.io/docs/learn-es6/](https://babeljs.io/docs/learn-es6/)
//  
// ##### Other files included in Remedata
// Json DB module [jsondb.html](jsondb.html).
// Example: [app.html](app.html)

// ##### Begin remedata.js source

// Import standard ES6 API
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _coreJs = require('core-js');

var corejs = _interopRequireWildcard(_coreJs);

// Publish public interface of jsondb as part of remedata

var _jsondb = require('./jsondb');

_defaults(exports, _interopRequireWildcard(_jsondb));

// Represents HTTP return codes (i.e. 200 OK, 404 Not Found etc)

var Status = (function () {

  // constructor (Error code: number), (error message: string), (auxiliary data: any): void

  function Status(code, message, data) {
    _classCallCheck(this, Status);

    this.code = code;
    this.message = message;
    this.data = data || null;
  }

  _createClass(Status, [{
    key: 'Code',

    // ES6 Property Read syntax
    get: function () {
      return this.code;
    }
  }, {
    key: 'Message',
    get: function () {
      return this.message;
    }
  }, {
    key: 'Data',

    // Auxiliary payload
    get: function () {
      return this.data;
    }
  }]);

  return Status;
})();

exports.Status = Status;

// Known HTTP Status codes. OK
Status.OK = function (data) {
  return new Status(200, 'OK', data);
};

Status.NOTFOUND = function (data) {
  return new Status(404, 'Not found', data);
};

// Generic HTTP error code (the infamous '500')
Status.ERROR = function (message, data) {
  return new Status(500, message, data);
};

// Utility function to encapsulate server response or, if given a handler,
// delegate the response to the handler function.
// response (Exception: Error), (data: mixed [Status | Object]), (request: express.req), (response: express.res), (callback: function): void
var response = function response(err, data, req, res, callback) {

  // Short-circuit execution if a callback handler is provided: delegate to this function
  if (callback) {
    callback(err, data, req, res);
  } else {
    // Respond with HTTP 500 and custom error message in case of an error
    if (err) {
      res.status(500).send(err.message);
    } else {

      // If 'data' contains a Status object, this will be send to the client, otherwise
      if (data instanceof Status) {
        // Send an HTTP statuscode 
        res.status(data.Code).send(data.Message);
      } else {
        // the data is send as a JSON payload
        res.json(data);
      }
    }
  }
};

// get Url metadata; urlInfo (express.req): object
var urlInfo = function urlInfo(req) {
  var isAll = req.url.endsWith('/');
  var parts = req.url.split('/');
  var id = parts[parts.length - 1];
  return { isAll: isAll, parts: parts, id: id };
};

// Returns Express handler for GET requests
// handleGET (table instance: jsondb.JsonDb), (callback handler: function) : void
var handleGET = function handleGET(db, callback) {

  return function (req, res) {

    // Get url data, obtain variables through 'destructuring' of the returned object
    //See: [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)

    var _urlInfo = urlInfo(req);

    var isAll = _urlInfo.isAll;
    var parts = _urlInfo.parts;
    var id = _urlInfo.id;

    // If url denotes a collection (i.e.: 'path/') treat it like such       
    if (isAll) {
      // Retrieve all items from the table
      db.getAll(function (err, data) {

        response(err, data, req, res, callback);
      });
    } else {
      // In case of a path with an id, denoting a singular item, i.e. 'path/id', retreive the item by said id
      db.getBy(id, function (err, data) {
        if (!data) {
          // Respond with HTTP 404 if no item with such id is present in the table
          response(err, Status.NOTFOUND(id), req, res, callback);
        } else {

          response(err, data, req, res, callback);
        }
      });
    }
  };
};

exports.handleGET = handleGET;
// Returns Express handler for PUT requests.
var handlePUT = function handlePUT(db, callback) {

  return function (req, res) {
    var _urlInfo2 = urlInfo(req);

    var isAll = _urlInfo2.isAll;
    var parts = _urlInfo2.parts;
    var id = _urlInfo2.id;

    var data = req.body;

    // Unlike handleGet, handlePUT (as well as POST and DELETE) pass control to a possible delegate *before*
    // accesing the table. THis offers the modification of the send/uploaded data before writing to the database file.
    // The callback handler, if set, *MUST* return the data as the return value
    if (callback) {
      var _data = callback({ id: id, data: _data, url: req.url, isCollection: isAll }, req, res);

      if ((0, _jsondb.isNone)(_data)) {
        // Fatal error if the callback handler did not return the data
        response(new Error('No data returned from Handle'), null, req, res);
        return;
      }
    }

    // In case of a PUT it MUST be an item whitih an id       
    if (isAll) {
      response(new Error('Cannot PUT to collection without id'), null, req, res, callback);
    } else {

      // Furthermore, it is not allowed to write to the whole collections.
      if (data instanceof Array) {
        response(new Error('Cannot PUT an array to collection'), null, req, res);
        return;
      }

      // Set the id on the data object and store the item to the database table
      data[db.Id] = id;
      db.save(data, function (err) {
        response(err, Status.OK(data), req, res);
      });
    }
  };
};

exports.handlePUT = handlePUT;
// Returns Express handler for DELETE requests.
var handleDELETE = function handleDELETE(db, callback) {

  return function (req, res) {
    var _urlInfo3 = urlInfo(req);

    var isAll = _urlInfo3.isAll;
    var parts = _urlInfo3.parts;
    var id = _urlInfo3.id;

    if (callback) {
      // Unlike the PUT and POST callbacks, the DELETE handler must return a potentially modifued id
      // which will be used to delete an item. If none is set, a fatal error will occur.
      var _id = callback({ id: _id, url: req.url, isCollection: isAll }, req, res);
      if ((0, _jsondb.isNone)(_id)) {
        response(new Error('No id returned from Handle'), null, req, res);
        return;
      }
    }

    if (isAll) {
      response(new Error('Cannot DELETE from an collection without id'), null, req, res, callback);
    } else {

      db.deleteBy(id, function (err, deleted) {

        if (deleted) {
          response(err, Status.OK(id), req, res);
        } else {
          response(err, Status.NOTFOUND(id), req, res);
        }
      });
    }
  };
};

exports.handleDELETE = handleDELETE;
// Returns Express handler for POST requests.
var handlePOST = function handlePOST(db, preprocess, callback) {

  return function (req, res) {
    var _urlInfo4 = urlInfo(req);

    var isAll = _urlInfo4.isAll;
    var parts = _urlInfo4.parts;
    var id = _urlInfo4.id;

    var data = req.body;

    if (callback) {
      var _data2 = callback({ id: id, data: _data2, url: req.url, isCollection: isAll }, req, res);
      if ((0, _jsondb.isNone)(_data2)) {
        response(new Error('No data returned from Handle'), null, req, res);
        return;
      }
    }

    // Although a write operation akin to PUT, the semantics of POST differ in the following ways:
    // The url must represent a plurar or collection (i.e. 'path/'). The request can reporesent:
    // - an array send in the body of the request will replace (overwrite) the existing table
    // - an item send with an id will insert/replace an item
    if (isAll) {
      if (data instanceof Array) {
        db.saveAll(data, function (err) {
          response(err, Status.OK({ data: data, id: id, url: req.url, isCollection: isAll }), req, res);
        });
      } else {
        if (!data[db.Id]) {
          // Fatal error if no id is set on the item. This is a demonstration of the new
          // [ES6 'template strings'](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings),
          // which support 'string interpolation' (variable substitution).
          response(new Error('No key \'' + db.Id + '\' set on data-item'), null, req, res);
        } else {
          db.save(data, function (err) {
            response(err, Status.OK({ data: data, id: id, url: req.url, isCollection: isAll }), req, res);
          });
        }
      }
    } else {
      // Fatal error in case the url denotes an item (use PUT in that case)
      response(new Error('Cannot POST to single item'), null, req, res);
    }
  };
};
exports.handlePOST = handlePOST;
//# sourceMappingURL=remedata.js.map