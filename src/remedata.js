// ### Remedata.js - easy Express middle-ware to provide json web-services with mock data-access
// ##### v 1.0.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
// 
// > Fair License (Fair)
// > Copyright (c) 2013 Iwan van der Kleijn
//
// > Usage of the works is permitted provided that this instrument is retained with the works, so that any entity that uses the works is notified of this instrument.
//
// > DISCLAIMER: THE WORKS ARE WITHOUT WARRANTY.

// #### Introduction

import * as corejs from 'core-js';
export * from './jsondb';

export class Status {

  constructor(code, message, data){
    this.code = code;
    this.message = message;
    this.data = data || null;
  }
  
  get Code (){
    return this.code;
  }
  
  get Message() {
    return this.message;
  }

  get Data() {
    return this.data;
  }
}

Status.OK = function(data) {
  return new Status(200, "OK", data);
};

Status.ERROR = function(message, data){
  return new Status(500, messsage, data);
};

Status.NOTFOUND = function(data){
  return new Status(404, "Not found", data);
}

let response = function(err, data, req, res, callback){
  
  if (callback){
    callback(err, data, req, res);
  } else {
    if(err){
      res.status(500).send(err.message);
    } else{
      if(data instanceof Status){
        //res.status(404).send("Not found");
        console.log("RESPONSE:", err, data);
        res.status(data.Code).send(data.Message);
      } else {
        res.json(data);
      }
    }
  }
};

export let handleGET = function(db, preprocess, callback){

  //Variable arguments: db, [processs = true|false], [callback = Function|null]
  if (arguments.length < 3){
    callback = preprocess;
    preprocess = null;
  }

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let id = parts[parts.length-1];

    if (preprocess && callback) {
      callback({id, url: req.url, isCollection: isAll}, req, res);
      return;
    }

    if(isAll) {
      db.getAll((err, data)=>{
        console.log("GETALL", err, data, id, parts);
        response(err, data, req, res, callback);
      });
    } else {
      db.getBy(id,(err, data)=>{
        if(!data){
          console.log("GET NOT FOUND", data, id);
          response(err, Status.NOTFOUND(id), req, res, callback);
        }else{
          console.log("ITEM", err, data, id, parts);
          response(err, data, req, res, callback);
        }
      });
    }
  };
};

export let handlePUT = function(db, preprocess, callback){

  //Variable arguments: db, [processs = true|false], [callback = Function|null]
  if (arguments.length < 3){
    callback = preprocess;
    preprocess = null;
  }

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let id = parts[parts.length-1];
    var data = req.body;
    
    if (preprocess && callback) {
      callback({id, data, url: req.url, isCollection: isAll}, req, res);
      return;
    }

    if(isAll) {
      response(new Error("Cannot PUT to collection without id"), null, req, res, callback);
    } else {
      
      if (data instanceof Array){
        response(new Error("Cannot PUT an array to collection"), null, req, res, callback);
        return;
      }

      data[db.Id] = id;
      db.save(data,(err)=>{
        response(err, Status.OK(data), req, res, callback);
      });
    }
  };
};

export let handleDELETE = function(db, preprocess, callback){

  //Variable arguments: db, [processs = true|false], [callback = Function|null]
  if (arguments.length < 3){
    callback = preprocess;
    preprocess = null;
  }

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let id = parts[parts.length-1];

    if (preprocess && callback) {
      callback({id, url: req.url, isCollection: isAll}, req, res);
      return;
    }

    if(isAll) {
      response(new Error("Cannot DELETE from an collection without id"), null, req, res, callback);
    } else {
      
      db.deleteBy(id,(err, deleted)=>{

        if (deleted){
          response(err, Status.OK(id), req, res, callback);
        } else {
          response(err, Status.NOTFOUND(id), req, res, callback);
        }
      });
    }
  };
};

export let handlePOST = function(db, preprocess, callback){

  //Variable arguments: db, [processs = true|false], [callback = Function|null]
  if (arguments.length < 3){
    callback = preprocess;
    preprocess = null;
  }

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let id = parts[parts.length-1];
    var data = req.body;

    if (preprocess && callback) {
      callback({id, data, url: req.url, isCollection: isAll}, req, res);
      return;
    }

    if(isAll) {
      if (data instanceof Array){
        db.saveAll(data, (err)=> {
          response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res, callback);
        });
      } else {
        if (!(data[db.Id])){
          response(new Error(`No key '${db.Id}' set on data-item`), null, req, res, callback);
        } else {
          db.save(data, (err)=> {
            response(err, Status.OK({data, id, url: req.url, isCollection: isAll}), req, res, callback);
          });
        }
      }
    } else {
      response(new Error("Cannot POST to single item"), null, req, res, callback);
    }
  };
};
