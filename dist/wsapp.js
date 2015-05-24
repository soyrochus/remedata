// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
//
// This file is part of [Remedata](remedata.html)

'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _sews = require('sews');

var sews = _interopRequireWildcard(_sews);

var _coreJs = require('core-js');

var corejs = _interopRequireWildcard(_coreJs);

var _remedata = require('./remedata');

var remedata = _interopRequireWildcard(_remedata);

// create json db from file with property 'id' as key
var db = remedata.jsondb('data/_data.json', { key: 'id' });

// Start up server-node (the "Bus")
var bus = sews.startbus({ port: 9000 });

// define default "read" handler; retrieves data from given db. i.e. equivalent to
// the HTTP GET Handler
bus.on('men.read', remedata.handleWsRead(db, 'men.retrieved'));

// define default "write" handler; write single item to given db. i.e. equivalent to
// the HTTP PUT Handler
bus.on('men.write', remedata.handleWsWrite(db, 'men.written'));

// define default "process" handler; write data to given db. either in batch mode or
// a single item. i.e. equivalent to the HTTP POST Handler
bus.on('men.process', remedata.handleWsProcess(db, 'men.processed'));

// define default "delete" handler; deletes item from given db.i.e. equivalent to the HTTP DELETE Handler
bus.on('men.delete', remedata.handleWsDelete(db, 'men.deleted'));
//# sourceMappingURL=wsapp.js.map