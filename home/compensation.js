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
   , PaymentCalculator = require("./payments")
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

    // 1. Calculate a maxsum (utilitarian) allocation:
    this.allocation = this.munkres.compute(Munkres.make_cost_matrix(bids));
    this.itemByAgent = Array(this.itemCount);
    this.agentByItem = Array(this.itemCount);
    this.allocation.forEach(function(assignment) {
        var agent = assignment[0];
        var item  = assignment[1];
        this.itemByAgent[agent] = item;
        this.agentByItem[item] = agent;
    },this)

    // 1b. Calculate initial payments by bids:
    this.paymentCalculator = new PaymentCalculator(this.itemByAgent, this.agentByItem, bids);
    //console.log("paymentByItem:",this.paymentCalculator.paymentByItem)
    for (var agent=0; agent<this.itemCount; ++agent) {
        var item = this.itemByAgent[agent]
        var payment = bids[agent][item];
        this.paymentCalculator.incPaymentOfAgent(agent, payment)
    }
    //console.log("paymentByItem:",this.paymentCalculator.paymentByItem)

    for (var iteration=1; iteration<this.itemCount; ++iteration) {
        this._calculateEnvy();       //  2. Calculate this.envies matrix and this.hasEnvy flag.
        if (!this.hasEnvy)
            break;
        this._compensateEnviousAgents();  // 3.
    } // 4. Loop; at most n-1 iterations will be needed.
    
    if (this.hasEnvy) {
        console.dir(this.envies);
        throw new Error("Envy detected after compensation!");
    }
    
    var surplus = this.paymentCalculator.totalPayment - totalCost;
    if (isNaN(surplus))
        throw Error("surplus is NaN");

    if (surplus<0) {
        throw new Error("Deficit! Surplus after compensations = "+surplus);
    }
    
    //this.paymentCalculator.divideSurplusEqually(surplus);  // 5. Divide the remaining surplus equally among all agents (page 737).
    this.paymentCalculator.divideSurplusByVector(this._averageDiscount(surplus)); // 5. Divide the remaining surplus equally among all agents (page 740).
    
    if (this.hasEnvy) {
        console.dir(this.envies);
        throw new Error("Envy detected after compensation!");
    }
   
    // Add final prices:
    //console.dir(this.paymentByAgent)
    this.allocation.forEach(function(assignment,agent) {
        assignment.push(this.paymentCalculator.paymentOfAgent(agent))
    }, this)
    
    return this.allocation;
}

CP.prototype._calculateEnvy = function() {
    this.hasEnvy = false;
    this.envies = Array(this.itemCount);
    for (var agent=0; agent<this.itemCount; ++agent) { // loop on all agents
        var myItem = this.itemByAgent[agent];
        var myNetValue = this.paymentCalculator.netValue(agent, myItem);
        var myEnvies = Array(this.itemCount);
        for (var otherAgent=0; otherAgent<this.itemCount; ++otherAgent) 
            myEnvies[otherAgent] = this.paymentCalculator.envy(agent,otherAgent);
        var myMostEnviedAgent = _.argmax(myEnvies); // the other agent that this agent envies the most
        var myMaxEnvy = myEnvies[myMostEnviedAgent];
        if (myMaxEnvy>0)
            this.hasEnvy = true;
        this.envies[agent] = {
            envies: myEnvies, 
            mostEnviedAgent: myMostEnviedAgent,
            maxEnvy: myEnvies[myMostEnviedAgent]
        };
    }
    //console.log('\nenvies');     console.dir(this.envies);
}


/**
 * Calculate the compensation that should be given to an envious agent.
 */ 
CP.prototype._compensationToAgent = function(agent) {
    var myEnvy = this.envies[agent];
    if (myEnvy.maxEnvy <= 0)  // this agent is not envious
        return 0;
    if (this.envies[myEnvy.mostEnviedAgent].maxEnvy > 0)  // this agent envies an envious agent
        return 0;
    return myEnvy.maxEnvy;
}

CP.prototype._compensateEnviousAgents = function() {
    for (var agent=0; agent<this.itemCount; ++agent) {
        var discount = this._compensationToAgent(agent);
        if (isNaN(discount))
            throw Error("discount is NaN for agent "+agent)
        this.paymentCalculator.incPaymentOfAgent(agent,-discount);
        // NOTE: This does NOT update the "envies" matrix; 
        //     it is updated only after all agents in this round are compensated.
    }
}

