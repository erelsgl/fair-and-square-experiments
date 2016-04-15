/**
 * A Mocha unit-test for Compensation Procedure.
 * 
 * @author Erel Segal-Halevi
 * @since 2016-03
 */

var should = require('should');
var CP = require("../compensation");


for (var algorithm in CP.ALGORITHM) {
(function(algorithm) {
    var cp = new CP(CP.ALGORITHM.EQUAL_DISCOUNT, /* verify no envy = */true, /* verify no deficit = */true);
    
    describe('Compensation Procedure - algorithm '+algorithm+' - 1 agent', function() {
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

    describe('Compensation Procedure - algorithm '+algorithm+' - 2 agents', function() {
        it('zero values', function() {
            var bids = [[0,0],[0,0]];
            cp.compute(bids, 0).should.eql([[0,0,0],[1,1,0]])
        })
        it('identical values', function() {
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

    describe('Compensation Procedure - algorithm '+algorithm+' - 4 agents', function() {
        it('all identical', function() {
            var bids = [[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70]];
            cp.compute(bids, 0).should.eql([[0,3,-70],[1,2,-30],[2,1,40],[3,0,60]])
        })
        it('1 different, 3 identical', function() {
            var bids = [[-10,-30,30,10],[60,40,-30,-70],[60,40,-30,-70],[60,40,-30,-70]];
            var allocations = cp.compute(bids, 0);
            
            // allocations should be the same regardless of algorithm:
            allocations[0][1].should.eql(3);
            allocations[1][1].should.eql(2);
            allocations[2][1].should.eql(1);
            allocations[3][1].should.eql(0);
            
            allocations[0][2].should.be.below(allocations[1][2])
            allocations[1][2].should.be.below(0)
            Number(0).should.be.below(allocations[2][2])
            allocations[2][2].should.be.below(allocations[3][2])
        })
        it.skip('positive cost', function() {
        })
    })
    
    describe('Inheritance Compensation Procedure - algorithm '+algorithm+' - 1 agent', function() {
        it('two different values', function() {
            var bids = [[120,140]];
            cp.computeInheritance(bids, 0).should.eql({0:[[0,1,-100, 260]],1:[[0,0,-100, 260]]})
        })
    })
    
    describe('Inheritance Compensation Procedure - algorithm '+algorithm+' - 2 agents', function() {
        it('Both agents think that the apartments are identical', function() {
            var bids = [[70,70,70],[130,130,130]];
            cp.computeInheritance(bids, 0).should.eql({0:[[0,1,-50,105],[1,2,-50,195]],1:[[0,0,-50,105],[1,2,-50,195]],2:[[0,0,-50,105],[1,1,-50,195]]})
        })
        it('Both agents think that the apartments are different in the same ratios', function() {
            var bids = [[100,110,120],[200,220,240]];
            cp.computeInheritance(bids, 0).should.eql({ '0': [ [ 0, 2, -45, 165 ], [ 1, 1, -55, 330 ] ],
              '1': [ [ 0, 2, -40, 164 ], [ 1, 0, -58.182, 328 ] ],
              '2': [ [ 0, 1, -45, 164 ], [ 1, 0, -53.333, 328 ] ] })
        })
    })

})(algorithm)
} // end for algorithm

