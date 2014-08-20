/**
 * a unit-test for ValueFunction1D
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var should = require('should');
var ValueFunction1D = require("../lib/ValueFunction1D");
var evenpaz1d = require("../lib/evenpaz1d");
var cakepartitions = require("../lib/cakepartitions");

describe('Even-Paz Algorithm', function() {
	var vf1 = ValueFunction1D.fromValues([1,2,3,4]);
	var vf2 = ValueFunction1D.fromValues([4,3,2,1]);
	it('works for 2 agents', function() {
		var partition = evenpaz1d([vf1,vf2]);
		partition[0].to.should.equal(2);
		partition[1].from.should.equal(2);
		partition[0].getValueOfCurrentPiece().should.be.above(5);
		cakepartitions.egalitarianValue(partition).should.be.above(0.5);
		cakepartitions.normalizedEgalitarianValue(partition).should.be.above(1);
		cakepartitions.utilitarianValue(partition).should.be.above(1);
	})
})


