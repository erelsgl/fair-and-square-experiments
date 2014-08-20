/**
 * a unit-test for ValueFunction1D
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var should = require('should');
var floatindex = require("../floatindex");

describe('floatindex.sum', function() {
	var values = [1,2,3,4];
	it('works with whole indices', function() {
		floatindex.sum(values, 0, 4).should.equal(10);
		floatindex.sum(values, 1, 4).should.equal(9);
		floatindex.sum(values, 0, 3).should.equal(6);
		floatindex.sum(values, 1, 3).should.equal(5);
	})
	it('works with fractional indices', function() {
		floatindex.sum(values, 0, 3.5).should.equal(8);
		floatindex.sum(values, 0.5, 4).should.equal(9.5);
		floatindex.sum(values, 0.5, 3.5).should.equal(7.5);
		floatindex.sum(values, 1.5, 4).should.equal(8);
		floatindex.sum(values, 1.5, 3.5).should.equal(6);
	})
	it('works with fractional indices of same index', function() {
		floatindex.sum(values, 3.25, 3.75).should.equal(2);
	})
	it('works with from>=to', function() {
		floatindex.sum(values, 0, 0).should.equal(0);
		floatindex.sum(values, 3.5, 3).should.equal(0);
		floatindex.sum(values, 3.5, 3.5).should.equal(0);
	})
})

describe('floatindex.invSum', function() {
	var values = [1,2,3,4];
	it('works with whole indices', function() {
		floatindex.invSum(values, 0, 0).should.equal(0);
		floatindex.invSum(values, 0, 1).should.equal(1);
		floatindex.invSum(values, 0, 6).should.equal(3);
		floatindex.invSum(values, 0, 10).should.equal(4);
		floatindex.invSum(values, 0, 100).should.equal(4);  // max value

		floatindex.invSum(values, 1, 0).should.equal(1);  
		floatindex.invSum(values, 1, 2).should.equal(2);  
		floatindex.invSum(values, 1, 5).should.equal(3);  
		floatindex.invSum(values, 1, 9).should.equal(4);  
		floatindex.invSum(values, 1, 10).should.equal(4);  // max value
	})

	it('works with fractional from', function() {
		floatindex.invSum(values, 1.5, 0).should.equal(1.5);
		floatindex.invSum(values, 1.5, 1).should.equal(2);
		floatindex.invSum(values, 1.5, 4).should.equal(3);
		floatindex.invSum(values, 1.5, 8).should.equal(4);
		floatindex.invSum(values, 1.5, 9).should.equal(4);
	})

	it('works with fractional to', function() {
		floatindex.invSum(values, 1.5, 6).should.equal(3.5);
		floatindex.invSum(values, 1.5, 2.5).should.equal(2.5);
		floatindex.invSum(values, 1.5, 0.5).should.equal(1.75);
	})
})


