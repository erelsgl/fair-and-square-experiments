/**
 * Payment Calculator.
 * 
 * There are n items and n agents.
 * Each agent has a gross valuation for each item.
 * The net value of the agents to the items are the gross values minus the payments.
 */

/**
 * @param itemOfAgent 1-D array.
 * @param agentOfItem 1-D array.
 * @param grossValues 2-D matrix.
 */
var PC = module.exports = function(itemByAgent, agentByItem, grossValues) {
    this.itemByAgent = itemByAgent;
    this.agentByItem = agentByItem;
    this.grossValues = grossValues;
    this.count = itemByAgent.length;
    this.paymentByItem = Array.apply(null, Array(this.count)).map(Number.prototype.valueOf,0);  // fill with zeros
    this.totalPayment  = 0;
}

PC.prototype.paymentOfItem = function(item) {
    return this.paymentByItem[item];
}

PC.prototype.setPaymentOfItem = function(item,payment) {
    if (isNaN(payment))
        throw Error("payment is NaN");
    this.totalPayment += (payment-this.paymentByItem[item]);
    this.paymentByItem[item] = payment;
}

PC.prototype.incPaymentOfItem = function(item,payment) {
    if (isNaN(payment))
        throw Error("payment is NaN");
    this.totalPayment += payment;
    this.paymentByItem[item] += payment;
}

PC.prototype.paymentOfAgent = function(agent) {
    return this.paymentByItem[this.itemByAgent[agent]];
}

PC.prototype.paymentsOfItems = function() {
    return this.paymentByItem;
}

PC.prototype.paymentsOfAgents = function() {
    var payments = Array(this.count);
    for (var agent=0; agent<this.count; ++agent)
        payments[agent] = this.paymentOfAgent(agent);
    return payments;
}

PC.prototype.setPaymentOfAgent = function(agent,payment) {
    this.setPaymentOfItem(this.itemByAgent[agent],payment);
}

PC.prototype.incPaymentOfAgent = function(agent,payment) {
    this.incPaymentOfItem(this.itemByAgent[agent],payment);
}

PC.prototype.divideSurplusEqually = function(surplus) {
    if (isNaN(surplus))
        throw Error("surplus is NaN");
    var discountPerAgent = Math.floor(surplus/this.count);
    for (var agent=0; agent<this.count; ++agent) 
        this.incPaymentOfAgent(agent, -discountPerAgent);
}

PC.prototype.divideSurplusByVector = function(discountVector) {
    for (var agent=0; agent<this.count; ++agent) {
        var discountPerAgent = discountVector[agent];
        this.incPaymentOfAgent(agent, -discountPerAgent);
    }
}

PC.prototype.grossValue = function(agent,item) {
    return this.grossValues[agent][item];
}

PC.prototype.netValue = function(agent,item) {
    return this.grossValues[agent][item] - this.paymentByItem[item];
}

PC.prototype.envy = function(agent, otherAgent) {
    return this.netValue(agent, this.itemByAgent[otherAgent]) - 
           this.netValue(agent, this.itemByAgent[agent]);
}

PC.prototype.clone = function() {
    var theClone = new PC(this.itemByAgent, this.agentByItem, this.grossValues); // these arrays do not change so they can be kept as-is.
    theClone.paymentByItem = this.paymentByItem.slice(0);  // clone the paymentByItem 1-D array.
    theClone.totalPayment = this.totalPayment
    return theClone;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
if (typeof require != 'undefined' &&
    typeof module != 'undefined' &&
    require.main == module) {

    var bids = [
    [20,-10,-10],
    [10,0,-10],
    [0,10,-10]
    ];
    var pc = new PC([0,2,1],[0,2,1],bids);
}

