// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Remedata](remedata.html)

import * as sews from 'sews'
import * as corejs from 'core-js';
import * as remedata from './remedata';

// create json db from file with property 'id' as key
let db = remedata.jsondb("data/_data.json", {key: "id"});

let bus = sews.startbus({port:9000});
bus.on('men.read', remedata.handleWsRead(db, 'men.retrieved'));
bus.on('men.write', remedata.handleWsWrite(db,'men.written'));
bus.on('men.process', remedata.handleWsProcess(db,'men.processed'));
bus.on('men.delete', remedata.handleWsDelete(db, 'men.deleted'));


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