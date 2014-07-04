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
require("./percent")
var atoll = require("atoll");

jsts.algorithm.FIND_DIVISION_WITH_LARGEST_MIN_VALUE = true;
jsts.algorithm.ALLOW_SINGLE_VALUE_FUNCTION = true;

var envelopeByOpenSides = [];
envelopeByOpenSides[4] = new jsts.geom.Envelope(-Infinity,Infinity, -Infinity,Infinity);
envelopeByOpenSides[3] = new jsts.geom.Envelope(-Infinity,Infinity, 0,Infinity);
envelopeByOpenSides[2] = new jsts.geom.Envelope(0,Infinity, 0,Infinity);
envelopeByOpenSides[1] = new jsts.geom.Envelope(0,X_RANGE, 0,Infinity);
envelopeByOpenSides[0] = new jsts.geom.Envelope(0,X_RANGE, 0,Y_RANGE);

var colors = ['red','green','blue','yellow','black','cyan','purple'];


console.log("open\tagents\tpoints\tmin\tmed\tavg\tmax");
for (var OPENSIDES=3; OPENSIDES<=3; ++OPENSIDES) {
	var envelope = envelopeByOpenSides[OPENSIDES];
	var normalizedAlgorithm = jsts.algorithm.mapOpenSidesToNormalizedAlgorithm[OPENSIDES];
	for (var AGENT_COUNT=2; AGENT_COUNT<=10; ++AGENT_COUNT) {
		for (var POINT_COUNT=2; POINT_COUNT<=30; POINT_COUNT+=2) {
			var valuePerAgent = POINT_COUNT-1;  // each point is slightly less than 1 unit value; so 2 points are needed to get 1 unit value.
			var minValues = [];
			for (var iExperiment=0; iExperiment<EXPERIMENTS_PER_CELL; ++iExperiment) {
				var agentsValuePoints = [];
				for (var iAgent=0; iAgent<AGENT_COUNT; ++iAgent) {
					var points = randomPoints(POINT_COUNT,  X_RANGE, Y_RANGE, GRID_SIZE);
					points.color = colors[iAgent%colors.length];
					agentsValuePoints.push(points);
				}

				var landplots = jsts.algorithm.runDivisionAlgorithm(
						normalizedAlgorithm, jsts.Side.South,
						valuePerAgent, agentsValuePoints, envelope, maxAspectRatio);
				
				if (!landplots.minValuePerAgent && valuePerAgent>=2*AGENT_COUNT-1) {
					console.error(AGENT_COUNT+" agents, "+valuePerAgent+" valuePerAgent");
					console.error(jsts.algorithm.agentsValuePointsToString(agentsValuePoints));
					console.dir(landplots);
					throw new Error("Partial-proportional division not found!");
				}
				minValues.push(landplots.minValuePerAgent? landplots.minValuePerAgent/valuePerAgent: 0);
			} // end of experiments

			//console.dir(minValues)
			var data = 
				OPENSIDES+"\t"+
				AGENT_COUNT+"\t"+
				POINT_COUNT+"\t"+
				Math.percent(atoll.min(minValues))+"\t"+
				Math.percent(atoll.median(minValues))+"\t"+
				Math.percent(atoll.mean(minValues))+"\t"+
				Math.percent(atoll.max(minValues))
				
			console.log(data);
		}
	}
}