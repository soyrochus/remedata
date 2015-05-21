remedata
========

## Easy Express (Node.js) middle-ware to provide json web-services with mock data-access

##### v 1.0.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)

> Copyright (c) 2012-2015 Iwan van der Kleijn
> All rights reserved.

> This source code is licensed under the BSD-style license found at the bottom of this page and in the LICENSE file in the root directory of this source tree.

### Introduction

The basic function of 'remedata' is to quickly create custom Express routing handlers, which allow the automatic loading of one 
or more JSON files, which then can be treated, though CRUD operations, as in-memory tables and consecutively saved back to
disk. So a GET method correspond to a READ, a PUT to a WRITE etc. This should be ideal to quickly, in a few minutes, create an elaborate web service API. 

### ECMAScript 6

Remedata is written in ECMAScript 6 (2015). If to be executed in an ECMAScript 5 compatible run-time, you´ll need
 [Babel](http://babeljs.io) to compile, or transpile, the source files (in src) to their transformed target files (in dist). For an excellent overview of ES6 see: [https://babeljs.io/docs/learn-es6/](https://babeljs.io/docs/learn-es6/)

### Install

Use npm to install the library.

    npm install remedata

or clone the repository from github. A full copy of the library can be found in the 'dist' sub-directory in the root of the project.

### Building from source

After obtaining the sources from github, all dependencies can be installed with npm. Execute in the root directory:

    npm install

Remedata uses [Gulp](http://gulpjs.com/) as its task runner and to control the build work-flow. Gulp needs to be installed globally with npm.

    npm install -g gulp

After this, the sources can be build with a single command:

    gulp 

### Tutorial

Let´s take a look at how to create a mock web service with Remedata in more detail. In the following examples we presume that we load the library like this:
 
    var mdata = require('remedata'); // or ..
    import * as mdata from 'remedata'; // ES6

Above you´ll see both the "normal" way in which to import a Node.js module and below that how to do it with ES 6. From here on we´ll
use version agnostic examples (i.e. they can be run both with ES 5 as well as ES 6).

First of all, we need to define the JSON "database" or "table" which will be used to store / read the data. We denote the path
of the json file and declare the name of the property which will carry the key in the table.

    var db = remedata.jsondb("data/_data.json", {key: "id"});

#### GET
It is easy to define a default GET handler which will retrieve data from given the db:

    app.get('/men/*', remedata.handleGET(db));

That´s it. Any petition to url '/men/' will automatically send data from the file back to the sender of the GET request. There are two possible requests:

 - If the url refers to a plural or collection, i.e. 'path/', the content of whole JSON file, which should be an array, is returned
 - If the url refers to an id, i.e. 'path/id', a single item with the given id is returned

In case the GET response needs to be customized *after* db retrieval but *before* the beginning of the server response, a function callback can be passed to the handlerGET method:  

    app.get('/hombres/*', remedata.handleGET(db,function(err, data, req, res){

      // modify data here, and send it with the normal Express API
      res.json(data);
    }));

The callback will be passed the following parameters:
 - err: Error in case of an exception
 - data: contains the content of the specific resource

In case of the GET handler, the return value of the handler has no effect on the further processing of the request.

#### PUT

In order to be able to create a writable service, you can define the default PUT handle, allowing data to be written. A json object needs to be send in the PUT payload (body) with content-type 'application/json'.

    app.put('/men/*', remedata.handlePUT(db));

The url needs to contain a an id, i.e. 'path/id'. Existing items are over-written and new ones inserted as new.

Like the GET handler, it is possible to define a custom PUT function callback. The difference with the GET handler is that the PUT callback  called *before* db write. And where the GET callback´s return value is irrelevant, the PUT callback MUST return modified data as the function result. If not, it would not be useful to define the handler anyway.

    app.put('/hombres/*', remedata.handlePUT(db,function(data, req, res){

      // modify the data here 
      return data; // this data is written to the database

    }));

#### POST

The POST handler is similar to the PUT handler:

    app.post('/men/*', remedata.handlePOST(db));

Like the PUT handler with callback which is called *before* db write. Rules for return value of the handle are like those for the PUT handler.

    app.post('/hombres/*', remedata.handlePOST(db,function(data, req, res){

      // modify the data here 
      return data; // this data is written to the database

    }));

Although a write operation akin to PUT, the semantics of POST differ. The url must represent a plural or collection (i.e. 'path/').
The request can represent:

 - An array send in the body of the request will replace (overwrite) the existing table.
 - An item send with an id will insert/replace an item. 

#### DELETE

To define the default DELETE handler use: 

    app.delete('/men/*', remedata.handleDELETE(db));

This wll delete an item with given id in url, i.e. 'path/id'. 

Like POST and PUT, you can specify a custom handler which is called *before* db write. In this case the rReturn value is the actual id of the item to be deleted, but for the remainder  the rules for return value of the handle are like those for the PUT handler.

app.delete('/hombres/*', remedata.handleDELETE(db,function(id, req, res){
   // return a custom id
   return (id + 1);
}));

As well as interacting with given db, req and res objects, it is easy to implement complex database like operations through the JsonDb class as well as the ES 5 and ES 6 Array functions like map, filter, etc.

### The source

Check out the [Docco generated source file](http://soyrochus.github.com/remedata/)

### License

> BSD License

> For Remedata software

> Copyright (c) 2012-2015, Iwan van der Kleijn
> All rights reserved.

> Redistribution and use in source and binary forms, with or without modification,
> are permitted provided that the following conditions are met:

>  * Redistributions of source code must retain the above copyright notice, this
>    list of conditions and the following disclaimer.

>  * Redistributions in binary form must reproduce the above copyright notice,
>    this list of conditions and the following disclaimer in the documentation
>    and/or other materials provided with the distribution.

>  * Neither the name of the author nor the names of its contributors may be used to
>    endorse or promote products derived from this software without specific
>    prior written permission.

> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
> ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
> WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
> DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIaABLE FOR
> ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
> (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
> ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
> (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
> SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
