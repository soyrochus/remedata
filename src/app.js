// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Remedata](remedata.html)

// Import standard ES6 API
import * as corejs from 'core-js';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as remedata from './remedata';

const app = express();
// for parsing application/json
app.use(bodyParser.json()); 

// create json db from file with property 'id' as key
let db = remedata.jsondb("data/_data.json", {key: "id"});

// define default GET handler; retrieves data from given db
// If the url refers to a plural or collection, i.e. 'path/', the while json file is returned,
// If the url refers to an id, i.e. 'path/id', a single item with given id is returned
app.get('/men/*', remedata.handleGET(db));

// Define GET handler with callback which is called *after* db retrieval
// Parameter 'data' contains the content of the specific resoure
// In case the callback is given, it is expected that the code returns data to the called
// The return value of the handler has no effect on the further processing of the request
app.get('/hombres/*', remedata.handleGET(db,function(err, data, req, res){
   let result;
   if (data instanceof Array){                        
      result = data.map((e)=> {
        e.beard = true;
        return e;
      });
   }
   else {
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
app.put('/hombres/*', remedata.handlePUT(db,function(data, req, res){

   let modified;                        
   if (data instanceof Array){                        
      modified = data.map((e)=> {
        e.beard = true;
        return e;
      });
   }
   else {
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
app.post('/hombres/*', remedata.handlePOST(db,function(data, req, res){
  data.beard = true;
  return data;
}));

// Define DELETE handler; deletes data with given id in url, i.e. 'path/id'. 
app.delete('/men/*', remedata.handleDELETE(db));

// Define PUT handler with callback which is called *before* db write
// Return value is the actual id of the item to be deleted, but for the remainder 
// the rules for return value of the handle are like those for the PUT handler
app.delete('/hombres/*', remedata.handleDELETE(db,function(id, req, res){
   console.log('DELETE:',id);
   return (id + 1);
}));

// Start test server on port 3000; not needed for Remedata itself
let server = app.listen(3000, function () {

  let host = server.address().address;
  let port = server.address().port;

  console.log('Remedata listening at http://%s:%s', host, port);

});
