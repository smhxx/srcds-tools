should           = require "should"
SrcdsTools       = require "../"
MockGameServer   = require "./mock/MockGameServer"
RConClient       = SrcdsTools.RConClient;
RConTimeoutError = SrcdsTools.RConTimeoutError;

describe 'RConClient.setTimeout(duration)', ->

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

	it 'sets the max timeout duration for requests', (done)->

		client.setTimeout(0);

		mochaListener = process.listeners('uncaughtException').pop()

		client.sendCommand(command);

		process.once 'uncaughtException', (error)->

			process.listeners('uncaughtException').push(mochaListener)

			error.should.be.an.instanceOf RConTimeoutError

			done()
