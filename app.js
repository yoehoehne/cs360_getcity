var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var cors = require('cors');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var basicAuth = require('basic-auth-connect');
var app = express();


app.use(bodyParser.json());
app.use(cors());

var options = {
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(80);
  https.createServer(options, app).listen(443);
  app.get('/', function (req, res) {
    res.send("Get Index");
  });

 app.use('/', express.static('./html', {maxAge: 60*60*1000}));
 
 app.get('/getcity', function (req, res) {
 	fs.readFile("html/cities.dat.txt", function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
	    var urlObj = getURLObj(req);
            var result = findMatches(urlObj.query.q, data);

            res.writeHead(200);
            res.end(JSON.stringify(result));
        });	   
  });



 app.get('/comment', function (req, res) {
	getAllComments(res);	 
  });


var auth = basicAuth(function(user, pass){
	return ((user ==='cs360')&&(pass==='test'));
});
  
 app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    var jsonData = ""
                req.on('data', function(chunk){
                        jsonData += chunk;
                });
                req.on('end', function(){
                        var reqObj = JSON.parse(jsonData);
                        addToMongo(reqObj);
                        res.writeHead(200);
                        res.end();
                });
  });



var getAllComments = function(res)
{
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
                res.writeHead(200, {"Content-Type": "application/json"});
                res.end(JSON.stringify(itemArr));

            });
          });
        });
      });
}

var addToMongo = function(reqObj)
{
        MongoClient.connect("mongodb://localhost/weather", function(err, db) {
         	 if(err) throw err;
          	 db.collection('comments').insert(reqObj,function(err, records) {
	       		if(err) throw err;
		
         	 });
        });
}

var findMatches = function(query, data)
{
    var cities = data.toString().split("\n");
    var result = [];
    var pattern = new RegExp("^" + query, "i");

    for (var i = 0; i < cities.length; i++)
    {
        var city = cities[i];
        if (pattern.test(city)) {
            var obj = {}
            obj.city = city;
            result.push(obj)
        }
    };

    return result;
}

var getURLObj = function(req)
{
	var urlObj = url.parse(req.url, true, false);
	return urlObj;
}



 
