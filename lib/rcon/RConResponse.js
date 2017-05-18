var util = require("util");
var PacketType = require("./PacketType");
var RConPacket = require("./RConPacket");

function RConResponse(type, id, body) {

	RConPacket.call(this, type, id, body);

}

RConResponse.fromResponsePacket = function (data, offset) {

		var bodyBegin = offset + 12;
		var bodyEnd   = bodyBegin + data.readInt32LE(offset) - 10;

		var id     = data.readInt32LE(offset + 4);
		var type   = data.readInt32LE(offset + 8);
		var body   = data.toString('utf8',bodyBegin, bodyEnd);

		return new RConResponse(type, id, body);

};

util.inherits(RConResponse, RConPacket);
module.exports = RConResponse;
