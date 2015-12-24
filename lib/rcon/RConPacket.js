var EventEmitter = require("events");
var util = require("util");
var PacketType = require("./PacketType");

function RConPacket(type, id, body) {

	this.type    = type;
	this.id      = id;
	this.body    = body;

  EventEmitter.call(this);

  this.toBuffer = function () {

    var packetSize = 10 + body.length;
    var buffer     = new Buffer(this.totalSize());

    buffer.writeInt32LE(this.totalSize() - 4, 0);
    buffer.writeInt32LE(this.id, 4);
    buffer.writeInt32LE(this.type, 8);
    buffer.write(body, 12, 12 + this.payloadSize());
    buffer.writeInt16LE(0, 12 + this.payloadSize());

    return buffer;

  }

  this.payloadSize = function() {

    return body.length;

  }

  this.totalSize = function() {

    return 14 + this.payloadSize();

  }

  this.isTerminator = function() {

    return (this.type == PacketType.EXEC_RESPONSE && this.body == "");

  }

  this.isFailedAuthResponse = function() {

    return (this.type == PacketType.AUTH_RESPONSE && this.id == -1);

  }

  this.printPacketDebugInfo = function () {

    console.log("  ID: " + this.id);
    console.log("  Type: " + PacketType.getTypeName(this.type) + " (" + this.type + ")");
    console.log("  Body: '" + this.body + "'");
    console.log("  Total Size: " + this.totalSize() + "\t\tPayload Size:" + this.payloadSize());
    console.log("  Is terminator?  " + (this.isTerminator()? "yes" : "no") + "\t\tIs failed auth response?  " + (this.isFailedAuthResponse()? "yes" : "no"));
    console.log();

  }

}

util.inherits(RConPacket, EventEmitter);
module.exports = RConPacket;
