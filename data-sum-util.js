// A utility to convert a given file to a JSON file with sums of rows.

var input = "data/npv_4q.asc";
var output = "data/npv_4q.1d.json";

var fs = require('fs')
var liner = require('./liner')
var source = fs.createReadStream(input)
var sums = [];
source.pipe(liner)
liner.on('readable', function () {
     var line
     while (line = liner.read()) {
    	 if (/^[a-z]/i.test(line))
        	  continue;
         var values = line.split(" ").
         	map(function(x){return parseInt(x)}).
         	filter(function(x) { return !isNaN(x)});
         //console.dir(values)
         var sum = values.reduce( function(sum,x){
        	  return x>0? sum+x: sum} ,0 )
          sums.push(sum)
     }
})
liner.on('end', function() {
	fs.writeFile(output, JSON.stringify(sums));
})
