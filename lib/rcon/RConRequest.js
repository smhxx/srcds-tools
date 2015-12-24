var util                 = require("util");
var PacketType           = require("./PacketType");
var RConPacket           = require("./RConPacket");
var RConTimeoutError     = require("../errors/RConTimeoutError");
var RConBadPasswordError = require("../errors/RConBadPasswordError");

function RConRequest(type, id, body, callback) {

	RConPacket.call(this, type, id, body);

	var callback = callback;
	var timeout;
	var response = "";
	
	this.readResponse = function (responsePacket) {
		
		if (type == PacketType.AUTH_REQUEST && responsePacket.type == PacketType.AUTH_RESPONSE) {
			
			clearTimeout(timeout);

			if (callback) {

				var finalResponse = (type != PacketType.AUTH_REQUEST) ? response : undefined;

				if (responsePacket.id == -1)
					finalResponse = new RConBadPasswordError();

				callback(finalResponse);

			}

			this.emit("done");

		} else if (type == PacketType.EXEC_REQUEST && responsePacket.isTerminator()) {
			
			clearTimeout(timeout);

			if (callback) {

				var finalResponse = (type != PacketType.AUTH_REQUEST) ? response : undefined;

				if (responsePacket.id == -1)
					finalResponse = new RConBadPasswordError();

				callback(finalResponse);

			}

			this.emit("done");
			
		} else if (type == PacketType.EXEC_REQUEST) {

			response += responsePacket.body;
		}

	};

	this.startTimeout = function (duration) {

		clearTimeout(timeout);

		var self = this;

		timeout = setTimeout(function () {

			self.emit("done");
			throw new RConTimeoutError("An RCON request failed because the operation timed out after " + duration + "ms.");

		}, duration);

	}

}

util.inherits(RConRequest, RConPacket);
module.exports = RConRequest;
