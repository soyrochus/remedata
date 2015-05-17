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

