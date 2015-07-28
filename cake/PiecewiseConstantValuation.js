/**
 * Defines a piecewise-constant valuation on a 1-dimensional interval.
 * 
 * @note Currently only piecewise-uniform valuations are supported (all pieces have the same value).
 * full piecewise-constant support is kept for future work.
 *
 * @author Erel Segal-Halevi
 * @since 2015-28-07
 */

/**
 * @param valuablePieces an array with elements of the form {from:..., to:...}
 */
function PiecewiseConstantValuation(valuablePieces) {
	this.valuablePieces = valuablePieces;
	this.totalValue = this.valueToLeftOf(Infinity);
	//alert(this.totalValue)
}


/**
 * draw the creams on the given SVG paper
 */
PiecewiseConstantValuation.prototype.draw = function(paper,x,y,style) {
	this.valuablePieces.forEach(function(cream){
		paper.line(x+cream.from, y, x+cream.to, y).stroke(style);
	})
}

/**
 * @return the value to the left of cut-point x
 */
PiecewiseConstantValuation.prototype.valueToLeftOf = function(x) { 
	return this.valuablePieces.reduce(function(prev, cream) {
		if (x>cream.to)
			return prev + (cream.to-cream.from);
		else if (x>cream.from)
			return prev + (x-cream.from);
		else
			return prev;
	},0);
}


/**
 * @return the value to the right of cut-point x
 */
PiecewiseConstantValuation.prototype.valueToRightOf = function(x) {
	return this.totalValue - this.valueToLeftOf(x);
}


