// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
//
// This file is part of [Remedata](remedata.html)

'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var wss = new ws.Server({ port: 9000 });
wss.on('connection', function (ws) {
  ws.on('message', function (message) {
    console.log('received: %s', message);
    ws.send('received:' + JSON.stringify(message));
  });

  ws.send('connected');
});
//# sourceMappingURL=wsapp.js.map