// #### Remedata.js - easy Express middle-ware to provide json web-services with mock data-access
// ##### v 1.0.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
// 
// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree.
// 
// Be aware that Remedata is written in ECMAScript 6 (2015). If to be executed in an ECMAScript 5 compatible run-time, you´ll need
// [Babel](http://babeljs.org) to compile, or transpile, the source files (in src) to their transformed target files (in dist).
// For an excellent overview of ES6 see: [https://babeljs.io/docs/learn-es6/](https://babeljs.io/docs/learn-es6/)
//   
// ##### Other files included in Remedata
// Json DB mock [jsondb.html](jsondb.html). 
// Example: [app.html](app.html)

// ##### Begin remedata.js source

// Import standard ES6 API
import * as corejs from 'core-js';
// Publish public interface of jsondb as part of remedata
import {isNone} from './jsondb';
export * from './jsondb';

// Represents HTTP return codes (i.e. 200 OK, 404 Not Found etc)
export class Status {

  // constructor (Error code: number), (error message: string), (auxiliary data: any): void
  constructor(code, message, data){
    this.code = code;
    this.message = message;
    this.data = data || null;
  }

  // ES6 Property Read syntax
  get Code (){
    return this.code;
  }
  
  get Message() {
    return this.message;
  }
  // Auxiliary payload
  get Data() {
    return this.data;
  }
}

// Known HTTP Status codes. OK
Status.OK = function(data) {
  return new Status(200, "OK", data);
};

Status.NOTFOUND = function(data){
  return new Status(404, "Not found", data);
}

// Generic HTTP error code (the infamous '500')
Status.ERROR = function(message, data){
  return new Status(500, message, data);
};

// Utility function to encapsulate server response or, if given a handler,
// delegate the response to the handler function.
// response (Exception: Error), (data: mixed [Status | Object]), (request: express.req), (response: express.res), (callback: function): void
let response = function(err, data, req, res, callback){

  // Short-circuit execution if a callback handler is provided: delegate to this function
  if (callback){
    callback(err, data, req, res);
  } else {
    // Respond with HTTP 500 and custom error message in case of an error
    if(err){
      res.status(500).send(err.message);
    } else{

      // If 'data' contains a Status object, this will be send to the client, otherwise
      if(data instanceof Status){
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
let urlInfo = function(req){
  let isAll = req.url.endsWith('/');
  let parts = req.url.split('/');
  let id = parts[parts.length-1];
  return {isAll, parts, id};
};

// Returns Express handler for GET requests
// handleGET (table instance: jsondb.JsonDb), (callback handler: function) : void
export let handleGET = function(db, callback){

  return function(req, res){

    // Get url data, obtain variables through 'destructuring' of the returned object
    //See: [Destructuring assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
    let {isAll, parts, id} = urlInfo(req);

    // If url denotes a collection (i.e.: 'path/') treat it like such        
    if(isAll) {
      // Retrieve all items from the table
      db.getAll((err, data)=>{
        
        response(err, data, req, res, callback);
      });
    } else {
      // In case of a path with an id, denoting a singular item, i.e. 'path/id', retreive the item by said id
      db.getBy(id,(err, data)=>{
        if(!data){
          // Respond with HTTP 404 if no item with such id is present in the table
          response(err, Status.NOTFOUND(id), req, res, callback);
        }else{
          
          response(err, data, req, res, callback);
        }
      });
    }
  };
};

// Returns Express handler for PUT requests.
export let handlePUT = function(db, callback){

  return function(req, res){

    let {isAll, parts, id} = urlInfo(req);
    let data = req.body;

    // Unlike handleGet, handlePUT (as well as POST and DELETE) pass control to a possible delegate *before* 
    // accesing the table. THis offers the modification of the send/uploaded data before writing to the database file.
    // The callback handler, if set, *MUST* return the data as the return value
    if (callback) {
      let data = callback({id, data, url: req.url, isCollection: isAll}, req, res);
      
      if (isNone(data)){
        // Fatal error if the callback handler did not return the data
        response(new Error('No data returned from Handle'), null, req, res);
        return;
      }
    }

    // In case of a PUT it MUST be an item whitih an id        
    if(isAll) {
      response(new Error("Cannot PUT to collection without id"), null, req, res, callback);
    } else {

      // Furthermore, it is not allowed to write to the whole collections. 
      if (data instanceof Array){
        response(new Error("Cannot PUT an array to collection"), null, req, res);
        return;
      }

      // Set the id on the data object and store the item to the database table
      data[db.Id] = id;
      db.save(data,(err)=>{
        response(err, Status.OK(data), req, res);
      });
    }
  };
};

// Returns Express handler for DELETE requests. 
export let handleDELETE = function(db, callback){

  return function(req, res){

    let {isAll, parts, id} = urlInfo(req);
       
    if (callback) {
      // Unlike the PUT and POST callbacks, the DELETE handler must return a potentially modifued id
      // which will be used to delete an item. If none is set, a fatal error will occur.
      let id = callback({id, url: req.url, isCollection: isAll}, req, res);
      if (isNone(id)){
        response(new Error('No id returned from Handle'), null, req, res);
        return;
      }
    }

    if(isAll) {
      response(new Error("Cannot DELETE from an collection without id"), null, req, res, callback);
    } else {
      
      db.deleteBy(id,(err, deleted)=>{

        if (deleted){
          response(err, Status.OK(id), req, res);
        } else {
          response(err, Status.NOTFOUND(id), req, res);
        }
      });
    }
  };
};


// Returns Express handler for POST requests.
export let handlePOST = function(db, preprocess, callback){

  return function(req, res){

    let {isAll, parts, id} = urlInfo(req);
    let data = req.body;

    if (callback) {
      let data = callback({id, data, url: req.url, isCollection: isAll}, req, res);
      if (isNone(data)){
        response(new Error('No data returned from Handle'), null, req, res);
        return;
      }
    }

    // Although a write operation akin to PUT, the semantics of POST differ in the following ways:
    // The url must represent a plurar or collection (i.e. 'path/'). The request can reporesent:
    // - an array send in the body of the request will replace (overwrite) the existing table
    // - an item send with an id will insert/replace an item 
    if(isAll) {
      if (data instanceof Array){
        db.saveAll(data, (err)=> {
          response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res);
        });
      } else {
        if (!(data[db.Id])){
          // Fatal error if no id is set on the item. This is a demonstration of the new 
          // [ES6 'template strings'](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/template_strings), 
          // which support 'string interpolation' (variable substitution).
          response(new Error(`No key '${db.Id}' set on data-item`), null, req, res);
        } else {
          db.save(data, (err)=> {
            response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res);
          });
        }
      }
    } else {
      // Fatal error in case the url denotes an item (use PUT in that case)
      response(new Error("Cannot POST to single item"), null, req, res);
    }
  };
};
