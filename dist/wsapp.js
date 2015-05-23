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

var bus = sews.startbus({ port: 9000 });
bus.on('men.read', remedata.handleWsRead(db, 'men.retrieved'));
bus.on('men.write', remedata.handleWsWrite(db, 'men.written'));

//bus.on('men.write', remedata.handleWsWrite(db));
//bus.on('men.process', remedata.handleWsProcess(db));
//bus.on('men.delete', remedata.handleWsDelete(db));

/* (data, con)=> {
  console.log('server received "men.read":', data);
  con.send('men.changed',"Send from Server");
  con.send('nahahahaha', "Send from Server as well");
});


bus.on('bus.error', (error) => {
  console.log('server error: ', error);
});
bus.on('bus.unknown', (data) => {
  console.log('server unkown message: ', data);
}); 

let counter = 0;

let client = sews.connect('ws://localhost:8080', ()=>{
  counter++;
  client.send('men.read', "givemedata: " + counter);
  //client.send('men.meep', "givemedataaswell");
});

client.on('men.changed', (data, con)=>{
  console.log('client received "men.changed"', data);
  counter++;
  client.send('men.read', "givemedata: " + counter);
});

client.on('bus.error', (error) => {
  console.log('Client error:', error);
});

client.on('bus.unknown', (data) => {
  console.log('client unkown message: ', data);
}); 
*/
//# sourceMappingURL=wsapp.js.map