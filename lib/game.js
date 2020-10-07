var rooms = [];
/* Functions */
function userDisconected(id)
{
	var r = [null, null];
	var auxUsers = [];
	var auxUsersIds = [];
	var auxUsersPoints = [];
	var auxUsersTurns = [];
	var auxUsersUsed = [];
	for (var i = 0; i < rooms.length; i++)
	{
		var aux = rooms[i]['usersIds'].indexOf(id);
		if (aux != -1)
		{
			r = [rooms[i]['roomCode'], rooms[i]['users'][aux]];
			for (var j = 0; j < rooms[i]['users'].length; j++)
			{
				if (j != aux)
				{
					auxUsers.push(rooms[i]['users'][j]);
					auxUsersIds.push(rooms[i]['usersIds'][j]);
					auxUsersPoints.push(rooms[i]['usersPoints'][j]);
				}
			}
			for (var j = 0; j < rooms[i]['usersTurns'].length; j++)
			{
				if (j != aux)
				{
					auxUsersTurns.push(rooms[i]['usersTurns'][j]);
				}
			}
			for (var j = 0; j < rooms[i]['usersUsed'].length; j++)
			{
				if (j != aux)
				{
					auxUsersUsed.push(rooms[i]['usersUsed'][j]);
				}
			}
			rooms[i]['users'] = [...auxUsers];
			rooms[i]['usersIds'] = [...auxUsersIds];
			rooms[i]['usersPoints'] = [...auxUsersPoints];
			rooms[i]['usersTurns'] = [...auxUsersTurns];
			rooms[i]['usersUsed'] = [...auxUsersUsed];
		}
	}
	return r;
}
function extractUserName(message)
{
	var tmp = '';
	for (var i = 0; i < message['user'].split('_').length - 1; i++)
	{
		tmp += message['user'].split('_')[i];
	}
	message['user'] = tmp;
}
function usersInRoom(rc, used = [])
{
	var r = [];
	for (var i = 0; i < rooms.length; i++)
	{
		if (rc == rooms[i]['roomCode'])
		{
			for (var j = 0; j < rooms[i]['users'].length; j++)
			{
				if (used.indexOf(rooms[i]['users'][j]) == -1)
				{
					r.push(rooms[i]['users'][j]);
				}
			}
		}
	}
	return r;
}
function searchRoomCode(rc, newUser = true, type = null)
{
	for (var i = 0; i < rooms.length; i++)
	{
		//if ((rc == '') && (!rooms[i]['private']))
		if ((rc == '') && (!rooms[i]['private']) && ((!rooms[i]['full']) || (!newUser)))
		{//Cuando se busca un room aleatorio.
			return i;
		}
		else
		{
			//if (rc == rooms[i]['roomCode'])
			//if ((rc == rooms[i]['roomCode']) && (!rooms[i]['full']))
			if (rc == rooms[i]['roomCode'])
			{
				if (newUser)
				{
					if (!rooms[i]['full'])
					{
						return i;
					}
				}
				else
				{
					if (type == 'rematch')
					{
						rooms[i]['full'] = false;
					}
					return i;
				}
			}
		}
	}
	return -1;
}
function generateRoomCode()
{
	//175dPAYrwNpF
	var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	var rc = '';
	for (var i = 0; i < 12; i++)
	{
		rc += characters[Math.floor(Math.random() * Math.floor(characters.length))];
	}
	if (searchRoomCode(rc) != -1)
	{
		generateRoomCode();
	}
	else
	{
		return rc;
	}
}
module.exports.userDisconected = userDisconected;
module.exports.extractUserName = extractUserName;
module.exports.usersInRoom = usersInRoom;
module.exports.searchRoomCode = searchRoomCode;
module.exports.generateRoomCode = generateRoomCode;
module.exports.rooms = rooms;