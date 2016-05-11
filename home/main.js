/*
 * To bundle this file, use: 
      browserify main.js -o main.bundle.js
 *     or: 
      browserify main.js | uglifyjs - -m -c -o main.bundle.js
 */

// The main algorithm:
window.CompensationProcedure = require("./compensation");
