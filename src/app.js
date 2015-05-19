
import * as corejs from 'core-js';
import express from 'express';
import * as bodyParser from 'body-parser';
import * as remedata from './remedata';

console.log("REMEDATA", remedata);

const app = express();
app.use(bodyParser.json()); // for parsing application/json
//app.use(cors());

let db = remedata.jsondb("data/_data.json", {key: "id"});

app.get('/mannen/*', remedata.handleGET(db));

app.get('/hombres/*', remedata.handleGET(db,function(err, data, req, res){

   res.json(data || "booh");
}));

app.put('/mannen/*', remedata.handlePUT(db));

app.put('/hombres/*', remedata.handlePUT(db,function(data, req, res){
  data.beard = true;
  return data;
}));

app.post('/mannen/*', remedata.handlePOST(db));

app.post('/hombres/*', remedata.handlePOST(db,function(data, req, res){
  data.beard = true;
  return data;
}));

app.delete('/mannen/*', remedata.handleDELETE(db));

app.delete('/hombres/*', remedata.handleDELETE(db,function(id, req, res){
  return (id + 1);
}));


let server = app.listen(3000, function () {

  let host = server.address().address;
  let port = server.address().port;

  console.log('Remedata listening at http://%s:%s', host, port);

});
