var util = require("util");
var PacketType = require("./PacketType");
var RConPacket = require("./RConPacket");

function RConTerminator(id) {

  RConPacket.call(this, PacketType.EXEC_RESPONSE, id, "");
}

util.inherits(RConTerminator, RConPacket);
module.exports = RConTerminator;
