/**
 * A Mocha unit-test for Compensation Procedure.
 * 
 * @author Erel Segal-Halevi
 * @since 2016-03
 */

var should = require('should');
var CP = require("../compensation");
var cp = new CP();

describe('Compensation Procedure - 1 agent', function() {
	it('zero value', function() {
        var bids = [[0]];
        cp.compute(bids, 0).should.eql([[0,0,0]])
	})
	it('positive value', function() {
        var bids = [[20]];
        cp.compute(bids, 0).should.eql([[0,0,0]])
	})
	it('negative value', function() {
        var bids = [[-20]];
        (function(){cp.compute(bids, 0)}).should.throw()
	})
	it('too few bids', function() {
        var bids = [[]];
        (function(){cp.compute(bids, 0)}).should.throw()
	})
	it('too many bids', function() {
        var bids = [[0,0]];
        (function(){cp.compute(bids, 0)}).should.throw()
	})
})

describe('Compensation Procedure - 2 agents', function() {
	it('zero values', function() {
        var bids = [[0,0],[0,0]];
        cp.compute(bids, 0).should.eql([[0,0,0],[1,1,0]])
	})
	it.only('identical values', function() {
        var bids = [[20,-20],[20,-20]];
        cp.compute(bids, 0).should.eql([[0,1,-20],[1,0,20]])
	})
	it('different values', function() {
        var bids = [[30,-30],[20,-20]];
        cp.compute(bids, 0).should.eql([[0,0,25],[1,1,-25]])
	})
	it('too few bids', function() {
        var bids = [[0],[0]];
        (function(){cp.compute(bids, 0)}).should.throw()
	})
	it('too many bids', function() {
        var bids = [[0,0,0],[0,0,0]];
        (function(){cp.compute(bids, 0)}).should.throw()
	})
})

describe('Compensation Procedure - 4 agents', function() {
	it('all identical', function() {
        var bids = [[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70]];
        cp.compute(bids, 0).should.eql([[0,3,-70],[1,2,-30],[2,1,40],[3,0,60]])
	})
	it('1 different, 3 identical', function() {
        var bids = [[-10,-30,30,10],[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70]];
        cp.compute(bids, 0).should.eql([[0,3,-55],[1,2,-35],[2,1,35],[3,0,55]])
	})
	it.skip('positive cost', function() {
	})
})

