/**
 * Select points at random, and calculate the average proportionality level for a given number of agents.
 * 
 * @author Erel Segal-Halevi
 * @since 2014-01
 */
//var seed = require('seed-random');
//seed('a', {global: true});//over-ride global Math.random
var X_RANGE = Y_RANGE = 400;

var xminWall = 0;//-Infinity; //
var xmaxWall = X_RANGE; //Infinity; // 
var yminWall = 0; // -Infinity; // 
var ymaxWall = Y_RANGE; //Infinity; // 

var EXPERIMENTS_PER_CELL=10;
var GRID_SIZE = 1;
var maxAspectRatio = 1;

var jsts = require("../rectangles/jsts-extended");
var randomPoints = require("./random-points");
var _ = require("underscore");
require("./percent")
var atoll = require("atoll");
var fs = require('fs');

jsts.algorithm.FIND_DIVISION_WITH_LARGEST_MIN_VALUE = true;
jsts.algorithm.ALLOW_SINGLE_VALUE_FUNCTION = true;

var envelopeByOpenSides = [];
envelopeByOpenSides[4] = new jsts.geom.Envelope(-Infinity,Infinity, -Infinity,Infinity);
envelopeByOpenSides[3] = new jsts.geom.Envelope(-Infinity,Infinity, 0,Infinity);
envelopeByOpenSides[2] = new jsts.geom.Envelope(0,Infinity, 0,Infinity);
envelopeByOpenSides[1] = new jsts.geom.Envelope(0,X_RANGE, 0,Infinity);
envelopeByOpenSides[0] = new jsts.geom.Envelope(0,X_RANGE, 0,Y_RANGE);

var colors = ['red','green','blue','yellow','black','cyan','purple','pink','grey','white'];

var resultsFileName = "results/prop.dat";
var resultsFile = fs.createWriteStream(resultsFileName);

//console.log("open\tagents\tpoints\tmin\tmed\tavg\tmax");
for (var AGENT_COUNT=2; AGENT_COUNT<=10; ++AGENT_COUNT) {
	for (var POINT_COUNT=31; POINT_COUNT<=31; POINT_COUNT+=2) {
		var valuePerAgent = POINT_COUNT-1;  // each point is slightly less than 1 unit value; so 2 points are needed to get 1 unit value.
		for (var iExperiment=0; iExperiment<EXPERIMENTS_PER_CELL; ++iExperiment) {
			var agentsValuePoints = [];
			for (var iAgent=0; iAgent<AGENT_COUNT; ++iAgent) {
				var points = randomPoints(POINT_COUNT,  X_RANGE, Y_RANGE, GRID_SIZE);
				points.color = colors[iAgent%colors.length];
				agentsValuePoints.push(points);
			}
			var minValues = [];
			for (var OPENSIDES=4; OPENSIDES>=1; --OPENSIDES) {
				var envelope = envelopeByOpenSides[OPENSIDES];
				var normalizedAlgorithm = jsts.algorithm.mapOpenSidesToNormalizedAlgorithm[OPENSIDES];
				var landplots = jsts.algorithm.runDivisionAlgorithm(
						normalizedAlgorithm, jsts.Side.South,
						valuePerAgent, agentsValuePoints, envelope, maxAspectRatio);
				if (!landplots.minValuePerAgent && valuePerAgent>=2*AGENT_COUNT-1) {
					console.error(AGENT_COUNT+" agents, "+valuePerAgent+" valuePerAgent");
					console.error(jsts.algorithm.agentsValuePointsToString(agentsValuePoints));
					console.dir(landplots);
					throw new Error("Partial-proportional division not found!");
				}
				var minValue = landplots.minValuePerAgent||0;
				minValues.push(minValue);
				if ((minValues.length==2 || minValues.length==3) && minValue>minValues[minValues.length-2]) {
					console.error((minValues.length-1)+" walls better than "+(minValues.length-2)+"?!");
					console.error(jsts.algorithm.agentsValuePointsToString(agentsValuePoints));
					console.dir(minValues);
					console.dir(landplots);
				}
			} // end of for (var OPENSIDES
			
			if (_.min(minValues)>0) {
				var inverseProportionality = minValues.map(function(minValue) {
					return valuePerAgent/minValue-OPENSIDES/10;
				});
				var data = AGENT_COUNT+"\t"+inverseProportionality.reverse().join("\t");
				console.log(data);
				resultsFile.write(data+"\n");
			}

//			var data = 
//				OPENSIDES+"\t"+
//				AGENT_COUNT+"\t"+
//				POINT_COUNT+"\t"+
//				Math.round(atoll.min(inverseProportionality))+"\t"+
//				Math.round(atoll.median(inverseProportionality))+"\t"+
//				Math.round(atoll.mean(inverseProportionality))+"\t"+
//				Math.round(atoll.max(inverseProportionality))

//			console.log(data);
		}
	}
}

//resultsFile.close();
