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

require("./round10") // define Math.round10

/**
 * Constructor.
 * @algorithm    integer; should be one of the ALGORITHM_* constants below.
 * @verifyNoEnvy boolean. If true, the "compute" function will throw an exception in case of envy (since this is a bug).
 */
var CP = module.exports = function(algorithmVariant, verifyNoEnvy, verifyNoDeficit, 
    logger) {
    this.algorithmVariant = algorithmVariant;
    this.verifyNoEnvy = verifyNoEnvy;
    this.verifyNoDeficit = verifyNoDeficit;
    if (logger) {
        this.logger = logger;
        this.log = true;
    } else {
        this.logger = {  // dummy logger
            info: function() {}
        };
        this.log = false;
    }
    this.munkres = new Munkres.Munkres();  // for calculating maxsum allocations
}

/** Algorithm variants: */
CP.ALGORITHM = {
    EQUAL_DISCOUNT: 1,
    AVERAGE_DISCOUNT: 2,
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
    var agentCount = bids.length;
    var expectedItemCount = agentCount;
    for (var i=0; i<bids.length; ++i) {
        var bid = bids[i];
        if (bid.length!=expectedItemCount)
            throw new Error("Agent "+i+" has invalid number of bids: there are "+bid.length+" bids but the total number of items is "+expectedItemCount);
        sum = bid.reduce(function(memo, num){ return memo + num; }, 0);
        if (sum<totalCost)
            throw new Error("The bids of agent "+i+" are too low! the sum is "+sum+" but should be at least "+totalCost);
    }
}

function defaultAgentNames(count) {
    agentNames = Array(count);
    for (i=0; i<count; ++i)
        agentNames[i] = "אדם "+(i+1);
    return agentNames;
}

function defaultItemNames(count) {
    itemNames = Array(count);
    for (i=0; i<count; ++i)
         itemNames[i] = "דירה "+(i+1);
    return itemNames;
}

/**
 * @param bids - a matrix (array of arrays). 
 *        Each row represents the bids of a single agent for all items.
 *        The sum of each row must at least equal the totalCost.
 *        The number of bids in each row (=houses) must equal the number of rows (=agents).
 * @return the assignments and payments (array of arrays).
 *        Each row is a triple [agent_index, item_index, payment] for a single agent.
 * 
 * @see Haake, Raith and Su (2002).
 */ 
CP.prototype.compute = function(bids, totalCost, agentNames, itemNames) {
    if (!totalCost)
        totalCost = 0;

    // 0. Verify that the bids of all agents are sufficiently high to cover the total cost.
    CP.verifyBids(bids, totalCost);  

    this.bids = bids;
    this.count = bids.length; // item count is supposed to be equal to the number of agents.
    
    if (this.log) {
        this.logger.info(""); // space
        this.agentNames = agentNames? agentNames: defaultAgentNames(this.count);
        this.itemNames = itemNames? itemNames: defaultItemNames(this.count);
    }
    // 1. Calculate a maxsum (utilitarian) allocation:
    this.allocation = this.munkres.compute(Munkres.make_cost_matrix(bids));
    this.itemByAgent = Array(this.count);
    this.agentByItem = Array(this.count);
    this.allocation.forEach(function(assignment) {
        var agent = assignment[0];
        var item  = assignment[1];
        this.itemByAgent[agent] = item;
        this.agentByItem[item] = agent;
    },this)

    // 1b. Calculate initial payments by bids:
    this.paymentCalculator = new PaymentCalculator(this.itemByAgent, this.agentByItem, bids, this.logger);
    
    if (this.log) var allocationString = "";
    if (totalCost >= 0)  {    // agents should pay their bids to cover the total cost:
        for (var agent=0; agent<this.count; ++agent) {
            var item = this.itemByAgent[agent]
            var payment = bids[agent][item];
            this.paymentCalculator.incPaymentOfAgent(agent, payment)
            if (this.log) allocationString += "\t"+this.agentNames[agent]+" מקבל את "+this.itemNames[item]+" ומשלם "+payment+"\n"
        }
    } else {
        for (var agent=0; agent<this.count; ++agent) {
            var item = this.itemByAgent[agent]
            if (this.log) allocationString += "\t"+this.agentNames[agent]+" מקבל את "+this.itemNames[item]+"\n"
        }
    }
    if (this.log) this.logger.info("ההקצאה ההתחלתית היא: "+"\n"+allocationString);

    for (var iteration=1; iteration<=this.count; ++iteration) {
        this._calculateEnvy();       //  2. Calculate this.envies matrix and this.hasEnvy flag.
        if (!this.hasEnvy) {
            if (this.log) this.logger.info("אין קנאה!");
            break;
        }
        this._compensateEnviousAgents();  // 3.
    } // 4. Loop; at most n-1 iterations will be needed.
    
    if (this.verifyNoEnvy && this.hasEnvy) {
        console.dir(this.envies);
        throw new Error("Envy detected after "+this.count+" compensations!");
    }
    
    var surplus = this.paymentCalculator.totalPayment - totalCost;
    if (this.log) this.logger.info("נשאר עודף של "+surplus);

    if (isNaN(surplus))
        throw Error("surplus is NaN");

    if (this.verifyNoDeficit) {
        if (surplus<0) {
            throw Error("Deficit! Surplus after compensations = "+surplus);
        }
    }

    if (this.algorithmVariant == CP.ALGORITHM.EQUAL_DISCOUNT)
        this.paymentCalculator.divideSurplusEqually(surplus);  // 5. Divide the remaining surplus equally among all agents (page 737).
    else if (this.algorithmVariant == CP.ALGORITHM.AVERAGE_DISCOUNT)
        this.paymentCalculator.setPaymentsByVector(this._averagePayment(surplus)); // 5. Divide the remaining surplus equally among all agents (page 740).
    else throw Error("Unknown algorithm variant: "+this.algorithmVariant);

    if (this.verifyNoEnvy) {
        this._calculateEnvy();       //  Validity check
        if (this.hasEnvy) {
            console.dir(this.envies);
            throw Error("Envy detected after surplus division!");
        }
    }

    // Add final prices:
    //console.dir(this.paymentByAgent)
    this.allocation.forEach(function(assignment,agent) {
        assignment.push( this.paymentCalculator.paymentOfAgent(agent) )
    }, this)
    
    return this.allocation;
}



