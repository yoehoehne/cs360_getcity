var fs = require('fs');
var http = require('http');
var url = require('url');
var MongoClient = require('mongodb').MongoClient;
var ROOT_DIR = "html";

http.createServer(function (req, res) {
    var urlObj = url.parse(req.url, true, false);
    if(urlObj.pathname == "/comment")
    {
	if(req.method === "GET")
	{
		var allComments = getAllComments(res);
	}
	else
	{
		var jsonData = ""
		req.on('data', function(chunk){
			jsonData += chunk;	
		});
		req.on('end', function(){
			var reqObj = JSON.parse(jsonData);
        		console.log(reqObj);
        		console.log("Name: "+reqObj.Name);
        		console.log("Comment: "+reqObj.Comment);
			addToMongo(reqObj);
			res.writeHead(200);
			res.end();
		});
	}
    }
    else if (urlObj.pathname.indexOf("getcity") == -1) {
        var file = ROOT_DIR + urlObj.pathname;
        if (file == "html/") {
            file = ROOT_DIR + "/index.html"
        }
        fs.readFile(file, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
            }
            res.writeHead(200);
            res.end(data);
        });
    }
    else {
        fs.readFile(ROOT_DIR + "/cities.dat.txt", function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }

            var result = findMatches(urlObj.query.q, data);

            res.writeHead(200);
            res.end(JSON.stringify(result));
        });
    }
}).listen(80);


var getAllComments = function(res)
{
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        if(err) throw err;
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
              	console.log(itemArr);
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
            console.log("Record added as "+records[0]._id);
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
