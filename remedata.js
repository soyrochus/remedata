// ### Remedata.js - easy Express middle-ware to provide json web-services with mock data-access
// ##### v 0.3 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
// 
// > Fair License (Fair)
// > Copyright (c) 2012 Iwan van der Kleijn
//
// > Usage of the works is permitted provided that this instrument is retained with the works, so that any entity that uses the works is notified of this instrument.
//
// > DISCLAIMER: THE WORKS ARE WITHOUT WARRANTY.

// #### Introduction
//    
// The basic usage of mockdata is to create custom Express routing handlers which allow the automatic loading of one 
// or more files, which then can be treated, though CRUD operations, as in-memory tables and consequentively saved back to
// disk. 
// 
// In the following examples we presume 
// 
//     var mdata = require('remedata');
// 
// Two basic forms are supported: 
//
//     app.get('/test/readuser1', mdata.toread('./json/test1.json'));
// 
// 'toread' returns a ready made routing handler which reads the specified filed (s) and returns them as the service response.
//     
//     app.get('/test/readuser2', mdata.toread('./json/test1.json', 
//        function(data, req, res){
//    
//       var result = mycomplexfunction(data, req.query['parameterx']);
//       return result;
//     }));
//  
// 'toread' with a callback allows for the manipulation of the data to be returned to the client. Remedata supports a small but complete
// set of operations to manipulate, sort and filter the data-sets. Sort and filter are compatible with the ExtJS Grid.   
//
//     app.post('/test/writeuser1', mdata.towrite('./json/test2.json'));
//  
// For POST, PUT and DELETE 'towrite' can be used. On its basic form it writes the data send in the request body to the specified file  
// 
//     app.post('/test/writeuser2', mdata.towrite('./json/test2.json', 
//           function(data, newdata, save, req, res){
//       
//       var record = mdata.insert(newdata, data);
//       save(data);
//       return record;
//     }));
//
// #### The source

// Dependency on the filesystem module & async (load with npm)
var fs = require('fs'),
    async = require('async');

// Errors are send to the client as json objects
var sendError = function(res, err){
    res.contentType('application/json');
    console.log(err);
    res.send({'success': false, 'error': err.message});
};

// Non-error response by default are treated as json; other data-types can be send by using res.send from
// within the function handlers
var sendResponse = function(contentType, data, res){
    res.contentType(contentType);
	if (data.hasOwnProperty('success')){
		res.send(data);
	} else {
        res.send({'success': true, 'data': data});                                                       
	}
};

// File reads are sequenced using the async library. In order for this to work, the actual call to fs.readFile neads to be 
// captured in a closure
var makeReader = function(path, encoding){
    return function(callback){
        fs.readFile(path, encoding, callback);
    };
};

// One or multiple files can be read. Once all files are loaded, the loaded data is passed to 'callback'
exports.read = function(paths, encoding, callback){
  if (!Array.isArray(paths)){
      paths = [paths];
  }
  var readers = paths.map(function(path){
                              return makeReader(path, encoding);
                          });
  async.parallel(readers, callback);
};

