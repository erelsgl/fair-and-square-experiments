/**
 * A 1-dimensional piecewise-constant value function.
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var ValueFunction1D = function(values) {
	this.values = values;
	this.sum = values.reduce(function(sum,x){return sum+x},0)
}




/*** factory methods ****/

ValueFunction1D.fromValues = function(values) {
	return new ValueFunction1D(values);
}

var valuesFromFile = function(filename) {
	var fs = require('fs')
	return JSON.parse(fs.readFileSync(filename));
}

/**
 * @param meanValues array
 * @param noiseProportion a number in [0,1]
 * @return an array of values of the same size as meanValues; to each value, the function adds a random noise, drawn uniformly from [-noiseRatio,noiseRatio]*value
 */
var noisyValues = function(meanValues, noiseProportion) {
	return meanValues.map(function(x) {
		var noise = (2*Math.random()-1)*noiseProportion;
		return x*(1+noise);
	})
}




/*** query methods ****/

/**
 * @param proportion a number in [0,1]
 * @return a real number indicating where should we cut the cake such that the proportion in the left side will be "proportion".
 */
ValueFunction1D.prototype.getCutLocation = function(proportion) {
	var targetValue = this.sum*proportion;
	for (var i=0; i<this.values.length; ++i) {
		var value = this.values[i];
		if (targetValue>value)
			targetValue -= value;
		else
			return i + (targetValue/value);
	}
}

ValueFunction1D.prototype.valueFunctionForSubCake = function(cutFrom,cutTo) {
	var originalValues = this.values;
	var newValues = [];
	var cutFromFloor = Math.floor(cutFrom);
	var cutToCeiling = Math.ceil(cutTo);
	var cutFromFraction = (cutFromFloor+1-cutFrom);
	var cutToCeilingFraction = (cutTo-cutToCeiling+1);
	newValues.push(originalValues[cutFromFloor]*cutFromFraction);
	for (var i=cutFromFloor+1; i<cutToCeiling-1; ++i) 
		newValues.push(originalValues[i]);
	if (cutToCeiling<originalValues.length)
		newValues.push(originalValues[cutToCeiling]*cutToCeilingFraction);
	return ValueFunction1D.fromValues(newValues);
}


var vf = ValueFunction1D.fromValues(noisyValues(valuesFromFile("data/npv_4q.1d.json"),0.1));
console.dir(vf.values);
console.log(vf.sum);
var halfCut = vf.getCutLocation(0.5);
console.log(halfCut)

vf = vf.valueFunctionForSubCake(halfCut,vf.values.length)
//console.dir(vf.values);
console.log(vf.sum);
console.log(vf.getCutLocation(0.5))

