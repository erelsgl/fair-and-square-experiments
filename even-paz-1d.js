var ValueFunction1D = require("./lib/ValueFunction1D");
var inputvalues = require("./lib/inputvalues");
var evenpaz1d = require("./lib/evenpaz1d");

var filename = "data/npv_4q.1d.json";
var noiseProportion = 2
var numOfAgents = 2;
//var values = inputvalues.noisyValuesArray(inputvalues.valuesFromFile(filename), noiseProportion, numOfAgents);
var values = inputvalues.noisyValuesArray([1,2,3,4], noiseProportion, numOfAgents, numOfAgents);
var valueFunctions = values.map(ValueFunction1D.fromValues);

console.dir(evenpaz1d(valueFunctions));

