// uses arg.js

PermalinkManager = function (anchorIdentifier) {
	this.anchor = document.getElementById(anchorIdentifier);
    this.anchor.href = "#"; // initially, keep current url
}

PermalinkManager.prototype.update = function(params) {
    this.anchor.href = Arg.url(params);
}
