srcds-tools
===
A set of tools for interacting with [Source Dedicated Server](https://developer.valvesoftware.com/wiki/Source_Dedicated_Server) in [node.js](http://nodejs.org).

Current version: v0.2.0

## Documentation

### RConClient

For issuing commands to SRCDS via the [Source RCON Protocol](https://developer.valvesoftware.com/wiki/Source_RCON_Protocol), `srcds-tools` provides the `RConClient` type. Typical usage is as follows:

```js
var RConClient = require("srcds-tools").RConClient;

var rcon = new RConClient();

rcon.connect("127.0.0.1", 27015);

rcon.sendPassword("password123");

rcon.sendCommand("sv_cheats 1", function (response) {

	// Code to be executed when the server responds

});
```

### .verbose

A boolean which, if set to `true`, causes the `RConClient` to output debug information to `console.log()`.

#### .connect(address, port)

Establishes a TCP connection to the game server. The `port` can be passed as a second parameter, or as part of the `address` string. Once `connect()` is called, it is safe to call `sendPassword()` immediately.

```js
rcon.connect("127.0.0.1", 27015);

// or

rcon.connect("127.0.0.1:27015");
```

#### .sendPassword(password, [callback])

Sends an authentication request to the server using the given `password`. If `RConClient` is able to authenticate successfully, `callback` is invoked. If the server rejects the password, an `RConBadPasswordError` is passed to the callback as the first parameter. The `callback` is optional, but highly advised since sending commands after a failed auth attempt can result in an RCON ban from the server.

```js
rcon.sendPassword("dingbats", function (error) {

	if (error) throw error;

	console.log("Authenticated successfully!");

});
```

#### .sendCommand(command, [callback])

Instructs the server to execute the specified `command`. The server's response will be passed to `callback` if it is specified. If the RCON password changes, `sendPassword()` will need to be called again or a `RConBadPasswordError` may be thrown.

```js
rcon.sendCommand("_restart", function (response) {

	console.log("Server says: " + response);

});
```

#### .setTimeout(duration)

Changes the maximum duration (in milliseconds) that `RConClient` will wait for a response before throwing an `RConTimeoutError`. Default is `1000` (1 second). Calling this method is usually unneccessary unless you want quicker/slower timeouts.

```js
// Future requests will time out in 1/2 second
rcon.setTimeout(500);
```

## Utilities

The `srcds-tools` module also provides a few utilites that can be used for debugging or independently of the module itself. They are located in the `util` directory.

### RConCLI

`RConCLI.js` is a simple command-line implementation of `RConClient`. To use it, simply run the file with node.

```
node ./util/RConCLI.js
```
