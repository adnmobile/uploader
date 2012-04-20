#!/usr/bin/env node

var http = require('http');
var fs = require('fs');
var formidable = require('formidable');

//Configuration
var dataFolder = 'data/';
var tmpFolder = 'tmp/';
var rootHttp = 'http://localhost/data/'

http.createServer(function (req, res) {
  if(req.method === 'OPTIONS') {
    res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
    res.end();
  }
  else if(req.method === 'POST') {
    var form = new formidable.IncomingForm();
    //~ form.encoding = 'utf-8';
    form.uploadDir = tmpFolder;
    form.on('file', function(key, file) {

      var folderId = Math.random();
      var fileId = key.split('/')[0];
      var fileName = encodeURIComponent(key.split('/')[1]);

      var folderPath = dataFolder + folderId;
      var filePath = folderPath + '/' + fileName;

      fs.mkdir(folderPath, 0755, function(err) {
        if (err) {
          if (err.code !== 'EEXIST')
            return console.log(err);

          end();
        }
        else {
          end();
        }
      });

      function end() {
        fs.rename(file.path, filePath, function(err) {
          if(err)
            return console.log(err);

          var answer = {
            file: fileId,
            src: rootHttp + folderId + '/' + fileName
          }
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'text/plain'
          });
          res.end(JSON.stringify(answer));
        });
      };
    });
    form.parse(req);
  }
}).listen(9090);
