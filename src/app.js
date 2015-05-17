
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

app.get('/men/*', remedata.handleGET(db,function(err, data, req, res){
  res.json(data);
}));

app.put('/mannen/*', remedata.handlePUT(db));

app.put('/men/*', remedata.handlePUT(db,function(err, req, res){
  res.json(err);
}));

app.post('/mannen/*', remedata.handlePOST(db));

app.post('/men/*', remedata.handlePOST(db,function(err, req, res){
  res.json(err);
}));


app.delete('/mannen/*', remedata.handleDELETE(db));

app.delete('/men/*', remedata.handleDELETE(db,function(err, req, res){
  res.json(err);
}));

// respond with data stored or Resource not Found
/*app.get('/*', function(req, res) {
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
*/
let server = app.listen(3000, function () {

  let host = server.address().address;
  let port = server.address().port;

  console.log('Remedata listening at http://%s:%s', host, port);

});
