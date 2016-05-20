// Random number generator from :
//    http://stackoverflow.com/questions/521295/javascript-random-seeds

RandomGenerator = function (seed) {
	this.seed = seed;
}

RandomGenerator.prototype.get = function() {
    var x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
}
