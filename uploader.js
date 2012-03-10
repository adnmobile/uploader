#!/usr/bin/env node

var exec = require('child_process').exec;
var http = require('http');
var fs = require('fs');
var formidable = require('formidable');
var mime = require('mime');




http.createServer(function (req, res) {
	if(req.method === 'OPTIONS') {
		res.writeHead(200, {'Access-Control-Allow-Origin': '*'});
		res.end();
	}
	else if(req.method === 'POST') {
    var form = new formidable.IncomingForm();
		form.encoding = 'utf-8';
		form.uploadDir = '/home/plugsbee/upload/tmp';
    form.on('file', function(name, file) {
			var folder = '/home/plugsbee/media/'+name.split('/')[1];
			var path = folder+'/'+file.name;
			var split = file.name.split('.');
			var thumbname = '/min_'+split[split.length-2]+'.png';
			//FIXME use regex
			//~ console.log(split[split.length-2]);
			//~ console.log(split);
			var thumb = folder+thumbname;
			
			fs.stat(folder, function (err) {
				if (err) {
					fs.mkdir(folder, 0755, function(err) {
						if(err)
							throw err;
            else
              rename();
					});
				}
        else
          rename();
			});
      function rename() {
        fs.rename(file.path, path, function(err) {
          if(err) {
            console.log(err);
            return;
          }
          
          var type = mime.lookup(path);
          var prefix = type.split('/')[0];

          if((prefix === 'image')||(type === 'application/pdf')) {
            exec("convert '"+path+"\[0\]' -thumbnail 128x128\\> '"+thumb+"'", function (err, stdout, stderr) {
              if(err) {
                console.log(err);
                return
              }
              var answer = {
                src: 'http://media.plugsbee.com'+'/'+name.split('/')[1]+'/'+file.name,
                thumbnail: 'http://media.plugsbee.com'+'/'+name.split('/')[1]+thumbname,
              }	
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/plain'
              });
              res.end(JSON.stringify(answer));
            });
          }
          else if(prefix === 'video') {
            exec("ffmpegthumbnailer -i '"+path+"' -o '"+thumb+"' -s 128", function(err, stdout, stderr) {
              if(err) {
                console.log(err);
                return;
              }
              var answer = {
                src: 'http://media.plugsbee.com'+'/'+name.split('/')[1]+'/'+file.name,
                thumbnail: 'http://media.plugsbee.com'+'/'+name.split('/')[1]+thumbname,
              }	
              res.writeHead(200, {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'text/plain'
              });
              res.end(JSON.stringify(answer));
            });  
          }
          else {
            var answer = {
              src: 'http://media.plugsbee.com'+'/'+name.split('/')[1]+'/'+file.name,
            }	
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'text/plain'
            });
            res.end(JSON.stringify(answer));
          }
        });
      };
    });
    form.parse(req);
	}
}).listen(9090);
