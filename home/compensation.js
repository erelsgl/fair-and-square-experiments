/**
 * Implementation of the Compensation Procedure,
 *   for fair division of indivisible items and money,
 *   by Haake, Raith and Su (2002).
 * 
 * @author Erel Segal-Halevi
 * @since 2016-03
 */
 

var Munkres = require("munkres-js")  // for calculating maxsum allocations
   , _ = require("underscore")
   ;
_.mixin(require("argminmax"));  

var CP = module.exports = function() {
    this.munkres = new Munkres.Munkres();  // for calculating maxsum allocations
}

/**
 * Verify that the bids of all agents are sufficiently high to cover the total cost.
 * 
 * @param bids - a matrix (array of arrays). 
 *        Each row represents the bids of a single agent for all items.
 *        The sum of each row must at least equal the totalCost.
 *
 * @throw Error if the number of bids of some agent is not identical to the number of items.
 * @throw Error if the bids of some agent sum up to less than totalCost.
 */ 
CP.verifyBids = function(bids, totalCost) {
    var itemCount = bids.length;  // item count is supposed to be equal to the number of agents.
    for (var i=0; i<bids.length; ++i) {
        var bid = bids[i];
        if (bid.length!=itemCount)
            throw new Error("Agent "+i+" has invalid number of bids: there are "+bid.length+" bids but the total number of items is "+itemCount);
        sum = bid.reduce(function(memo, num){ return memo + num; }, 0);
        if (sum<totalCost)
            throw new Error("The bids of agent "+i+" are too low! the sum is "+sum+" but should be at least "+totalCost);
    }
}

/**
 * @param bids - a matrix (array of arrays). 
 *        Each row represents the bids of a single agent for all items.
 *        The sum of each row must at least equal the totalCost.
 * @return the assignments and payments (array of arrays).
 *        Each row is a triple [agent_index, item_index, payment] for a single agent.
 * 
 * @see Haake, Raith and Su (2002), page 729.
 */ 
CP.prototype.compute = function(bids, totalCost) {
    if (!totalCost)
        totalCost = 0;

    // 0. Verify that the bids of all agents are sufficiently high to cover the total cost.
    CP.verifyBids(bids, totalCost);  

    this.bids = bids;
    this.itemCount = bids.length; // item count is supposed to be equal to the number of agents.

    // 1. Calculate a maxsum (utilitarian) allocation and initial payments
    this.allocation = this.munkres.compute(Munkres.make_cost_matrix(bids)); 
    this._calculatePaymentsFromBids();   // calculate ex-ante payments: this.paymentByAgent, this.paymentByItem and this.totalCost
    this.totalPayment -= totalCost;
    
    for (var iteration=1; iteration<this.itemCount; ++iteration) {
        this._calculateNetValues();  // 2. this.netValues ("assessment") matrix.
        this._calculateEnvy();       //    this.envies matrix and this.hasEnvy flag.
        if (!this.hasEnvy)
            break;
        this._compensateEnviousAgents();  // 3.
    } // 4. Loop; at most n-1 iterations will be needed.
    
    if (this.hasEnvy) {
        console.dir(this.envies);
        throw new Error("Envy detected!");
    }
    
    if (this.totalPayment<0) {
        throw new Error("Deficit! Total payment after compensations = "+this.totalPayment);
    }
    
    //console.dir(this.paymentByAgent)
    this._divideSurplusEqually(this.totalPayment);  // 5. Divide the remaining surplus equally among all agents:
    
    // Add final prices:
    //console.dir(this.paymentByAgent)
    this.allocation.forEach(function(assignment,agent) {
        assignment.push(this.paymentByAgent[agent])
    }, this)
    
    return this.allocation;
}

/**
 * Private method: calculate this.paymentByAgent, this.paymentByItem and this.totalCost
 *     by having each agent pay its bid.
 */ 
CP.prototype._calculatePaymentsFromBids = function() {
    this.paymentByAgent = Array(this.itemCount)
    this.paymentByItem = Array(this.itemCount)
    this.totalPayment = 0
    this.allocation.forEach(function(assignment) {
        var agent = assignment[0];
        var item  = assignment[1];
        var payment = this.bids[agent][item];
        this.totalPayment += payment
        this.paymentByAgent[agent] = payment;
        this.paymentByItem[item]   = payment;
    }, this)
    
    //console.log('paymentByAgent', this.paymentByAgent)
    //console.log('paymentByItem', this.paymentByItem)
}

/**
 * Private method: calculate the "assessments" of the agents -
 *    the net valuation of each agent to each item (bid minus item-price).
 */ 
CP.prototype._calculateNetValues = function() {
    this.netValues = this.bids.map(function(grossValues) { // loop on all agents
        return grossValues.map(function(grossValue,item) {     // loop on all items
            return grossValue - this.paymentByItem[item];
        }, this)
    }, this)
    //console.log('netValues\n'+ Munkres.format_matrix(this.netValues))
}

CP.prototype._calculateEnvy = function() {
    this.hasEnvy = false;
    this.envies = this.netValues.map(function(netValues, agent) { // loop on all agents
        var myItem = this.allocation[agent][1];
        var myNetValue = netValues[myItem];
        var myEnvies = Array(this.itemCount);
        for (var otherAgent=0; otherAgent<this.itemCount; ++otherAgent) { // loop on all other agents
            var otherItem = this.allocation[otherAgent][1];
            var myNetValueToOtherItem = netValues[otherItem];
            myEnvies[otherAgent] = myNetValueToOtherItem - myNetValue;
        }
        var myMostEnviedAgent = _.argmax(myEnvies); // the other agent that this agent envies the most
        var myMaxEnvy = myEnvies[myMostEnviedAgent];
        if (myMaxEnvy>0)
            this.hasEnvy = true;
        return {
            envies: myEnvies, 
            mostEnviedAgent: myMostEnviedAgent,
            maxEnvy: myEnvies[myMostEnviedAgent] };
    }, this)
    //console.log('\nenvies');     console.dir(this.envies);
}

CP.prototype._compensateEnviousAgents = function() {
    for (var agent=0; agent<this.itemCount; ++agent) {
        var myEnvy = this.envies[agent];
        if (myEnvy.maxEnvy <= 0)  // this agent is not envious
            continue;
        if (this.envies[myEnvy.mostEnviedAgent].maxEnvy > 0)  // this agent envies an envious agent
            continue;
            
        // Compensate this agent by giving a discount on his allocated item:
        var compensation = myEnvy.maxEnvy;
        var myItem = this.allocation[agent][1];
        this.paymentByItem[myItem] -= compensation;
        this.paymentByAgent[agent] -= compensation;
        this.totalPayment -= compensation;
    }
}

CP.prototype._divideSurplusEqually = function(surplus) {
    var surplusPerAgent = Math.floor(surplus/this.itemCount);
    for (var agent=0; agent<this.itemCount; ++agent) {
        var myItem = this.allocation[agent][1];
        this.paymentByItem[myItem] -= surplusPerAgent;
        this.paymentByAgent[agent] -= surplusPerAgent;
        this.totalPayment -= surplusPerAgent;
    }
}


// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

if (typeof require != 'undefined' &&
    typeof module != 'undefined' &&
    require.main == module) {

    var cp = new CP();
    var bids = [
    [20,-10,-10],
    [10,0,-10],
    [0,10,-10]
    ];
    console.log("bids: ");  console.dir(bids);
    var allocation = cp.compute(bids, /*cost=*/0);
    console.log("allocation: ");  console.dir(allocation);
}
