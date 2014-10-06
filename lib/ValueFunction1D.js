/**
 * A 1-dimensional piecewise-constant value function.
 * @author Erel Segal-Halevi
 * @since 2014-08
 */
var floatindex = require("./floatindex");


/**
 *  Initialize a 1-dimensional value function based on an array of numbers.
 *  @param values the global array of numbers.
 */
var ValueFunction1D = function(values) {
	this.values = values;
	this.cache = {};
}

/*** factory methods ****/

ValueFunction1D.fromValues = function(values) {
	return new ValueFunction1D(values);
}


/*** query methods ****/

/**
 * Cut query.
 * @param from where the piece starts.
 * @param value what the piece value should be.
 * @return where the piece should end.
 */
ValueFunction1D.prototype.getCut = function(from, value) {
	return floatindex.invSum(this.values, from, value);
}

/**
 * Eval query
 * @param from where the piece starts.
 * @param to where the piece ends.
 * @return the piece value.
 */
ValueFunction1D.prototype.getValue = function(from,to) {
	var key = from+"-"+to;
	if (!this.cache[key])
		this.cache[key] = floatindex.sum(this.values, from,to);
	return this.cache[key];
}

ValueFunction1D.prototype.getValueOfEntireCake = function() {
	if (!this.valueOfEntireCake)
		this.valueOfEntireCake = floatindex.sum(this.values, 0, this.values.length);
	return this.valueOfEntireCake;
}

ValueFunction1D.prototype.getRelativeValue = function(from,to) {
	return this.getValue(from,to) / this.getValueOfEntireCake();
}

module.exports = ValueFunction1D;

