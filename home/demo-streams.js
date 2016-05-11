/*** Demo from memory-streams: ***/
var streams = require('memory-streams');

// Write method
var writer = new streams.WritableStream();
writer.write('Hello World\n');

// Output the content as a string
console.log(writer.toString()); // Outputs: "Hello World\n"


/*** Demo from bunyan: ***/
var bunyan = require('bunyan');
var writer2 = new streams.WritableStream();
var log = bunyan.createLogger({
    name: 'mydemo',
    stream: writer2,
    level: 'info'
});
log.info("hi!");
console.dir(writer2.toString()); // Outputs: "hi!\n"
