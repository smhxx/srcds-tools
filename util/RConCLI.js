var RConClient = require("../lib").RConClient;

var rcon = new RConClient();

var index  = 0;
var info   = [];
var prompt = "\n > ";

function startConsole() {

	process.stdin.listeners("data").pop();

	rcon.connect(info[0], info[1]);
	rcon.sendPassword(info[2], function(error) {

		if (error) {

			process.stdout.write("\nCouldn't connect to server: Bad RCON password.");
			process.exit(1);

		}

		process.stdout.write(prompt);

		process.stdin.on("data", function (data) {

			rcon.sendCommand(data.toString().replace(/\n/g, ""), getResponse);

		});

	});

}

function getResponse(response) {

	process.stdout.write("\n");
	if (response) process.stdout.write(response);
	process.stdout.write(prompt);

}

function moveCursor(down, right) {

	var verticalChar   = (down  > 0) ? "B" : "A";
	var horizontalChar = (right > 0) ? "C" : "D";

	if (down)  process.stdout.write("\u001b[" + Math.abs(down)  + verticalChar);
	if (right) process.stdout.write("\u001b[" + Math.abs(right) + horizontalChar);

}

process.stdout.write("\n                     SRCDS REMOTE CONSOLE");
process.stdout.write("\n             Enter server information to connect.\n");
process.stdout.write("\n         IP:");
process.stdout.write("\n       Port:");
process.stdout.write("\n   Password:\n");

moveCursor(-3, 13);

process.stdin.resume();

process.stdin.on("data", function(data) {

	info[index] = data.toString().trim();
	moveCursor(0, 13);
	index++;

	if (index == 3) startConsole();

});
