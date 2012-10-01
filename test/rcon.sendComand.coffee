should         = require "should"
SrcdsTools     = require "../"
MockGameServer = require "./mock/MockGameServer"
RConClient     = SrcdsTools.RConClient;

describe 'RConClient.sendCommand(command, [callback])', ->

	SERVERDATA_AUTH           = 3;
	SERVERDATA_EXECCOMMAND    = 2;
	SERVERDATA_AUTH_RESPONSE  = 2;
	SERVERDATA_RESPONSE_VALUE = 0;

	server = { }
	client = { }

	command = "sv_cheats 1"

	beforeEach (done)->

		server = new MockGameServer()
		client = new SrcdsTools.RConClient()

		server.once 'ready', ->
			client.connect(server.address, server.port)

		server.once 'connected', ->
			done()

	it 'sends a command packet to the server', (done)->

		client.sendCommand(command);

		server.once 'request', (request)->

			request.type.should.equal SERVERDATA_EXECCOMMAND
			request.body.should.equal command

			done()

	it 'sends a terminator packet after the command', (done)->

		client.sendCommand(command);

		originalRequestID = -1;

		server.on 'request', (request)->

			if (originalRequestID == -1)
				originalRequestID = request.id
				return

			request.id.should.equal originalRequestID
			request.type.should.equal SERVERDATA_RESPONSE_VALUE
			request.body.should.equal ""

			done()

	it 'passes the response to the callback once it is received', (done)->

		alreadyReceivedFirstPacket = false
		originalRequestID = 0
		responseBody = "This is the body of the response."

		callback = (response)->
			response.should.equal responseBody
			done()

		client.sendCommand(command, callback);

		server.on 'request', (request)->

			if (request.type == SERVERDATA_EXECCOMMAND)

				alreadyReceivedFirstPacket = true
				originalRequestID = request.id

				response = {
					id: request.id,
					type: SERVERDATA_RESPONSE_VALUE,
					body: responseBody
				}

				server.sendResponse response

			if (request.type == SERVERDATA_RESPONSE_VALUE)

				alreadyReceivedFirstPacket.should.be.ok
				request.id.should.equal originalRequestID
				request.body.should.equal ""

				response = {
					id: request.id,
					type: SERVERDATA_RESPONSE_VALUE,
					body: ""
				}

				server.sendResponse response

	describe 'when the response spans multiple packets', ->

		it 'concatenates the bodies of all response packets to get full response', (done)->

			responseBodies = [ "This ", "is ", "the ", "complete ", "response.", "" ]

			callback = (response)->

				response.should.equal responseBodies.join("")
				done()

			client.sendCommand("sv_cheats 1", callback);

			server.once 'request', (request)->

				sendResponse = (body)->

					response = {
						id: request.id,
						type: SERVERDATA_RESPONSE_VALUE,
						body: body
					}

					server.sendResponse response

				sendResponse body for body in responseBodies