// With 'towrite' the central function in the Remedata API. Returns a Express routing handler which facilitates the automatic loading
// of the files specified in 'paths'. Either a single string should be assigned, denoting a single file path, or an array of String. 
// After loading of the file(s), the data loaded from the files is send back to the client if no callback has been specified.
// If a callback function 'f' has been specified, this will be called after all data has been loaded. 
// 'Encoding' determines the encoding of the files to be read. 
// By default it is set to 'utf-8'. 'ContentType' determines the HTTP response header which is send back to the client. 
// By default it is set to  'application/json'.
// 
// The callback function support the following parameters:
// 
// * data - The data loaded from the file or files specified in 'paths'.
// * req  - The Node/Express request object
// * res  - The Node/Request response object
//
// The function result is send back to the client. Any data is encapsulated in the "data" property of an object containing 
// the property "success". If the result is an object containing the property "success" than solely the object is returned. 
// Alternatively, res.send can be used to send data back the the client. In this case the function return should be void (undefined).
exports.toread = function(paths, f, encoding, contentType){
    
    //utf-8 and 'application/json' are specified by default. Note that all functions returning data will use json.
    if (typeof f !== 'function'){
        contentType = encoding  || 'application/json';
        encoding = f || 'utf8';
        //If no callback function is set, a default is used which just returns the passed data,
        f = function(fdata){ return fdata; };
    } else {
        encoding = encoding || 'utf8';
        contentType = contentType  || 'application/json';
    }
   
    return function(req, res){
      
        //Load one of more files, specified in paths, and pass them to the callback specified in 'toread' once al
        //data has been loaded
        exports.read(paths, encoding, function(err, results){
                        
                        if (err) {
                            sendError(res, err);
                        } else {
                            //All data read from files is converted to Javascript objects
                            results = results.map(function(e){
                                                      return JSON.parse(e);
                                                  });
                            try{
                                if (!Array.isArray(paths)){
                                    results = results[0];
                                }
                                //The data loaded from the files is passed to the callback specified in 'toread' 
                                //as an array in case multiple files have been specified
                                var fdata = f(results, req, res);                       
                                //In case there the callback has returned data, this should be send back to the client
                                if (typeof fdata !== 'undefined'){
                                    sendResponse(contentType, fdata, res);
                                } 
                            } catch (err) {
                                sendError(res, err);
                                return; 
                                /* STOP */                                
                            }
                        }
                     });
    };
};

/* -------------------------------------------------------- */

// File writes are sequenced using the async library. In order for this to work, the actual call to fs.writeFile neads to be 
// captured in a closure
var makeWriter = function(path, data, encoding){
    return function(callback){
        if((typeof data === 'undefined') || (data === null)){
            callback(null, data);
        }else {
            fs.writeFile(path, JSON.stringify(data), encoding, callback);
        }
    };
};

// One or multiple files can be written to the file system. Once all files have been written, the callback
// is called. In remedata this is used to send data back to the client
exports.write = function(paths, data, encoding, callback){

    if (!Array.isArray(paths)){
        paths = [paths];
        data = [data];
    }

    var writers = paths.map(function(path, index){
                                
                                return makeWriter(path, data[index], encoding);
                            });
  
    async.parallel(writers, callback);
};

