SrcdsTools     = require "../"
MockGameServer = require "./mock/MockGameServer"

RConClient           = SrcdsTools.RConClient;

describe 'RConClient.connect(address, port)', ->

		server = null
		client = null

		beforeEach (done)->

			server = new MockGameServer()
			client = new SrcdsTools.RConClient()

			server.once 'ready', ->
				done()

		it 'establishes a TCP connection to the specified server', (done)->

			client.connect(server.address, server.port);

			server.once 'connected', ->
				done()

		describe 'when a port is specified in the \'address\' parameter', ->

			it 'ignores the \'port\' parameter', (done)->

				client.connect(server.address + ":" + server.port, 80);

				server.once 'connected', ->
					done()

		describe 'if a connection has already been established', ->

			it 'sends a FIN packet to close the connection to the previous server', (done)->

				client.connect(server.address, server.port);

				server2 = new MockGameServer()

				server2.once 'ready', ->

					client.connect(server2.address, server2.port);

				server.once 'end', ->

					done()
