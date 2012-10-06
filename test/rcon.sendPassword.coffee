should               = require "should"
SrcdsTools           = require "../"
MockGameServer       = require "./mock/MockGameServer"
RConClient           = SrcdsTools.RConClient;
RConBadPasswordError = SrcdsTools.RConBadPasswordError;

describe 'RConClient.sendPassword(password, [callback])', ->

	SERVERDATA_AUTH           = 3;
	SERVERDATA_EXECCOMMAND    = 2;
	SERVERDATA_AUTH_RESPONSE  = 2;
	SERVERDATA_RESPONSE_VALUE = 0;

	server = { }
	client = { }

	password = "dingbats"

	beforeEach (done)->

		server = new MockGameServer()
		client = new SrcdsTools.RConClient()

		server.once 'ready', ->
			client.connect(server.address, server.port)

		server.once 'connected', ->
			done()

	it 'sends an authentication packet to the server', (done)->

		client.sendPassword(password);

		server.once 'request', (request)->

			request.type.should.equal SERVERDATA_AUTH
			request.body.should.equal password

			done()

	describe 'if authentication is successful', ->

		it 'invokes the callback with no parameters', (done)->

			client.sendPassword password, (error)->

				should.equal error, undefined

				done()

			server.once 'request', (request)->

				response = {
					id:   request.id,
					type: SERVERDATA_AUTH_RESPONSE,
					body: ""
				}

				server.sendResponse response

	describe 'if authentication fails', ->

		it 'passes an RConBadPasswordError to the callback', (done)->

			callback = (error) ->

				error.should.be.an.instanceOf RConBadPasswordError

				done()

			client.sendPassword(password, callback);

			server.once 'request', (request)->

				response = {
					id:   -1,
					type: SERVERDATA_AUTH_RESPONSE,
					body: ""
				}

				server.sendResponse response
