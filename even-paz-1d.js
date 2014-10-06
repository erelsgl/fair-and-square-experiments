var ValueFunction1D = require("./lib/ValueFunction1D")
  , AllocatedPiece1D = require("./lib/AllocatedPiece1D")
  , inputvalues = require("./lib/inputvalues")
  , evenpaz1d = require("./lib/evenpaz1d")
  , cakepartitions = require("./lib/cakepartitions")
  , _ = require("underscore")
  , fs = require("fs")
  , rungnuplot = require('./lib/rungnuplot')
  ;

//var NOISE_PROPORTIONS = [0,0.25,0.5,1];
//var AGENT_NUMS = [2,4,16,256,1024];
var NOISE_PROPORTIONS = _.range(0.05, 1, 0.05);
//var AGENT_NUMS = [128,512,2048];
var AGENT_NUMS = [1024];
var EXPERIMENTS_PER_CELL = 10;

var LAND_SIZE = 1000;
var VALUE_PER_CELL = 100;
var FILENAME = "data/npv_4q.1d.json";
//var meanValues = Array.apply(null, new Array(LAND_SIZE)).map(Number.prototype.valueOf,VALUE_PER_CELL);
var meanValues = inputvalues.valuesFromFile(FILENAME);
console.log("cells in land: "+meanValues.length);

for (var iAgentNum in AGENT_NUMS) {
	var numOfAgents = AGENT_NUMS[iAgentNum];
	var resultsFileName = "results-evenpaz/agents"+numOfAgents+".dat";
	var resultsFile = fs.createWriteStream(resultsFileName);
	var identicalValueFunctions = inputvalues.noisyValuesArray(meanValues, 0, null, numOfAgents).map(ValueFunction1D.fromValues);
	var identicalPartition = evenpaz1d(identicalValueFunctions);
	for (var iNoise in NOISE_PROPORTIONS) {
		var noiseProportion = NOISE_PROPORTIONS[iNoise];
		for (var iExperiment=0; iExperiment<EXPERIMENTS_PER_CELL; ++iExperiment) {
			var valueFunctions = inputvalues.noisyValuesArray(meanValues, noiseProportion, null, numOfAgents).map(ValueFunction1D.fromValues);
			var partition = evenpaz1d(valueFunctions);
			var egalitarianGain = cakepartitions.normalizedEgalitarianValue(partition)-1;
			if (egalitarianGain<-0.001) throw new Error("In proportional division, normalized egalitarian gain must be at least 0; got "+egalitarianGain);
			var utilitarianGain = cakepartitions.utilitarianValue(partition)-1;
			if (utilitarianGain<-0.001) throw new Error("In proportional division, utilitarian gain must be at least 0; got "+utilitarianGain);
			var largestEnvy = cakepartitions.largestEnvy(partition);

			
			var identicalPartitionWithDifferentAgents = _.zip(valueFunctions,identicalPartition).map(function(pair) {
				return new AllocatedPiece1D(pair[0], pair[1].from, pair[1].to);
			});
			var egalitarianGainIPWDA = cakepartitions.normalizedEgalitarianValue(identicalPartitionWithDifferentAgents)-1;
			var utilitarianGainIPWDA = cakepartitions.utilitarianValue(identicalPartitionWithDifferentAgents)-1;
			var largestEnvyIPWDA = cakepartitions.largestEnvy(identicalPartitionWithDifferentAgents);

			var data = numOfAgents+"\t"+noiseProportion+"\t"+
				egalitarianGain+"\t"+utilitarianGain+"\t"+largestEnvy+"\t"+
				egalitarianGainIPWDA+"\t"+utilitarianGainIPWDA+"\t"+largestEnvyIPWDA;
			//console.log(data);
			resultsFile.write(data+"\n");
		}
	}
	resultsFile.end();
	rungnuplot("even-paz-1d.gnuplot", "filename='"+resultsFileName+"'", /*dry-run=*/true);
}

//rungnuplot("even-paz-1d.gnuplot", "filename='results-evenpaz/agents64.dat'");

