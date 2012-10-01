var net          = require("net");
var util         = require("util");
var should       = require("should");
var EventEmitter = require("events").EventEmitter;

var MockGameServer = function () {

	EventEmitter.call(this);

	this.address = "0.0.0.0";
	this.port    = 0;

	var self = this;
	var socket;

	this.sendResponse = function (responseInfo) {

		var bodyLength = responseInfo.body.length;
		var packet = new Buffer(14 + bodyLength);

		packet.writeInt32LE(10 + bodyLength, 0);
		packet.writeInt32LE(responseInfo.id, 4);
		packet.writeInt32LE(responseInfo.type, 8);
		packet.write(responseInfo.body, 12);
		packet.writeInt16LE(0, packet.length - 2);

		socket.write(packet);

	};

	function readRequest(packet, offset) {

		var packetSize   = packet.readInt32LE(0 + offset);
		var requestID    = packet.readInt32LE(4 + offset);
		var requestType  = packet.readInt32LE(8 + offset);
		var requestBody  = packet.toString('utf8', 12 + offset, packetSize + 2 + offset);
		var twoNullBytes = packet.readInt16LE(packetSize + 2 + offset);

		var errorMessage = "Bad RCON request: ";

		requestID.should.be.above(-1, errorMessage + "the request ID cannot be negative");
		twoNullBytes.should.equal(0, errorMessage + "the request must end in two null bytes");

		return {
			size: packetSize,
			id: requestID,
			type: requestType,
			body: requestBody
		};

	}

	var server = net.createServer(function (connection) {

		self.emit("connected");

		socket = connection;

		socket.on("data", function (packet) {

			var offset = 0;

			while (offset < packet.length) {

				var requestInfo = readRequest(packet, offset);

				self.emit("request", requestInfo);

				offset += parseInt(requestInfo.size, 10) + 4;

			}

		});

		socket.on("end", function () {

			self.emit("end");

		});

	});

	server.listen(function () {

		self.address = server.address().address;
		self.port    = server.address().port;

		self.emit("ready");

	});

};

util.inherits(MockGameServer, EventEmitter);
module.exports = MockGameServer;