/**
 * Verify bids array for computeInheritance procedure.
 * 
 * @param bids - a matrix (array of arrays). 
 *        Each row represents the bids of a single agent for all items.
 *
 * @throw Error if the number of bids of some agent is not identical to the expected number of items.
 */ 
CP.verifyBidsForInheritance = function(bids) {
    var agentCount = bids.length;
    var expectedItemCount = agentCount+1;
    for (var i=0; i<bids.length; ++i) {
        var bid = bids[i];
        if (bid.length!=expectedItemCount)
            throw new Error("Agent "+i+" has invalid number of bids: there are "+bid.length+" bids but the expected number of items is "+expectedItemCount);
    }
}

var NORMALIZATION = 100;   // normalize wasteItem to that value

CP.prototype.computeInheritanceWithGivenWasteItem = function(bids, wasteItem, agentNames, itemNames) {
    // 0. Verify numbers of bids of all agents:
    CP.verifyBidsForInheritance(bids);
    var agentCount = bids.length;
    var itemCount  = bids[0].length;

    if (!agentNames) agentNames = defaultAgentNames(agentCount);
    if (!itemNames) itemNames = defaultItemNames(itemCount);

    var reducedBids = bids.map(function(agentBids) {
        var agentBidForWasteItem = agentBids[wasteItem];
        var reducedAgentBids = [];
        for (var item=0; item<itemCount; ++item)
            if (item!=wasteItem)
                reducedAgentBids.push(agentBids[item]*NORMALIZATION/agentBidForWasteItem);  // normalize wasteItem to 100
        return reducedAgentBids;
    })
    var roundedReducedBids = reducedBids.map(function(agentBids) {
        var roundedAgentBids = agentBids.map(Math.round);
        return roundedAgentBids;
    })
    var reducedItemNames = [];
    for (var item=0; item<itemCount; ++item)
        if (item!=wasteItem)
            reducedItemNames.push(itemNames[item]);

    if (this.log) this.logger.info("דירת השאריות היא "+itemNames[wasteItem]+".")
    if (this.log) this.logger.info("הערכים המנורמלים הם: "+ JSON.stringify(roundedReducedBids))

    var allocation = this.compute(reducedBids, /*cost=*/-NORMALIZATION, agentNames, reducedItemNames);
    allocation = allocation.map(function(agentAllocation,agentIndex) {
       var agentBids = bids[agentIndex]
       var agentBidForWasteItem = agentBids[wasteItem];
       if (agentAllocation[1] >= wasteItem)
           agentAllocation[1]++;   // because wasteItem was removed
       var agentBidForAgentItem = agentBids[agentAllocation[1]];
       var agentShareInWasteItem = agentAllocation[2];
       var agentNetValue = agentBidForAgentItem - (agentShareInWasteItem/NORMALIZATION*agentBidForWasteItem)
       agentAllocation[2] = Math.round10(agentShareInWasteItem,-3)
       agentAllocation[3] = Math.round(agentNetValue)
       return agentAllocation;
    })
    return allocation;
}

/**
 * @param bids - a matrix (array of arrays). 
 *        Each row represents the bids of a single agent for all items.
 *        The number of bids in each row (=houses) must equal the number of rows (=agents) plus one.
 *
 * Checks all options of assigining the "waste item".
 * 
 * @return a hash: {wasteItem => allocation}.
 */ 
CP.prototype.computeInheritance = function(bids, agentNames, itemNames) {
    // 0. Verify numbers of bids of all agents:
    CP.verifyBidsForInheritance(bids);
    var agentCount = bids.length;
    var itemCount  = bids[0].length;

    if (!agentNames) agentNames = defaultAgentNames(agentCount);
    if (!itemNames) itemNames = defaultItemNames(itemCount);

    var allocations = {};
    for (var wasteItem = 0;  wasteItem < itemCount; wasteItem++) {
        allocations[wasteItem] = this.computeInheritanceWithGivenWasteItem(bids,wasteItem, agentNames, itemNames);
    }
    return allocations;
}

