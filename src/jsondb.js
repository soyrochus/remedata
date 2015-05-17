
import * as corejs from 'core-js';
import * as fs from 'fs';

let isNone = function(data){
  return ((data === null) || (typeof data == 'undefined'));
};

class JsonDb {
    
    constructor(path, id){
      
      this.path = path;
      this.id = id;
      this.data = null;
    }
    
    getAll(callback){
        
        if (!(isNone(this.data))){
          callback(null, this.data);
        } else {
          fs.readFile(this.path, {encoding: 'utf8'},(err, data) =>
                      {
                        if (err){
                          this.data = null;
                          callback(err);
                        } else{
                          try {
                            this.data = JSON.parse(data);
                            callback(null, this.data);

                          } catch(error){
                            this.data = null;
                            callback(error);
                          }
                        }
                      });
        }
    }

  _getByKey(key){

    return this.data.find((e)=>{
      return (e[this.id] == key);
    });
  }

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

  deleteBy(key, callback){
    this._guaranteeData((err, data)=>{
      if (err){
        callback(err);
      }else {
        this.data = data.filter((e)=> {
          return !(e[this.id] == key)
        });
        this.saveAll(this.data, (err)=>{
          callback(err);
        });
      }
    });
  }

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

  save(item, callback){
    this._guaranteeData((err, data)=>{
      if (err){
        callback(err);
      }else {

        let succes = false;
        this.data = data.map((e)=>{
          if(e[this.id] == item[this.id]){
            succes = true;
            return item;
          } else{
            return e;
          }
        });
        if (!succes){
          this.data.push(item);
        }
        this.saveAll(this.data, (err)=>{
          callback(err, item);
        });
      }
    });
  }

  saveAll(data, callback){

    if (isNone(data)){
      callback(new Error('Invalid parameters'));
    }
    this.data = data;
    fs.writeFile(this.path, JSON.stringify(data), {encoding: 'utf8'}, (err) => {

      callback(err, data);
    });
  }  
}

export let jsondb = function(path, options){
  let config = options || {};
  let id = config.id || 'id';
  return new JsonDb(path, id);
};

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