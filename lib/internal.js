//var server;
var log = require('./log.js');
var rl;
function readLine()
{
	this.rl.on('line', function(line) {
		var data = {};
		if(line.indexOf('/role') == 0)
		{
			var string = 'Console gave ' + line.substring(6) + ' administrator permissions';

			data.message = string;
			data.user = 'Console';
			data.type = 'role';
			data.extra = line.substring(6);
			data.role = 3;

			utils.sendToAll(clients, data);
			utils.sendToOne(clients, users, data, line.substring(6), data.type);
		}
		rl.prompt();
	}).on('close', function() {
		log('stop', 'Shutting down\n');
		process.exit(0);
	});
}
function onError(error)
{
	if(error.syscall !== 'listen')
	{
		throw error;
	}
	var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
	switch(error.code)
	{
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;

		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;

		default:
			throw error;
	}
}
/*function onListening()
{
	var addr = server.address();
	var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	log('start', 'Listening at ' + bind);
}*/
module.exports.readLine = readLine;
module.exports.onError = onError;
//module.exports.onListening = onListening;
module.exports.rl = rl;
//module.exports.server = server;