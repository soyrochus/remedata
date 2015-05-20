// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Remedata](remedata.html)


import * as ws from 'ws'

let wss = new ws.Server({port:9000});
wss.on('connection', (ws) => {
  ws.on('message', (message)=> {
    console.log('received: %s', message);
    ws.send('received:' + JSON.stringify(message));
  });

  ws.send('connected');
});

