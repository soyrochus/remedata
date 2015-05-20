// > Copyright (c) 2012-2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Remedata](remedata.html)

// Import standard ES6 API
import * as corejs from 'core-js';
import * as fs from 'fs';

// Do not test for falsity, 0 and [] are perfectly valid values, but do test if variable is null or undefined 
export let isNone = function(data){
  return ((data === null) || (typeof data == 'undefined'));
};

// Represents JSON file, as an in-memory database table. Mutations are written to disk.
class JsonDb {

    // constructor (path to JSON file: string), (property-name used to store key: any): void
    constructor(path, id){
      this.path = path;
      this.id = id;
      this.data = null;
    }

    get Id() {
      return this.id;
    }

    // Retrieve array with all elements / items ('records') 
    getAll(callback){
        // Directly return data if already loaded in-memory
        if (!(isNone(this.data))){
          callback(null, this.data);
        } else { 
          // If table not initialized, load from disk         
          fs.readFile(this.path, {encoding: 'utf8'},(err, data) =>
                      {
                        if (err){
                          this.data = null;
                          callback(err);
                        } else{
                          try {
                            // convert JSON string to JavaScript object. 
                            this.data = JSON.parse(data);
                            callback(null, this.data);

                          } catch(error){
                            // Catch error in case of conversion errors.
                            this.data = null;
                            callback(error);
                          }
                        }
                      });
        }
    }

  // private method; get element by value of the default key
  _getByKey(key){

    return this.data.find((e)=>{
      return (e[this.id] == key);
    });
  }

  // Load data from disk if not present in memory
  _guaranteeData(callback){
    
    if (isNone(this.data)){
     
      this.getAll((err, data)=>{
        if (err){
          callback(err);
        }else {
          callback(null, data);
        }
      });
    } else {
      callback(null, this.data);
    }
  }

  // remove item from table
  deleteBy(key, callback){
    // load data from file if not loaded in memory
    this._guaranteeData((err, data)=>{
      if (err){
        callback(err);
      }else {
        let l0 = this.data.length;
        // Remove the item from the in-memory collection
        this.data = data.filter((e)=> {
          return !(e[this.id] == key)
        });
        // Determine if the element was removed or not
        let deleted = (l0 != this.data.length);

        // flush changes to disk
        this.saveAll(this.data, (err)=>{
          
          callback(err, deleted);
        });
      }
    });
  }

  // Get one item from Table
  getBy(key, callback){

    this._guaranteeData((err, data)=>{
      if (err){
        callback(err);
      }else {
        let res = this._getByKey(key);
        callback(null, res);
      }
    });
  }

  // Save item to collection, overwriting an existing item and otherwise inserting it. Changes are flushed to disk.
  save(item, callback){
    this._guaranteeData((err, data)=>{
      if (err){
        callback(err);
      }else {

        let succes = false;
        // map over collection, replacing an existing item with the new ('changed') one
        this.data = data.map((e)=>{
          if(e[this.id] == item[this.id]){
            succes = true;
            return item;
          } else{
            return e;
          }
        });
        // If not existing item was found, the new item is considered to be truly new and 
        // appended to the table
        if (!succes){
          this.data.push(item);
        }
        // Data flushed to disk
        this.saveAll(this.data, (err)=>{
          callback(err, item);
        });
      }
    });
  }
  // Save an Array to table, overwriting existing content 
  saveAll(data, callback){

    // Arguments validations. 'Data' MUST be an array.
    if (isNone(data)){
      callback(new Error('Invalid parameters'));
    }
    if ((data instanceof Array)){
      callback(new Error('Data needs to be an Array'));
    }
    this.data = data;
    fs.writeFile(this.path, JSON.stringify(data), {encoding: 'utf8'}, (err) => {

      callback(err, data);
    });
  }  
}


// Public interface: factory function. 
export let jsondb = function(path, options){
  let config = options || {};
  let id = config.id || 'id';
  return new JsonDb(path, id);
};


// Some examples.....
/*
let path = "data/_data.json";
let db = jsondb(path, {key: "id"});

db.getAll(function(err, data){
  console.log('in getAll', err, data, this);
 });

db.getBy(1, function(err, data){
  console.log("Get by: ", err, data);
});


db.getAll(function(err, data){
  console.log('in getAll', err, data);
  if (err) return;
  let d = data;
  d.push({
    id: 7,
    name: "Basje",
    surname: "Goris",
    age: 26
  });
  db.saveAll(d, function(err){
    console.log(err);
    if(err) return;
    db.getAll(function(err, data){
      
      console.log("2nd getAll", err, data);
    });
  });
});

db.getBy(4, (err, item)=>{
  if(err) {
    console.log("error: ", err);
    return;
  }
  item.name = "BasjeMAN";
  db.save(item, (err)=>{
    if(err) {
    console.log("error: ", err);
      return;
    } 
  });
});

db.deleteBy(1, (err)=> {
  if(err) {
    console.log("error: ", err);
    return;
  }
});
*/