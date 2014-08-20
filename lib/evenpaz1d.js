/**
 * Implementation of the Even-Paz proportional cake-cutting algorithm on a 1-dimensional cake.
 */


/**
 * @param valueFunctions - value functions on the same cake.
 * @return the same value functions, such that each value function is on a distinct part of the cake.
 */
module.exports = function proportionalDivisionEvenPaz(valueFunctions) {
	var numOfAgents = valueFunctions.length;
	if (numOfAgents==1)
		return valueFunctions;  // give the entire cake to the single agent.
	var numOfAgentsInFirstPartition = (numOfAgents%2==0? numOfAgents/2: (numOfAgents+1)/2);
	var proportionOfFirstPartition = numOfAgentsInFirstPartition / numOfAgents;
	valueFunctions.forEach(function(vf){
		vf.halfCut = vf.getCutLocation(proportionOfFirstPartition*vf.getValueOfCurrentPiece());
	});
	valueFunctions.sort(function(a,b){return a.halfCut-b.halfCut;});
	var endOfFirstPart = valueFunctions[numOfAgentsInFirstPartition-1].halfCut;
	var startOfSecondPart = valueFunctions[numOfAgentsInFirstPartition].halfCut;
	var cutLocation = (endOfFirstPart+startOfSecondPart)/2;
	
	var firstPartAgents = [], secondPartAgents = [];
	for (var i=0; i<numOfAgentsInFirstPartition; ++i)
		firstPartAgents.push(valueFunctions[i].getValueFunctionForSubCake(valueFunctions[i].from,cutLocation));
	for (var i=numOfAgentsInFirstPartition; i<numOfAgents; ++i)
		secondPartAgents.push(valueFunctions[i].getValueFunctionForSubCake(cutLocation,valueFunctions[i].to));
	
	return proportionalDivisionEvenPaz(firstPartAgents).concat(proportionalDivisionEvenPaz(secondPartAgents));
}
