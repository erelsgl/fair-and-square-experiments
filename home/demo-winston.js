/*** Demo from winston: ***/
var winston = require('winston');
require('winston-memory').Memory;

var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function() {
        return Date.now();
      },
      formatter: function(options) {
        // Return string will be passed to logger.
        return options.timestamp() +' '+ options.level.toUpperCase() +' '+ (undefined !== options.message ? options.message : '') +
          (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
      }
    })
  ]
});

logger.info('More Data to log.');

var logger2 = new (winston.Logger)({
  transports: [
    new (winston.transports.Memory)({
      formatter: function(options) {
        return "msg: "+options.message
      }
    })
  ]
});
logger2.info('Data to log.');
logger2.info('More Data to log.');

console.log(logger2.transports['memory'].writeOutput);
