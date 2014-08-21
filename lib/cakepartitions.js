/**
 * Utilities for analyzing partitions of cakes.
 * 
 * @author Erel Segal-Halevi
 * @since 2014-08
 */

var _ = require("underscore");


module.exports = {

	/**
	 * @return the smallet relative value of a single agent.
	 */
	egalitarianValue: function(allocations) {
		if (allocations.length==0)	throw new Error("empty partition");
		return _.min(allocations, function(vf) {
			return vf.getRelativeValue();
		}).getRelativeValue();
	},
	
	/**
	 * @return the egalitarian value times the number of agents.
	 */
	normalizedEgalitarianValue: function(allocations) {
		return this.egalitarianValue(allocations)*allocations.length;
	},
	
	/**
	 * @return the sum of relative values of all agents.
	 */
	utilitarianValue: function(allocations) {
		if (allocations.length==0)	throw new Error("empty partition");
		return _.reduce(allocations, function(memo,vf) {
			return memo + vf.getRelativeValue();
		}, 0);
	},
	
	/**
	 * @return the envy that one agent feels towards another agent's share (or 0 if none)
	 */
	envyOfAgent: function(enviousValueFunction, enviedValueFunction) {
		var enviousValue = enviousValueFunction.getValue();
		var enviedValue  = enviousValueFunction.getValueOfOther(enviedValueFunction);
		if (enviousValue>=enviedValue)
			return 0;
		else
			return (enviedValue-enviousValue)/enviousValue;
	},
	
	/**
	 * @return the largest relative envy that an agent feels towards any other agent
	 */
	largestEnvyOfAgent: function(enviousValueFunction, allValueFunctions) {
		return _.reduce(allValueFunctions, function(memo, enviedValueFunction) {
			var envyTowardsMe = module.exports.envyOfAgent(enviousValueFunction, enviedValueFunction)
			return Math.max(memo, envyTowardsMe);
		},0);
	},
	
	/**
	 * @return the largest relative envy that any agent feels towards any other agent
	 */
	largestEnvy: function(valueFunctions) {
		return _.reduce(valueFunctions, function(memo, enviousValueFunction) {
			var envyOfMe = module.exports.largestEnvyOfAgent(enviousValueFunction, valueFunctions)
			return Math.max(memo, envyOfMe);
		},0);
	}
}
