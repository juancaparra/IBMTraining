'use strict';

var winston = require('winston');
var path = require('path');
var url= require('url');

var env=dev;

var configPath = './config/' + env + '/config.json';

var config=require(configPath);


console.log('The port var ' + config.port);

require('http').createServer(function(req,res){
  
       req.on('data',function(chunk){        
        
        var pathname=url.parse(req.url).pathname;        

        var pathArray=pathname.split('/');
        var serviceName=pathArray[1];
        var countryCode=pathArray[2].length === 2?pathArray[2]:config.countrycode;
        var logVar=pathArray[3];
        var logLevel=logVar==='audit'?'debug':logVar;
       
         var mkdirp = require('mkdirp');
         
          mkdirp(config.home, function (err) {
             if (err){
                console.error(err);
                return;
        }
       });


        var logDir = path.join(config.home,serviceName,countryCode);
        
       
      
        mkdirp(logDir, function (err) {
             if (err){
                console.error(err);
                return;
        }
       });

       var tsFormat = (new Date()).toLocaleTimeString();

        var logger = new (winston.Logger)({
          transports: [
            // colorize the output to the console
            new (winston.transports.Console)({
              timestamp: tsFormat,
              colorize: true,
              level: 'info'
            }),

            new (require('winston-daily-rotate-file'))({
              filename: path.join(logDir,'-'+logVar+'.log'),
              timestamp: tsFormat,
              datePattern: 'yyyy-MM-dd',
              prepend: true,
              level: logLevel})
          ]
        });  

        if(logLevel==='error'){
              logger.error(chunk.toString('utf-8'));
        }else if(logLevel==='debug'){
           logger.debug(chunk.toString('utf-8'));
         }
	});

  req.on('end',function(){
  	res.writeHead(200);
  	res.end();
      });

}).listen(config.port);
console.log('info','log server starts at port ' + config.port);
