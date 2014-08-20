/**
 * A 1-dimensional piecewise-constant value function.
 * @author Erel Segal-Halevi
 * @since 2014-08
 */
var floatindex = require("./floatindex");


/**
 *  Initialize a 1-dimensional value function based on an array of numbers.
 *  @param values the global array of numbers.
 *  @param from (float) start of actual value function.
 *  @param to (float) end of actual value function.
 */
var ValueFunction1D = function(values,from,to) {
	if (!from) from = 0;
	if (!to) to = values.length;
	if (isNaN(from)) throw new Error("from is NaN")
	if (isNaN(to)) throw new Error("to is NaN")
	
	this.values = values;
	this.from = from;
	this.to = to;
}


/*** factory methods ****/

ValueFunction1D.fromValues = function(values) {
	return new ValueFunction1D(values, 0, values.length);
}

ValueFunction1D.fromValuesAndBounds = function(values,from,to) {
	return new ValueFunction1D(values, from, to);
}



/*** query methods ****/

/**
 * @param proportion a number in [0,1]
 * @return a real number indicating where should we cut the cake such that the proportion in the left side will be "proportion".
 */
ValueFunction1D.prototype.getCutLocation = function(value) {
	return floatindex.invSum(this.values, this.from, value);
}

ValueFunction1D.prototype.getValueFunctionForSubCake = function(cutFrom,cutTo) {
	return ValueFunction1D.fromValuesAndBounds(this.values, cutFrom, cutTo);
}

ValueFunction1D.prototype.getValueOfPiece = function(cutFrom,cutTo) {
	return floatindex.sum(this.values, cutFrom,cutTo);
}

ValueFunction1D.prototype.getValueOfCurrentPiece = function() {
	if (!this.valueOfCurrentPiece)
		this.valueOfCurrentPiece = floatindex.sum(this.values, this.from, this.to);
	return this.valueOfCurrentPiece;
}

ValueFunction1D.prototype.getRelativeValueOfCurrentPiece = function() {
	return this.getValueOfCurrentPiece() / this.getValueOfEntireCake();
}

ValueFunction1D.prototype.getValueOfEntireCake = function() {
	if (!this.valueOfEntireCake)
		this.valueOfEntireCake = floatindex.sum(this.values, 0, this.values.length);
	return this.valueOfEntireCake;
}

module.exports = ValueFunction1D;