CP.prototype._calculateEnvy = function() {
    this.hasEnvy = false;
    this.envies = Array(this.count);
    for (var agent=0; agent<this.count; ++agent) { // loop on all agents
        var myEnvies = Array(this.count);
        for (var otherAgent=0; otherAgent<this.count; ++otherAgent) 
            myEnvies[otherAgent] = Math.round10(this.paymentCalculator.envy(agent,otherAgent), -3);
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
}


/**
 * Calculate the compensation that should be given to an envious agent.
 */ 
CP.prototype._compensationToAgent = function(agent) {
    var myEnvy = this.envies[agent];
    if (myEnvy.maxEnvy <= 0) { // this agent is not envious
        if (this.log) this.logger.info("\t אדם "+(agent+1)+" לא מקנא, ולכן לא מקבל פיצוי");
        return 0;
    }
    if (this.envies[myEnvy.mostEnviedAgent].maxEnvy > 0) { // this agent envies an envious agent
        if (this.log) this.logger.info("\t אדם "+(agent+1)+"מקנא באדם "+(1+myEnvy.mostEnviedAgent)+" שגם הוא מקנא, ולכן לא מקבל פיצוי בינתיים");
        return 0;
    }
    
    if (this.log) this.logger.info("\t אדם "+(agent+1)+" מקנא באדם "+(1+myEnvy.mostEnviedAgent)+", ולכן מקבל פיצוי "+myEnvy.maxEnvy);
    return myEnvy.maxEnvy;
}

CP.prototype._compensateEnviousAgents = function() {
    for (var agent=0; agent<this.count; ++agent) {
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
CP.prototype._averagePayment = function(surplus) {
    // Create an array filled with zeros: http://stackoverflow.com/a/13735425/827927
    var averagePayment = Array.apply(null, Array(this.count)).map(Number.prototype.valueOf,0);
    for (var favoredAgent=0; favoredAgent<this.count; ++favoredAgent) {
        var biasedPayment = this._biasedPayment(surplus, favoredAgent);
        //console.log("biasedPayment[",favoredAgent,"]:",biasedPayment)
        for (var agent=0; agent<averagePayment.length; ++agent)
            averagePayment[agent] += (biasedPayment[agent] / this.count);
    }
    //console.log("averagePayment:",averagePayment)
    return averagePayment;
}

/**
 * Private method: calculate a division of the remaining surplus in a way that favors one agent over the rest.
 * See algorithm in page 740.
 */ 
CP.prototype._biasedPayment = function(surplus, favoredAgent) {
    // Create an array filled with zeros: http://stackoverflow.com/a/13735425/827927
    var biasedPaymentCalculator = this.paymentCalculator.clone();

    // Define a partition of the agents to two groups:
    //  those that have to be discounted together ("positive", D)
    //  and those that do not ("negative", I\D).
    var agentPartition = new Bipartition(this.count);  // initially all are "negative".

    // Step (i):   set D = {i}
    agentPartition.setPositive(favoredAgent);
    for (var iteration=1; iteration<=this.count; ++iteration) {

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

        //console.dir(agentPartition)
        if (agentPartition.allPositive()) { // divide the remaining surplus equally:
            //console.log("all positive; surplus:",surplus)
            biasedPaymentCalculator.divideSurplusEqually(surplus);
            break;  // end inner loop
        } else {
            for (positiveAgent in agentPartition.positives()) {
                biasedPaymentCalculator.incPaymentOfAgent(positiveAgent, -minDiscountPossibleWithoutEnvy);
                surplus -= minDiscountPossibleWithoutEnvy;
            }
        }
    } // loop; at most n iterations needed
    
    return biasedPaymentCalculator.paymentsOfAgents();
}

/* This just re-creates the equal division method */
CP.prototype._biasedDiscountStub = function(surplus, favoredAgent) {
    var discounts = Array.apply(null, Array(this.count)).map(Number.prototype.valueOf,0);
    for (var agent=0; agent<this.count; ++agent)
        discounts[agent] =  Math.floor(surplus/this.count);
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
    
    var logger = console;
   
/*
    var winston = require("winston");
    var logger = new (winston.Logger)({
      transports: [
        new (winston.transports.Console)({
          formatter: function(options) {
            return options.message
          }
        })
      ]
    });
*/

    var cp = new CP(
        CP.ALGORITHM.EQUAL_DISCOUNT, 
        /* verify no envy = */true,
        /* verify no deficit = */true, 
        logger
        );
    // test a single agent with positive payment; should return [[0,0,0]]
    
    var bids = [[20]];
    console.log("\nbids: ");  console.dir(bids);
    console.log("Single agent: ",cp.compute(bids, 0));
 
    var bids = [
    [3,110,120],
    [200,220,240]
    ];
    console.log("\nbids: ");  console.dir(bids);
    var allocation = cp.computeInheritance(bids, /*cost=*/0);
    console.log("allocation: ");  console.dir(allocation);
}
