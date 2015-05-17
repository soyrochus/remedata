
import * as fs from 'fs';

let isNone = function(data){
  return ((data === null) || (typeof data == 'undefined'));
};

class JsonDb {
    
    constructor(path, id, unique){
      
      this.path = path;
      this.id = id;
      this.unique = unique;
      this.data = null;
    }
    
    getAll(callback){
        if (this.data !== null){
          callback(null, data);
        } else {
          fs.readFile(this.path, {encoding: 'utf8'},(err, data) =>
                      {
                        if (err){
                          this.data = null;
                          callback(err);
                        } else{
                          try {                            

                            callback(null,JSON.parse(data));

                          } catch(error){
                            this.data = null;
                            callback(error);
                          }
                        }
                      });
        }
    }

  saveAll(data, callback){
    console.log(' this is saveAll', data);
    if (isNone(data)){
      callback(new Error('Invalid LALA parameters'));
    }
    fs.writeFile(this.path, JSON.stringify(data), {encoding: 'utf8'}, (err) => {
      this.data = null;
      callback(err);
    });
  }
}

export let jsondb = function(path, options){
  let config = options || {};
  let id = config.id || 'id';
  let unique = isNone(config.unique) ? true: config.unique;
  return new JsonDb(path, id, unique);
};

let path = "data/_data.json";
let db = jsondb(path, {key: "id", unique:true});
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
  console.log("mutated data", d);
  debugger;
  db.saveAll(d, function(err){
    console.log(err);
    if(err) return;
    db.getAll(function(err, data){
      
      console.log("2nd getAll", err, data);
    });
  });
});



/*db.writeAll();
db.insert(data);
db.delete("id");
db.get("id");
db.getOrd(5);
*/