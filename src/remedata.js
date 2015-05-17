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

let response = function(err, data, req, res, callback){
  if (callback){
    callback(err, data, req, res);
  } else {
    if(err){
      res.status(500).send(err.message);
    } else{
      if(data){
        res.json(data);
      } else {
        res.status(404).send("Not found");
      }
    }
  }
};

let responseNoData = function(err, req, res, callback){
  if (callback){
    callback(err, req, res);
  } else {
    if(err){
      res.status(500).send(err.message);
    } else{
        res.status(200).send("OK");
    }
  }
};

export let handleGET = function(db, callback){

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let lastPart = parts[parts.length-1];
    
    if(isAll) {
      db.getAll((err, data)=>{
        response(err, data, req, res, callback);
      });
    } else {
      db.getBy(lastPart,(err, data)=>{
        response(err, data, req, res, callback);
      });
    }
  };
};

export let handlePUT = function(db, callback){

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let lastPart = parts[parts.length-1];
    
    if(isAll) {
      responseNoData(new Error("Cannot PUT to collection without id"), req, res);
    } else {
      
      var data = req.body;
      if (data instanceof Array){
        responseNoData(new Error("Cannot PUT an array to collection"), req, res);
        return;
      }

      data[db.Id] =  data[db.Id] || lastPart;
      db.save(data,(err)=>{
        responseNoData(err, req, res, callback);
      });
    }
  };
};

export let handlePOST = function(db, callback){

  return function(req, res){

    let isAll = req.url.endsWith('/');
    let parts = req.url.split('/');
    let lastPart = parts[parts.length-1];
    var data = req.body;
    if(isAll) {
      if (data instanceof Array){
        db.saveAll(data, (err)=> {
          responseNoData(err, req, res, callback);
        });
      } else {
        if (!(data[db.Id])){
          responseNoData(new Error(`No key '${db.Id}' set on data-item`), req, res);
        } else {
          db.save(data, (err)=> {
            responseNoData(err, req, res, callback);
          });
        }
      }
    } else {
      responseNoData(new Error("Cannot POST to single item"), req, res);
    }
  };
};
