/**
 * A simple utility to run gnuplot.
 */

var exec = require("child_process").exec;

module.exports = function rungnuplot(gnuplotFilename, params, dryRun) {
	var command = "gnuplot --persist "+(params? " -e \""+params+"\" ": "")+gnuplotFilename;
	console.log(command);
	if (dryRun) return;
	exec(command, function (error, stdout, stderr) {
			if (stdout) console.log('stdout: ' + stdout);
			if (stderr) console.log('stderr: ' + stderr);
			if (error !== null) {
				console.log('exec error: ' + error);
			}
		}
	);
}
