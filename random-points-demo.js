function randomPointSnappedToGrid(maxVal, gridSize) {
	return 	Math.floor(Math.random()*maxVal/gridSize)*gridSize;
}

module.exports = function randomPoints(count, xmax, ymax, gridSize) {
	var points =  [];
	for (var i=0; i<count; ++i) {
		points.push({
			x: randomPointSnappedToGrid(xmax, gridSize),
			y: randomPointSnappedToGrid(ymax, gridSize),
		});
	}
	points.sort(function(a,b){return a.x-b.x});
	return points;
}
