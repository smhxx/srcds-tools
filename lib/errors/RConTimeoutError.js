function RConTimeoutError(message) {

	Error.call(this);
	Error.captureStackTrace(this, this);

	this.name = "RConTimeoutError";
	this.message = message || "An RCON request failed because the operation timed out";

}

RConTimeoutError.prototype = new Error();
module.exports = RConTimeoutError;
