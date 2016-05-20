TextareaLogger = function (textareaIdentifier) {
	this.textArea = document.getElementById(textareaIdentifier);
}

TextareaLogger.prototype.info = function(msg) {
    //alert(msg);
    this.textArea.value += (msg+"\n");
}
// TODO: add the other logging functions

TextareaLogger.prototype.clean = function() {
	this.textArea.value = "";
}
