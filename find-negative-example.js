/**
 * Select points at random, and calculate the size of the maximum disjoint set of squares touching them.
 * 
 * @author Erel Segal-Halevi
 * @since 2014-01
 */

//require('look').start();
//console.log("click any key to start experiments");
//var fs = require( "fs" );
//var fd = fs.openSync( "/dev/stdin", "rs" );
//fs.readSync( fd, new Buffer( 1 ), 0, 1 );
//fs.closeSync( fd );
//console.log("starting experiments");

var X_RANGE = Y_RANGE = 400;
var jsts = require("../computational-geometry/lib");
require("../rectangles/jsts-extended/half-proportional-division-staircase");

var factory = new jsts.geom.GeometryFactory();
var pointsToString = require("./points-to-string");

var _ = require("underscore");
_.mixin(require("../rectangles/jsts-extended/rainbow"));

jsts.algorithm.FIND_DIVISION_WITH_LARGEST_MIN_VALUE = false;

var envelope = new jsts.geom.Envelope(
		-Infinity, // 0,//
		Infinity,  // X_RANGE, //
		0, //
		Infinity); // Y_RANGE);  // 

var EXPERIMENT_COUNT=1000000;

var POINT_COUNT=10;
var KNOWN_SQUARE_COUNT=6;  // alert if found less than that number

var ROTATED=0;

var PRESET_POINTS = 
	[
//	 {x:-5,y:1},
//	 {x:155,y:1},
//	 {x:195,y:1},
//	 {x:205,y:1},
//	 {x:245,y:1},
//	 {x:405,y:1},
	 ];
var POINT_COUNT_AT_LEFT_WALL=0;  // points for which x=1.
var POINT_COUNT_AT_BOTTOM_WALL=0;  // points for which y=1
var FORCE_X_ABOVE_Y=false;

var GRID_SIZE = 1;

var USE_FAIR_DIVISION_ALGORITHM = 1;  // If 0: use only the maximum-disjoint-set algorithm (about 30 times slower)


function randomPointSnappedToGrid(maxVal, gridSize) {
	return 	Math.floor(Math.random()*maxVal/gridSize)*gridSize;
}

function randomPoints(count, xmax, ymax, gridSize) {
	var points = PRESET_POINTS.slice(0);
	for (var i=PRESET_POINTS.length; i<count; ++i) {
		var y = POINT_COUNT_AT_LEFT_WALL<=i&&i<POINT_COUNT_AT_LEFT_WALL+POINT_COUNT_AT_BOTTOM_WALL? 1: randomPointSnappedToGrid(ymax, gridSize);
		var x;
		if (i<POINT_COUNT_AT_LEFT_WALL) 
			x=1;
		else if (FORCE_X_ABOVE_Y)
			x=y+randomPointSnappedToGrid(xmax-y, gridSize);
		else
			x=randomPointSnappedToGrid(xmax, gridSize);
		points.push({x:x,y:y});
	}
	points.sort(function(a,b){return a.x-b.x});
	return points;
}


var start=new Date();
var proportionalCount = 0;
for (var e=0; e<EXPERIMENT_COUNT; ++e) {
	var points = randomPoints(POINT_COUNT,  X_RANGE, Y_RANGE, GRID_SIZE);

	if (USE_FAIR_DIVISION_ALGORITHM) {
		var numOfAgents = KNOWN_SQUARE_COUNT;
		var agentsValuePoints = _.rainbowDuplicate(points, numOfAgents);
		var disjointset = jsts.algorithm.halfProportionalDivision(agentsValuePoints, envelope);
	} else {  // use maximum-disjoint-set algorithm
		var candidates = ROTATED? 
				factory.createRotatedSquaresTouchingPoints(points, envelope): 
				factory.createSquaresTouchingPoints(points, envelope);
		var disjointset = jsts.algorithm.maximumDisjointSet(candidates);
	}
	if (disjointset.length >= points.length-1) 
		proportionalCount++;
	else {
		if (disjointset.length < KNOWN_SQUARE_COUNT) {
			console.log(points.length+" points, "+disjointset.length+" squares, points=");
			console.log("\t "+pointsToString(points,"green"));
		}
	}
	

}
var elapsed=new Date()-start;
var elapsedMean = Math.round(elapsed/EXPERIMENT_COUNT);

console.log(EXPERIMENT_COUNT+" experiments. "+proportionalCount+" proportional ("+(100.0*proportionalCount/EXPERIMENT_COUNT)+"%). "+elapsed+" total time [ms].")
