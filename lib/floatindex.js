/**
 * Utilities for handling numeric arrays with non-integer indices.
 * The arrays represent piecewise-constant functions.
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */


module.exports = {
		
	/**
	 * Given from and to, calculate sum
	 * @param values an array of values, representing a piecewise-constant function.
	 * @param from a float index.
	 * @param to a float index.
	 * @return the sum of the array between the indices.
	 * 
	 */
	sum: function(values, from, to) {
		if (from<0||from>values.length) 	throw new Error("from out of range: "+from)
		if (to<0||to>values.length) 	throw new Error("to out of range: "+to)
		if (to<=from)
			return 0;  // special case not covered by loop below
		
		var fromFloor = Math.floor(from);
		var fromFraction = (fromFloor+1-from);
		var toCeiling = Math.ceil(to);
		var toCeilingRemovedFraction = (toCeiling-to);

		var sum = 0;
		sum += (values[fromFloor]*fromFraction);
		for (var i=fromFloor+1; i<=toCeiling-1; ++i)
			sum += (values[i]);
		sum -= (values[toCeiling-1]*toCeilingRemovedFraction);

		return sum;
	},

	/**
	 * Given from and sum, calculate to
	 * @param values an array of non-negative values, representing a piecewise-constant function.
	 * @param from a float index.
	 * @param sum the required sum.
	 * @return the final index "to", such that sum(values,from,to)=sum
	 * 
	 */
	invSum: function(values, from, sum) {
		if (from<0||from>values.length) 	throw new Error("from out of range: "+from)
		if (sum<0) throw new Error("sum out of range (should be positive): "+sum);

		var fromFloor = Math.floor(from);
		var fromFraction = (fromFloor+1-from);

		var value = values[fromFloor];
		if (value*fromFraction>=sum)
			return from + (sum/value);
		sum -= (value*fromFraction);
		for (var i=fromFloor+1; i<values.length; ++i) {
			value = values[i];
			if (sum<=value)
				return i + (sum/value);
			sum -= value;
		}
		
		// default: returns the largest possible "to":
		return values.length;
	}
}

