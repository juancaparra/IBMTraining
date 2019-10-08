'use strict';
//Un gran desarrollo conlleva un gran soporte
var winston = require('winston');
var path = require('path');
var url= require('url');
var mkdirp = require('mkdirp');
var configPath = './config/config.json';
var config=require(configPath);
//No tocar el desarrollo
var logDire = path.join(config.home,"Server");
        mkdirp(logDire, function (err) {
             if (err){
                console.error(err);
                return;
			}});
require('http').createServer(function(req,res){ 
       req.on('data',function(chunk){                
        var pathname=url.parse(req.url).pathname;        
        var pathArray=pathname.split('/');
        var serviceName=pathArray[1];
        var logVar=pathArray[3];
        var logLevel=logVar==='audit'?'info':logVar;
        var logDir = path.join(config.home,serviceName);
		mkdirp(logDir, function (err) {
			if (err){
                console.error(err);
                return;
			}});
        var logger = new (winston.Logger)({
          transports: [
              new (winston.transports.Console)({
              timestamp: true,
              colorize: true,
              level: 'info',
			  handleExceptions: true,
			  humanReadableUnhandledException: true
            }),
            new (require('winston-daily-rotate-file'))({
              filename: path.join(logDir,'-'+logLevel+'.log'),
			  prepend: true,
			  level: logLevel,
              timestamp: true,
              datePattern: 'yyyy-MM-dd',
			  maxsize: '100000000',
			 //prettyPrint: true,
			  handleExceptions: true,
			  humanReadableUnhandledException: true
			  })
			],
		  exceptionHandlers: [
			new (winston.transports.File)({ filename: path.join(logDire,'exceptionsP.log'),
				handleExceptions: true,
				humanReadableUnhandledException: true})
			],
		exitOnError: false
			});  
		switch(logLevel){
			case 'error':
				logger.error(chunk.toString('utf-8'));
				logger.clear();
				break;				
			case 'info':
				logger.info(chunk.toString('utf-8'));
				logger.clear();
				break;			
			case 'debug':
				logger.debug(chunk.toString('utf-8'));
				logger.clear();
				break;				
			default:
				logger.info(chunk.toString('utf-8'));
				logger.clear();
		}		
		process.on('uncaughtException', function (err) {
			console.log("Im on fire");
			logger.warn('uncaughtException', { message : err.message, stack : err.stack });
			process.exit(1);
		});
		pathArray=null;
		logDir=null;
		logLevel=null;
		logVar=null;
		serviceName=null;
		pathname=null;
		chunk=null;
		logger=null;
	   });			
    req.on('end',function(){
  	res.writeHead(200);
  	res.end();
      });  
}).listen(config.port);
console.log('info','log server starts at port ' + config.port);
console.log("Im on fire");
