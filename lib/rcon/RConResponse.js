var PacketType = require("./PacketType");

function RConResponse(type, id, body) {

	this.type    = type;
	this.id      = id;
	this.body    = body;

	this.isTerminator = function() {

		return (this.type == PacketType.EXEC_RESPONSE && this.body == "");

	}

	this.isFailedAuthResponse = function() {

		return (this.type == PacketType.AUTH_RESPONSE && this.id == -1);

	}

	this.size = function() {

		return body.length + 14;

	}

}

RConResponse.fromResponsePacket = function (data, offset) {

		var bodyBegin = offset + 12;
		var bodyEnd   = bodyBegin + data.readInt32LE(offset) - 10;

		var id     = data.readInt32LE(offset + 4);
		var type   = data.readInt32LE(offset + 8);
		var body   = data.toString('utf8',bodyBegin, bodyEnd);

		return new RConResponse(type, id, body);

};

module.exports = RConResponse;
