/**
 * Implementation of the Even-Paz proportional cake-cutting algorithm on a 1-dimensional cake.
 */

var AllocatedPiece1D = require("./AllocatedPiece1D");
/**
 * @param valueFunctions - value functions on the same cake.
 * @return the same value functions, such that each value function is on a distinct part of the cake.
 */
module.exports = function proportionalDivisionEvenPaz(valueFunctions) {
	var initialAllocations = valueFunctions.map(AllocatedPiece1D.fromValueFunction); // initially allocate the entire cake to all agents
	return proportionalDivisionEvenPazRecursive(initialAllocations);
}

function proportionalDivisionEvenPazRecursive(allocations) {
	var numOfAgents = allocations.length;
	if (numOfAgents==1)
		return allocations;  // allocate the entire cake to the single agent.
	var numOfAgentsInFirstPartition = (numOfAgents%2==0? numOfAgents/2: (numOfAgents+1)/2);
	var proportionOfFirstPartition = numOfAgentsInFirstPartition / numOfAgents;
	allocations.forEach(function(vf){
		vf.halfCut = vf.getCut(proportionOfFirstPartition*vf.getValue());
	});
	allocations.sort(function(a,b){return a.halfCut-b.halfCut;});
	var endOfFirstPart = allocations[numOfAgentsInFirstPartition-1].halfCut;
	var startOfSecondPart = allocations[numOfAgentsInFirstPartition].halfCut;
	var cutLocation = (endOfFirstPart+startOfSecondPart)/2;
	if (isNaN(cutLocation))
		throw new Error("cutLocation is NaN")
	
	var firstPartAllocations = [], secondPartAllocations = [];
	for (var i=0; i<numOfAgentsInFirstPartition; ++i) 
		firstPartAllocations.push (new AllocatedPiece1D(allocations[i].valueFunction, allocations[i].from, cutLocation));
	for (var i=numOfAgentsInFirstPartition; i<numOfAgents; ++i)
		secondPartAllocations.push(new AllocatedPiece1D(allocations[i].valueFunction, cutLocation,   allocations[i].to));
	return proportionalDivisionEvenPazRecursive(firstPartAllocations).concat(proportionalDivisionEvenPazRecursive(secondPartAllocations));
}
