var net            = require("net");
var PacketType     = require("./PacketType");
var RConRequest    = require("./RConRequest");
var RConResponse   = require("./RConResponse");
var RConTerminator = require("./RconTerminator");

function RConClient() {

	this.verbose = false;

	var self = this;
	var openRequests = [];
	var nextRequestID = 0;
	var socket;
	var timeoutDuration = 1000;

	this.connect = function (address, port) {

		port = port | address.split(":")[1] | 27015;
		address = address.split(":")[0];

		if (socket)
			socket.end();

		socket = net.connect(port, address);

		socket.on("data", readResponsePacket);

		socket.on("connect", function () {
			if (self.verbose)
				console.log("Connected to server " + socket.remoteAddress + ":" + socket.remotePort + ".");
		});

		socket.on("timeout", function () {
			if (self.verbose)
				console.log("Encountered a timeout with server " + socket.remoteAddress + ":" + socket.remotePort);
		});

		socket.on("close", function (had_error) {
			if (self.verbose)
				console.log("Disconnected from server " + socket.remoteAddress + ":" + socket.remotePort + (had_error? " due to a transmission error." : "."));
		});
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

			closeRequest(request);
		});

		socket.write(request.toBuffer());

		if (self.verbose) {
			
			console.log("Sending request packet:");
			request.printPacketDebugInfo();
		}

		if (request.type == PacketType.EXEC_REQUEST) {
			
			var terminator = new RConTerminator(request.id);

			socket.write(terminator.toBuffer());

			if (self.verbose) {
				
				console.log("Sending terminator packet:");
				terminator.printPacketDebugInfo();
			}
		}
		
		request.startTimeout(timeoutDuration);
	}

	function readResponsePacket(data) {

		var offset = 0;

		while (offset < data.length) {

			var response = RConResponse.fromResponsePacket(data, offset);
			var request = getRequestByID(response.id);

			if (self.verbose) {
				
				console.log("Received response packet:");
				response.printPacketDebugInfo();
			}

			if (response.isFailedAuthResponse()) {

				var request = findOldestAuthRequest();
				request.readResponse(response);
			}

			if (request) request.readResponse(response);

			offset += response.totalSize();
		}
	}

	function findOldestAuthRequest() {

		for (var i = 0; i < openRequests.length; i++) {

			if (openRequests[i].type == PacketType.AUTH_REQUEST) return openRequests[i];
		}
	}

	function closeRequest(request) {

		var index = openRequests.indexOf(request);
		
		if(index > -1)
			openRequests.splice(index, 1);
	}

	function getRequestByID(id) {
		
		for (var i = 0; i < openRequests.length; i++) {
			
			if (openRequests[i].id == id) {	
				
				return openRequests[i];
			}
		}
	}

}

module.exports = RConClient;
