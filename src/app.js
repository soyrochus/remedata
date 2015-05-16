import express from 'express';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
//import * as remedata from './remedata';

debugger;

const app = express();
app.use(bodyParser.json()); // for parsing application/json
//app.use(cors());

const _DATA_ = "./data/";

let fname = function(req){
  return _DATA_ + req.url.replace(/\//gi,'_') + ".json"; 
};


// respond with data stored or Resource not Found
app.get('/*', function(req, res) {
  debugger;
  console.log(req.route);
  fs.readFile(fname(req), {encoding: 'utf-8'} ,function(err, data){
    if(err){
      res.status(404).send("Not found");
    } else{
      res.json(JSON.parse(data));
    }
  });
});

let server = app.listen(3000, function () {

  let host = server.address().address;
  let port = server.address().port;

  console.log('Remedata listening at http://%s:%s', host, port);

});
