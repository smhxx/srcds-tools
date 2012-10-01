var net                  = require("net");
var PacketType           = require("./PacketType");
var RConRequest          = require("./RConRequest");
var RConResponse         = require("./RConResponse");
var RConBadPasswordError = require("../errors/RConBadPasswordError");

function RConClient() {

	var openRequests = [];
	var nextRequestID = 0;
	var socket;
	var timeoutDuration = 1000;

	this.connect = function (address, port) {

		if (address.indexOf(":") != -1) {
			port    = address.split(":")[1];
			address = address.split(":")[0];
		}

		if (socket)
			socket.end();

		socket = net.connect(port, address);

		socket.on("data", readResponsePacket);

	};

	this.sendPassword = function (password, callback) {

		var request = new RConRequest(PacketType.AUTH_REQUEST, nextRequestID++, password, callback);

		sendRequest(request);

	};

	this.sendCommand = function (command, callback) {

		var request = new RConRequest(PacketType.EXEC_REQUEST, nextRequestID++, command, callback);

		sendRequest(request);

	};

	this.setTimeout = function (duration) {

		timeoutDuration = duration;

	};

	function sendRequest(request) {

		openRequests.push(request);

		request.on("done", function () {

			openRequests.splice(openRequests.indexOf(request), 1);

		});

		socket.write(request.toBuffer());

		request.startTimeout(timeoutDuration);

	}

	function readResponsePacket(data) {

		var offset = 0;

		while (offset < data.length) {

			var response = RConResponse.fromResponsePacket(data, offset);

			if (response.isFailedAuthResponse())
				throw new RConBadPasswordError("Received failed auth response from " + socket.address().address + ":" + socket.address().port);

			var request = getRequestByID(response.id);

			if (request) request.readResponse(response);

			offset += response.size();

		}

	}

	function getAddressAsString() {

		var address = socket.address();

		return address.address + ":" + address.port;

	}

	function getRequestByID(id) {

		for (var i = 0; i < openRequests.length; i++) {

			if (openRequests[i].getID() == id) {

				return openRequests[i];

			}

		}

	}

}

module.exports = RConClient;
