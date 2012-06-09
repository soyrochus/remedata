remedata
========

## Easy Express (Node.js) middle-ware to provide json web-services with mock data-access

##### v 0.2 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)

> Fair License (Fair)
> Copyright (c) 2012 Iwan van der Kleijn

> Usage of the works is permitted provided that this instrument is retained with the works, 
> so that any entity that uses the works is notified of this instrument.

> DISCLAIMER: THE WORKS ARE WITHOUT WARRANTY.

#### Introduction

The basic usage of remedata is to create custom Express routing handlers which allow the automatic loading of one 
or more files, which then can be treated, though CRUD operations, as in-memory tables and consequentively saved back to
disk. 
 
In the following examples we presume 
 
     var mdata = require('remedata');
     
Two basic forms are supported: 

     app.get('/test/readuser1', mdata.toread('./json/test1.json'));

'toread' returns a ready made routing handler which reads the specified filed (s) and returns them as the service response.
     
     app.get('/test/readuser2', mdata.toread('./json/test1.json', 
         function(data, req, res){
    
            var result = mycomplexfunction(data, req.query['parameterx']);
            return result;
     }));
  
'toread' with a callback allows for the manipulation of the data to be returned to the client. Remedata supports a small but complete
set of operations to manipulate, sort and filter the data-sets. Sort and filter are compatible with the ExtJS Grid.   

     app.post('/test/writeuser1', mdata.towrite('./json/test2.json'));
  
For POST, PUT and DELETE 'towrite' can be used. On its basic form it writes the data send in the request body to the specified file  
 
     app.post('/test/writeuser2', mdata.towrite('./json/test2.json', 
           function(data, newdata, save, req, res){
       
           var record = mdata.insert(newdata, data);
           save(data);
           return record;
     }));

#### The source

Check out the [Docco generated source file]()