// With 'toread' the central function in the Remedata API. Returns a Express routing handler which facilitates the automatic loading
// of the files specified in 'paths'. Data can be written automatically or on demand to these files. Either a single string should 
// be assigned, denoting a single file path, or an array of String. 
// After loading of the file(s), the send data,  the request body, is written to the specified files if no callback is specified. 
// It is important that the data is send as an array if multiple files are specified, with each node in the array is written to the 
// corresponding file in 'paths'. In case a callback function 'f' is specified, this is called after all files have been loaded. 
// 'Encoding' determines the encoding of the files to be read and to be written 
// By default it is set to 'utf-8'. 'ContentType' determines the HTTP response header which is send back to the client. 
// By default it is set to  'application/json'.
// 
// The callback function support the following parameters:
// 
// * data - The data loaded from the file or files specified in 'paths'.
// * newdata - The data send in the request body
// * saveF - function to save the data. This shoulld be an array if multiple files have been defined in 'paths', which each node 
// containing data which will be written to the corresponding file in 'paths' 
// * req  - The Node/Express request object
// * res  - The Node/Request response object
//
// The function result is send back to the client. Any data is encapsulated in the "data" property of an object containing 
// the property "success". If the result is an object containing the property "success" than solely the object is returned. 
// Alternatively, res.send can be used to send data back the the client. In this case the function return should be void (undefined).
exports.towrite = function(paths, f, encoding, contentType){

    if (typeof f !== 'function'){
        contentType = encoding  || 'application/json';
        encoding = f || 'utf8';
        // If ''towrite'' has no function handler set, the default action is to overwrite the file(s) specified in ''paths'' with the content
        // of the POST-ed data. In case that multiple paths are specified (through an array of path expressions), ''newdata'' should evaluate to an array as well
        f = function(fdata, newdata, save){ 
            // overwrite specified files with send data
            return save(newdata);            
        };
    } else {
        encoding = encoding || 'utf8';
        contentType = contentType  || 'application/json';
    }
   
    // return Connect middleware for Express
    return function(req, res) {
        var newdata = req.body;

        //Load one of more files, specified in paths, and pass them to the callback specified in 'towrite' once al
        //data has been loaded
        exports.read(paths, encoding, function(err, results){
                         
                         if (err) {
                             sendError(res, err);
                         } else {

                            //All data read from files is converted to Javascript objects
                             results = results.map(function(e){
                                                       return JSON.parse(e);
                                                   });
                             
                             if (!Array.isArray(paths)){
                                 results = results[0];
                             }
                             try{
                                 var saved;
                                 var saveF = function(data){
                                     saved = data;
                                     return data;
                                 };
                                 //callback function. The data returned is send back to the client
                                 //the data to be written to the files is captured in the free variable 'saved'
                                 //contained in the closure when the function is assigned to saveF
                                 var fdata = f(results, newdata, saveF, req, res);                                                                                               
                                 if (typeof fdata === 'undefined'){
                                     fdata = {success: true};
                                 }

                             } catch (errx) {
                                 sendError(res, errx);
                                 return; /* STOP in case of errors*/
                             }
                             
                             if (typeof saved !== 'undefined'){   

                                 //Sequence storage of data to the files specified in 'paths'
                                 exports.write(paths, saved, encoding, function(err){
                                                   //After the last file has been written, 
                                                   //the function result (or error info) is send
                                                   //back to the client
                                                   if (err){
                                                       sendError(res, err);                                                   
                                                   }else {
                                                       sendResponse(contentType, fdata, res);
                                                   }
                                               });                                 
                             } else {
                                 sendResponse(contentType, fdata, res);
                             }
                         }
                     });
    };
};

/* -------------------------------------------------------- */

var writeFile = function(path, data){
    fs.writeFile(path, JSON.stringify(data), function(err){
	                 if (err){
	                     console.log(err);
	                 }
                 });
};

var shallowCopy = function(o){

    var n_ = {};
    for(var e in o){
	    if (o.hasOwnProperty(e)){
	        n_[e] = o[e];
	    }
    }
    return n_;
};

//partition array and transform into object with metadata used to provide paging of webservice results 
var pageresult = function(data, start, limit, dataprop, totalprop){

    dataprop = dataprop || 'data';
    totalprop = totalprop || 'total';
    
    var res = {success: true};
    res[totalprop] = data.length;
    start = start - 0 ; //Number(start);
    limit = limit - 0; //Number(limit);
    var end = (start + limit);
 
    if (end > data.length){
	    res[dataprop] = data.slice(start);
    } else {
	    res[dataprop]= data.slice(start, end);
    }  
    return res;
};

//Filter array of objects where 'filterBy' contains the name of the property to search and 'filterOn' the
//search term
exports.filteron = function(data, filterOn, filterBy){

    return data.filter(function(e){
                         
                           return e[filterBy].toLowerCase().search(filterOn.toLowerCase()) >= 0;
                       }); 
};

//Filter array of objects where the request parameters 'filterBy'and 'filterOn' determine the filter
exports.filter = function(data, req){
    
    var filterOn = req.query['filterOn'];
    var filterBy = req.query['filterBy'];     
    if (filterOn && filterBy){
    
       return exports.filteron(data, filterOn, filterBy);   
    } else {
        return data;
    }
};

exports.ASCENDING = 1;
exports.ASC = 'ASC';
exports.DESCENDING = -1;
exports.DESC = 'DESC';

