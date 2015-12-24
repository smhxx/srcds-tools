module.exports = {

	AUTH_REQUEST:  3,
	EXEC_REQUEST:  2,
	AUTH_RESPONSE: 2,
	EXEC_RESPONSE: 0,

	getTypeName: function (typeID) {
		switch(typeID) {
			case 3:
				return "AUTH_REQUEST";
			case 2:
				return "EXEC_REQUEST / AUTH_RESPONSE";
			case 0:
				return "EXEC_RESPONSE";
			default:
				return "invalid";
		}
	}

}
