// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
//
// This file is part of [Remedata](remedata.html)

// Import standard ES6 API
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _coreJs = require('core-js');

var corejs = _interopRequireWildcard(_coreJs);

var _fs = require('fs');

var fs = _interopRequireWildcard(_fs);

// Do not test for falsity, 0 and [] are perfectly valid values, but do test if variable is null or undefined
var isNone = function isNone(data) {
  return data === null || typeof data == 'undefined';
};

exports.isNone = isNone;
// Represents JSON file, as an in-memory database table. Mutations are written to disk.

var JsonDb = (function () {

  // constructor (path to JSON file: string), (property-name used to store key: any): void

  function JsonDb(path, id) {
    _classCallCheck(this, JsonDb);

    this.path = path;
    this.id = id;
    this.data = null;
  }

  _createClass(JsonDb, [{
    key: 'Id',
    get: function () {
      return this.id;
    }
  }, {
    key: 'getAll',

    // Retrieve array with all elements / items ('records')
    value: function getAll(callback) {
      var _this = this;

      // Directly return data if already loaded in-memory
      if (!isNone(this.data)) {
        callback(null, this.data);
      } else {
        // If table not initialized, load from disk        
        fs.readFile(this.path, { encoding: 'utf8' }, function (err, data) {
          if (err) {
            _this.data = null;
            callback(err);
          } else {
            try {
              // convert JSON string to JavaScript object.
              _this.data = JSON.parse(data);
              callback(null, _this.data);
            } catch (error) {
              // Catch error in case of conversion errors.
              _this.data = null;
              callback(error);
            }
          }
        });
      }
    }
  }, {
    key: '_getByKey',

    // private method; get element by value of the default key
    value: function _getByKey(key) {
      var _this2 = this;

      return this.data.find(function (e) {
        return e[_this2.id] == key;
      });
    }
  }, {
    key: '_guaranteeData',

    // Load data from disk if not present in memory
    value: function _guaranteeData(callback) {

      if (isNone(this.data)) {

        this.getAll(function (err, data) {
          if (err) {
            callback(err);
          } else {
            callback(null, data);
          }
        });
      } else {
        callback(null, this.data);
      }
    }
  }, {
    key: 'deleteBy',

    // remove item from table
    value: function deleteBy(key, callback) {
      var _this3 = this;

      // load data from file if not loaded in memory
      this._guaranteeData(function (err, data) {
        if (err) {
          callback(err);
        } else {
          (function () {
            var l0 = _this3.data.length;
            // Remove the item from the in-memory collection
            _this3.data = data.filter(function (e) {
              return !(e[_this3.id] == key);
            });
            // Determine if the element was removed or not
            var deleted = l0 != _this3.data.length;

            // flush changes to disk
            _this3.saveAll(_this3.data, function (err) {

              callback(err, deleted);
            });
          })();
        }
      });
    }
  }, {
    key: 'getBy',

    // Get one item from Table
    value: function getBy(key, callback) {
      var _this4 = this;

      this._guaranteeData(function (err, data) {
        if (err) {
          callback(err);
        } else {
          var res = _this4._getByKey(key);
          callback(null, res);
        }
      });
    }
  }, {
    key: 'save',

    // Save item to collection, overwriting an existing item and otherwise inserting it. Changes are flushed to disk.
    value: function save(item, callback) {
      var _this5 = this;

      this._guaranteeData(function (err, data) {
        if (err) {
          callback(err);
        } else {
          (function () {

            var succes = false;
            // map over collection, replacing an existing item with the new ('changed') one
            _this5.data = data.map(function (e) {
              if (e[_this5.id] == item[_this5.id]) {
                succes = true;
                return item;
              } else {
                return e;
              }
            });
            // If not existing item was found, the new item is considered to be truly new and
            // appended to the table
            if (!succes) {
              _this5.data.push(item);
            }
            // Data flushed to disk
            _this5.saveAll(_this5.data, function (err) {
              callback(err, item);
            });
          })();
        }
      });
    }
  }, {
    key: 'saveAll',

    // Save an Array to table, overwriting existing content
    value: function saveAll(data, callback) {

      // Arguments validations. 'Data' MUST be an array.
      if (isNone(data)) {
        callback(new Error('Invalid parameters'));
      }
      if (data instanceof Array) {
        callback(new Error('Data needs to be an Array'));
      }
      this.data = data;
      fs.writeFile(this.path, JSON.stringify(data), { encoding: 'utf8' }, function (err) {

        callback(err, data);
      });
    }
  }]);

  return JsonDb;
})();

// Public interface: factory function.
var jsondb = function jsondb(path, options) {
  var config = options || {};
  var id = config.id || 'id';
  return new JsonDb(path, id);
};

// Some examples.....
/*
let path = "data/_data.json";
let db = jsondb(path, {key: "id"});

db.getAll(function(err, data){
  console.log('in getAll', err, data, this);
 });

db.getBy(1, function(err, data){
  console.log("Get by: ", err, data);
});


db.getAll(function(err, data){
  console.log('in getAll', err, data);
  if (err) return;
  let d = data;
  d.push({
    id: 7,
    name: "Basje",
    surname: "Goris",
    age: 26
  });
  db.saveAll(d, function(err){
    console.log(err);
    if(err) return;
    db.getAll(function(err, data){
      
      console.log("2nd getAll", err, data);
    });
  });
});

db.getBy(4, (err, item)=>{
  if(err) {
    console.log("error: ", err);
    return;
  }
  item.name = "BasjeMAN";
  db.save(item, (err)=>{
    if(err) {
    console.log("error: ", err);
      return;
    } 
  });
});

db.deleteBy(1, (err)=> {
  if(err) {
    console.log("error: ", err);
    return;
  }
});
*/
exports.jsondb = jsondb;
//# sourceMappingURL=jsondb.js.map