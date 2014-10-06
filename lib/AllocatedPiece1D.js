/**
 * A piece allocated on a 1-dimensional cake.
 * @author Erel Segal-Halevi
 * @since 2014-08
 */
var floatindex = require("./floatindex");


/**
 *  Initialize a 1-dimensional allocated piece based on a value function.
 *  @param valueFunction a ValueFunction1D.
 *  @param from (float) start of allocation.
 *  @param to (float) end of allocation.
 */
var AllocatedPiece1D = function(valueFunction,from,to) {
	if (isNaN(from)) throw new Error("from is NaN")
	if (isNaN(to)) throw new Error("to is NaN")
	if (!from) from = 0;
	if (!to) to = valueFunction.values.length;

	this.valueFunction = valueFunction;
	this.from = from;
	this.to = to;
}


/*** factory methods ****/

AllocatedPiece1D.fromValueFunction = function(valueFunction) {
	return new AllocatedPiece1D(valueFunction, 0, valueFunction.values.length);
}

AllocatedPiece1D.fromValueFunctionAndBounds = function(valueFunction,from,to) {
	return new AllocatedPiece1D(valueFunction, from, to);
}



/*** query methods ****/

/**
 * Cut query.
 * @param value what the piece value should be.
 * @return where the piece should end.
 */
AllocatedPiece1D.prototype.getCut = function(value) {
	return this.valueFunction.getCut(this.from, value);
}

AllocatedPiece1D.prototype.getValue = function() {
	return this.valueFunction.getValue(this.from, this.to);
}

AllocatedPiece1D.prototype.getValueOfOther = function(other) {
	return this.valueFunction.getValue(other.from, other.to);
}

AllocatedPiece1D.prototype.getRelativeValue = function() {
	return this.valueFunction.getRelativeValue(this.from, this.to);
}

module.exports = AllocatedPiece1D;

