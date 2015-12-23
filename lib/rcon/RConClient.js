var net                  = require("net");
var PacketType           = require("./PacketType");
var RConRequest          = require("./RConRequest");
var RConResponse         = require("./RConResponse");

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

		socket = net.createConnection(port, address);
		
		socket.on('connect', function() {
			console.log('connected');
		});
		socket.on('error', function(err) {
			console.log(err);
		});
		socket.on("data", readResponsePacket);

	};

	this.sendPassword = function (password, callback) {

		var req = new RConRequest(PacketType.AUTH_REQUEST, nextRequestID++, password, callback);

		sendRequest(req);

	};

	this.sendCommand = function (command, callback) {

		var req = new RConRequest(PacketType.EXEC_REQUEST, nextRequestID++, command, callback);
		
		sendRequest(req);
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
		
		console.log('send', request, '\n');

		request.startTimeout(timeoutDuration);

	}

	function readResponsePacket(data) {
		
		var offset = 0;
		
		while (offset < data.length) {

			var response = RConResponse.fromResponsePacket(data, offset);
			console.log('respons', response, '\n');

			if (response.isFailedAuthResponse()) {

				var request = findOldestAuthRequest();

				request.readResponse(response);

			}

			var request = getRequestByID(response.id);

			if (request) request.readResponse(response);

			offset += response.size();
		}
	}

	function findOldestAuthRequest() {

		for (var i = 0; i < openRequests.length; i++) {

			if (openRequests[i].getType() == PacketType.AUTH_REQUEST) return openRequests[i];
		}
	}

	function closeRequest(request) {

		openRequests.splice(openRequests.indexOf(request));

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
