// #### Remedata.js - easy Express middle-ware to provide json web-services with mock data-access
// ##### v 1.0.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
// 
// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree. An additional grant of patent rights can be found in the PATENTS file in the same directory.
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

  // ES6 class constructor
  constructor(code, message, data){
    this.code = code;
    this.message = message;
    this.data = data || null;
  }

  //ES6 Property Read syntax
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

// Known HTTP Status codes
Status.OK = function(data) {
  return new Status(200, "OK", data);
};

Status.NOTFOUND = function(data){
  return new Status(404, "Not found", data);
}

// Generic HTTP error code
Status.ERROR = function(message, data){
  return new Status(500, message, data);
};

// Utility function to encapsulate server response or, if given a handler,
// delegate the response to the handler function
let response = function(err, data, req, res, callback){
  
  if (callback){
    callback(err, data, req, res);
  } else {
    if(err){
      res.status(500).send(err.message);
    } else{
      if(data instanceof Status){
        // Send an HTTP statuscode  
        res.status(data.Code).send(data.Message);
      } else {
        // or the data as JSON payload
        res.json(data);
      }
    }
  }
};

// get Url metadata; 
// {request object} -> {url meta-data } 
let urlInfo = function(req){
  let isAll = req.url.endsWith('/');
  let parts = req.url.split('/');
  let id = parts[parts.length-1];
  return {isAll, parts, id};
};

// Returns Express handler for GET requests
// jsondb instance [] -> ()
export let handleGET = function(db, callback){

  return function(req, res){
 
    let {isAll, parts, id} = urlInfo(req);
   
    if(isAll) {
      db.getAll((err, data)=>{

        response(err, data, req, res, callback);
      });
    } else {
      db.getBy(id,(err, data)=>{
        if(!data){

          response(err, Status.NOTFOUND(id), req, res, callback);
        }else{

          response(err, data, req, res, callback);
        }
      });
    }
  };
};

// Returns Express handler for PUT requests
export let handlePUT = function(db, callback){

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

    if(isAll) {
      response(new Error("Cannot PUT to collection without id"), null, req, res, callback);
    } else {
      
      if (data instanceof Array){
        response(new Error("Cannot PUT an array to collection"), null, req, res);
        return;
      }

      data[db.Id] = id;
      db.save(data,(err)=>{
        response(err, Status.OK(data), req, res);
      });
    }
  };
};

// Returns Express handler for DELETE requests
// JsonDb [callback] -> void
export let handleDELETE = function(db, callback){

  return function(req, res){
    debugger;
    let {isAll, parts, id} = urlInfo(req);
       
    if (callback) {
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


// Returns Express handler for POST requests
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

    if(isAll) {
      if (data instanceof Array){
        db.saveAll(data, (err)=> {
          response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res);
        });
      } else {
        if (!(data[db.Id])){
          response(new Error(`No key '${db.Id}' set on data-item`), null, req, res);
        } else {
          db.save(data, (err)=> {
            response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res);
          });
        }
      }
    } else {
      response(new Error("Cannot POST to single item"), null, req, res);
    }
  };
};
