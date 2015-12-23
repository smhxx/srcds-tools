var util                 = require("util");
var EventEmitter         = require("events").EventEmitter;
var PacketType           = require("./PacketType");
var RConTimeoutError     = require("../errors/RConTimeoutError");
var RConBadPasswordError = require("../errors/RConBadPasswordError");

function RConRequest(type, id, body, callback) {

	EventEmitter.call(this);

	var type     = type;
	var id       = id;
	var body     = body;
	var callback = callback;
	var timeout;
	var response = "";
	
	this.type     = type;
	this.id       = id;
	this.body     = body;

	this.readResponse = function (responsePacket) {
		
		if (type == PacketType.AUTH_REQUEST && responsePacket.type == PacketType.AUTH_RESPONSE) {
			
			console.log('readResponse', 'AUTH RESPONSE');
			
			clearTimeout(timeout);
			
			if (callback) {

				var finalResponse = undefined;

				if (responsePacket.id == -1)
					finalResponse = new RConBadPasswordError();

				callback(finalResponse);

			}

			this.emit("done");

		} else if (responsePacket.isTerminator() && type == PacketType.EXEC_REQUEST) {
			
			console.log('readResponse', 'EXEC RESPONSE');
			
			clearTimeout(timeout);
			
			if (callback) {

				var finalResponse = response;

				if (responsePacket.id == -1)
					finalResponse = new RConBadPasswordError();

				callback(finalResponse);

			}
		
		} else {

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

	this.toBuffer = function () {

		var packetsToSend = [];

		packetsToSend.push(createPacket(type, body));

		if (type == PacketType.EXEC_REQUEST)
			packetsToSend.push(createPacket(PacketType.EXEC_RESPONSE, ""));

		var buffer = Buffer.concat(packetsToSend, 28 + body.length);

		return buffer;

	};

	this.getID = function() {

		return id;

	}

	this.getType = function() {

		return type;

	}

	function createPacket(type, body) {

		var packetSize = 10 + body.length;
		var buffer     = new Buffer(packetSize + 4);

		buffer.writeInt32LE(packetSize, 0);
		buffer.writeInt32LE(id,    		4);
		buffer.writeInt32LE(type,       8);
		buffer.write(body, 12, 12 + body.length, "ascii");
		buffer.writeInt16LE(0, 12 + body.length);
		
		return buffer;

	};

}

util.inherits(RConRequest, EventEmitter);
module.exports = RConRequest;
