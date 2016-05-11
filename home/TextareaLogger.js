TextareaLogger = function (textareaIdentifier) {
	this.textArea = $(textareaIdentifier);
}

TextareaLogger.prototype.info = function(msg) {
    //alert(msg);
    this.textArea.append(msg+"\n");
}
// TODO: add the other logging functions

TextareaLogger.prototype.clean = function() {
	this.textArea.text("");
}