/**
 * Private method: divide the remaining surplus in the "average discount" method (page 740).
 */
CP.prototype._averageDiscount = function(surplus) {
    // Create an array filled with zeros: http://stackoverflow.com/a/13735425/827927
    var averageDiscount = Array.apply(null, Array(this.itemCount)).map(Number.prototype.valueOf,0);
    for (var favoredAgent=0; favoredAgent<this.itemCount; ++favoredAgent) {
        var biasedDiscount = this._biasedDiscount(surplus, favoredAgent);
        console.log("biasedDiscount[",favoredAgent,"]:",biasedDiscount)
        for (var agent=0; agent<averageDiscount.length; ++agent)
            averageDiscount[agent] += (biasedDiscount[agent] / this.itemCount);
    }
    console.log("averageDiscount:",averageDiscount)
    return averageDiscount;
}

/**
 * Private method: calculate a division of the remaining surplus in a way that favors one agent over the rest.
 * See algorithm in page 740.
 */ 
CP.prototype._biasedDiscount = function(surplus, favoredAgent) {
    // Create an array filled with zeros: http://stackoverflow.com/a/13735425/827927
    var discounts = Array.apply(null, Array(this.itemCount)).map(Number.prototype.valueOf,0);
    var biasedPaymentCalculator = this.paymentCalculator.clone();

    // Define a partition of the agents to two groups:
    //  those that have to be discounted together ("positive", D)
    //  and those that do not ("negative", I\D).
    var agentPartition = new Bipartition(this.itemCount);  // initially all are "negative".

    // Step (i):   set D = {i}
    agentPartition.setPositive(favoredAgent);
   
    for (var iteration=1; iteration<this.itemCount; ++iteration) {
       
        // Step (ii):  find agents that almost-envy agents in D:
        var changed = true;
        var minDiscountPossibleWithoutEnvy = Infinity;
        while (changed) {
            changed = false;
            for (negativeAgent in agentPartition.negatives()) {
                for (positiveAgent in agentPartition.positives()) {
                    var envyOfNegativeInPositive = biasedPaymentCalculator.envy(negativeAgent,positiveAgent);
                    if (envyOfNegativeInPositive >= 0) {  // it should be == 0 by now.
                        agentPartition.setPositive(negativeAgent);
                        changed = true;
                    } else {
                        if (-envyOfNegativeInPositive < minDiscountPossibleWithoutEnvy)
                            minDiscountPossibleWithoutEnvy = -envyOfNegativeInPositive;
                    }
                }
            }
        }

        if (agentPartition.allPositive()) { // divide the remaining surplus equally:
            biasedPaymentCalculator.divideSurplusEqually(surplus);
            break;  // end inner loop
        } else {
            for (positiveAgent in agentPartition.positives()) {
                biasedPaymentCalculator.incPaymentOfAgent(positiveAgent, -minDiscountPossibleWithoutEnvy);
                surplus -= minDiscountPossibleWithoutEnvy;
            }
        }
    } // loop; at most n-1 iterations needed
    return biasedPaymentCalculator.paymentsOfAgents();
}

/* This just re-creates the equal division method */
CP.prototype._biasedDiscountStub = function(surplus, favoredAgent) {
    var discounts = Array.apply(null, Array(this.itemCount)).map(Number.prototype.valueOf,0);
    for (var agent=0; agent<this.itemCount; ++agent)
        discounts[agent] =  Math.floor(surplus/this.itemCount);
    return discounts;
}


// ---------------------------------------------------------------------------
// Auxiliary class - bipartition of the set of numbers from 0 to n-1
//                   to two subsets - "positive" and "negative".
//                   Initially all are negative.
// ---------------------------------------------------------------------------
function Bipartition(n) {
    this.positive = {};
    this.negative = {};
    for (var i=0; i<n; ++i) 
        this.negative[i] = true;
}

Bipartition.prototype.setPositive = function(i)  {
    this.positive[i] = true;
    delete this.negative[i];
}

Bipartition.prototype.setNegative = function(i)  {
    delete this.positive[i];
    this.negative[i] = true;
}

Bipartition.prototype.positives = function()  {
    return this.positive;
}

Bipartition.prototype.negatives = function()  {
    return this.negative;
}

Bipartition.prototype.allPositive = function() {
    return Object.keys(this.negative).length === 0;
}

Bipartition.prototype.allNegative = function() {
    return Object.keys(this.positive).length === 0;
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