//
exports.sort = function(data, req){
   var _sort = req.query['sort'];

   if(_sort){
       _sort = JSON.parse(_sort);
       return exports.sorton(_sort[0].property, _sort[0].direction, data);
   } else {
       return data;
   }
};

//Sort array of objects where 'prop' contains the property to sort on and 'order' can be either ASC or DESC 
exports.sorton = function(prop, order, data){
    //The sort is performed on a shallow copy of the original array
    var newdata = data.slice(0);    
    newdata.sort(function(a, b){

                  if (a[prop] == b[prop]){
                          return 0;
                  }
                  
                  if ((order === exports.ASCENDING) || (order === exports.ASC)){
                      return (a[prop] > b[prop]) ? 1 : -1;
                  } else {
                      return (a[prop] < b[prop]) ? 1 : -1;
                  }
              });

    return newdata;
};

//page data compatible with Ext JS 3/4
exports.page = function(data, req){
    var start = req.query['start'] || 0;
    var limit = req.query['limit'] || data.length;     

    return pageresult(data, start, limit);       
};

//Generate new id based on the information contained in 'data', an array of objects. THe function will search for the highest id
//and use the increment of this value as the new id
var newId = function(data){
    var id = data.reduce(function(i, e){
	                         return (e.id > i)? e.id : i;
                         }, 0);
    return id + 1;   
};

//Insert a new object/record in 'data', an array of objects, assigning a new id to the record
exports.insert = function(record, data){
    record.id = newId(data);
    data.push(record);
    return record;
};

//find and object in 'data', an array of objects, where 'tofind' is either the value of 'id' or an object containing 
//property 'id' 
exports.find = function(tofind, data){

    var id = tofind.id || tofind;
    var index = -1;  
    for(var i = 0; i < data.length; i++){

	    if (data[i].id == id){
	        index = i;
            break;
	    }
    }
    return index;
};


//removed an object from 'data', an array of objects, where 'todelete' is either the value of 'id' or an object containing 
//property 'id' 
exports.remove = function(todelete /* record | id */, data){

    var index = exports.find(todelete, data);

    if (index == -1){
	    return false;
    } else {
	    data.splice(index, 1);
	    return true;
    }    
};

//Replaces an object from 'data', an array of objects, with 'record' which should contain a property 'id' existing
//in the data array
exports.replace = function(record /* record */, data){

    var index = exports.find(record, data);

    if (index == -1){
	    return false;
    } else {
	    var o = data[index];
	    for(var e in record){
	        if (record.hasOwnProperty(e) && o.hasOwnProperty(e)){
		        o[e] = record[e];
	        }	    
	    }
	    return record;
    }    
};

//Inserts a record into 'data' (when new) or replaces an object from 'data' (when already existing). 
exports.merge = function(record /* record */, data){

    if (record.id){
	    return exports.replace(record, data);
    }else {
	    return exports.insert(record, data);
    }
};

//Generates data written to file name 'file-path-to-write' containing a json array with 'n' number of nodes. 
//The function can be called in two forms
//
//     mdata.fillWith(function, number, file-path-to-write)
//
//where the 'function' is called for each node and the function results forms the array-node   
//Alternatively, the function can be called like
//
//     mdata.fillWith(file-path-to-read, number, file-path-to-write)
//
//Where the data loaded from 'file-path-to-read' is used for each node
exports.fillWith = function(f, n, target){
    
    var data = [];
    if (typeof f === 'function'){
	    for(var i = 0; i < n; i++){
	        data = f(data);
	    }
	    writeFile(target, data);
    } else{ 
	    var id = 0;
        fs.readFile(f, 'utf8', function (err, filedata) {
	                    if (err){
		                    console.log(err);
		                    return;
	                    }
	                    var o = JSON.parse(filedata);
                        
	                    for(var i = 0; i < n; i++){
		                    o =  shallowCopy(o);
		                    o.id = id;
		                    id++;
		                    data.push(o);
	                    }
                        writeFile(target, data);
                    });
    }
};
