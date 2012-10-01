function RConBadPasswordError(message) {

	Error.call(this);
	Error.captureStackTrace(this, this);

	this.name = "RConBadPasswordError";
	this.message = message || "An RCON request failed because of a bad RCON password";

}

RConBadPasswordError.prototype = new Error();
module.exports = RConBadPasswordError;
