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
	egalitarianValue: function(valueFunctions) {
		if (valueFunctions.length==0)	throw new Error("empty partition");
		return _.min(valueFunctions, function(vf) {
			return vf.getRelativeValueOfCurrentPiece();
		}).getRelativeValueOfCurrentPiece();
	},
	
	/**
	 * @return the egalitarian value times the number of agents.
	 */
	normalizedEgalitarianValue: function(valueFunctions) {
		return this.egalitarianValue(valueFunctions)*valueFunctions.length;
	},
	
	/**
	 * @return the sum of relative values of all agents.
	 */
	utilitarianValue: function(valueFunctions) {
		if (valueFunctions.length==0)	throw new Error("empty partition");
		return _.reduce(valueFunctions, function(memo,vf) {
			return memo + vf.getRelativeValueOfCurrentPiece();
		}, 0);
	},
	
	/**
	 * @return the envy that one agent feels towards another agent's share (or 0 if none)
	 */
	envyOfAgent: function(enviousValueFunction, enviedValueFunction) {
		var enviousValue = enviousValueFunction.getValueOfCurrentPiece();
		var enviedValue  = enviousValueFunction.getValueOfPiece(enviedValueFunction.from, enviedValueFunction.to);
		if (enviousValue>=enviedValue)
			return 0;
		else
			return (enviedValue-enviousValue)/enviousValue;
	},
	
	/**
	 * @return the largest relative envy that an agent feels towards any other agent
	 */
	largestEnvyOfAgent: function(enviousValueFunction, allValueFunctions) {
		return _.max(allValueFunctions, function(enviedValueFunction) {
			enviedValueFunction.envyTowardsMe = module.exports.envyOfAgent(enviousValueFunction, enviedValueFunction)
			return enviedValueFunction.envyTowardsMe;
		}).envyTowardsMe;
	},
	
	/**
	 * @return the largest relative envy that any agent feels towards any other agent
	 */
	largestEnvy: function(valueFunctions) {
		return _.max(valueFunctions, function(enviousValueFunction) {
			enviousValueFunction.envyOfMe = module.exports.largestEnvyOfAgent(enviousValueFunction, valueFunctions)
			return enviousValueFunction.envyOfMe;
		}).envyOfMe;
	}
}
