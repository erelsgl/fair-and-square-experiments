/**
 * a unit-test for ValueFunction1D
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var should = require('should');
var ValueFunction1D = require("../lib/ValueFunction1D");

describe('ValueFunction1D', function() {
	var vf = ValueFunction1D.fromValues([0,1,0,2,0,3,0]);
	it('calculates cut location', function() {
		vf.getCutLocation(3).should.equal(4);
	})
	it('calculates value function for sub-cake', function() {
		vf.getValueOfCurrentPiece().should.equal(6);
		vf.getValueFunctionForSubCake(2,5).getValueOfCurrentPiece().should.equal(2);
		vf.getValueFunctionForSubCake(2,5).getValueOfEntireCake().should.equal(6);
	})
})


