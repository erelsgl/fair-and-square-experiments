/**
 * Utility functions for reading input values.
 */ 

module.exports = {
		valuesFromFile: function(filename) {
			var fs = require('fs')
			return JSON.parse(fs.readFileSync(filename));
		},

		/**
		 * @param meanValues array
		 * @param noiseProportion a number in [0,1]
		 * @return an array of values of the same size as meanValues; to each value, the function adds a random noise, drawn uniformly from [-noiseRatio,noiseRatio]*value
		 */
		noisyValues: function(meanValues, noiseProportion, normalizedSum) {
			var sum = 0;
			var noisyValues = new Array(meanValues.length);
			for (var i=0; i<meanValues.length; ++i) {
				var noise = (2*Math.random()-1)*noiseProportion;
				var newVal = meanValues[i]*(1+noise);
				newVal = Math.max(0,newVal); // avoid negative values
				sum += newVal;
				noisyValues[i]=newVal;
			}
			if (sum && normalizedSum) {
				normalizationFactor = normalizedSum/sum;
				for (var i=0; i<noisyValues.length; ++i) {
					noisyValues[i] *= normalizationFactor;	
				}
			}
			return noisyValues;
		},
		
		noisyValuesArray: function(meanValues, noiseProportion, normalizedSum, numOfAgents) {
			var values = Array(numOfAgents);
			for (var i=0; i<numOfAgents; ++i) {
				values[i] = this.noisyValues(meanValues, noiseProportion, normalizedSum);
			}
			return values;
		}
}
