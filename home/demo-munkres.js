var Munkres = require("munkres-js");

var m = new Munkres.Munkres();

// Demo based on munkres.js documentation (https://github.com/addaleax/munkres-js/blob/master/munkres.js):
var costmatrix = [
[5, 9, 1],
[10, 3, 2],
[9, 7, 4]];
var indices = m.compute(costmatrix);   // Run the Munkres algorithm; find a minimum-cost matching.
console.log("Cost matrix: \n", Munkres.format_matrix(costmatrix));
console.log("Lowest-cost indices: \n", indices);
var total = 0;
for (var i = 0; i < indices.length; ++i) {
    var row = indices[i][0], col = indices[i][1];
    var value = costmatrix[row][col];
    total += value;
}
console.log('total cost:', total, "\n");

// Find a maximum-profit matching:
var profitmatrix = [
[20,-10,-10],
[10,0,-10],
[0,10,-10]];
costmatrix = Munkres.make_cost_matrix(profitmatrix);
indices = m.compute(costmatrix);   // Run the Munkres algorithm; find a minimum-cost matching.
console.log("Profit matrix: \n", Munkres.format_matrix(profitmatrix));
console.log("Cost matrix: \n", Munkres.format_matrix(costmatrix));
console.log("Highest-profit indices: \n", indices);
