//var log = require('./lib/log.js');
//var utils = require('./lib/utils.js');
var game = require('./lib/game.js');
//var internal = require('./lib/internal.js');
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5000;
var rooms = [];
var words = ['Ape','Ants','Badger','Bat','Bear','Bee','Buffalo','Butterfly','Bug','Camel','Cat','Cobra','Crocodile','Crow','Cricket','Dog','Donkey','Eagle','Elephant','Elk','Falcon','Ferret','Fish','Flamingo','Fox','Frog','Fly','Goose','Giraffe','Gorilla','Hippo','Hyena','Hopper','Jaguar','Jellyfish','Kangaroo','Kitten','Lemur','Leopard','Lion','Lice','Monkey','Mule','Otter','Ox','Owl','Parrot','Pig','Rabbit','Rat','Raven','Rhino','Shark','Skunk','Snake','Squirrel','Stingray','Swan','Scorpion','Spider','Seagull','Sparrow','Swallow','Tiger','Turkey','Turtle','Weasel','Whale','Wolf','Worm','Zebra','Açaí','Apple','Apricot','Avocado','Banana','Bilberry','Blackberry','Blueberry','Cactus pear','Currant','Cherry','Cloudberry','Coconut','Cranberry','Date','Dragonfruit','Durian','Elderberry','Fig','Goji berry','Gooseberry','Grape','Raisin','Grapefruit','Guava','Jackfruit','Jambul','Kiwifruit','Kumquat','Lemon','Lime','Lychee','Mango','Mangosteen','Melon','Watermelon','Nectarine','Orange','Mandarine','Tangerine','Papaya','Passionfruit','Peach','Pear','Plum','Pineapple','Pomegranate','Pomelo','Raspberry','Rambutan','Redcurrant','Strawberry','Volcano','Mountain','Hill','Sea','Ocean','Lake','River','Waterfall','Jungle','Forest','Rainforest','Tsunami','Rose','Tulip','Calla Lilies','Peony','Gardenia','Sunflower','Daisy','Dandelion','Cosmos','Solar system','Milky way','Galaxy','Sun','Moon','Meteoroid','Northern lights','Stars','Pine','Oak','Birch','Spruce','Chestnut tree','Willow tree','Mold','Grass'];
var rounds = 10;
var puntuation = 10;
var maxUsers = 10;
server.listen(port, () => {
  console.log('Server listening at port %d', port);
});
app.use(express.static(path.join(__dirname, 'public')));
io.on('connection', (socket) => {
  console.log(socket.id);
	var addedUser = false;
	socket.on('new message', (data) => {
		socket.broadcast.emit('new message', {
			username: socket.username,
			message: data
		});
	});
	socket.on('update', (data) => {
    console.log(socket.id);
		//console.log('Line 35: ' + data);
		var message = JSON.parse(data);
		var private = false;
		var flagAddRoom = false;
		if ((message['user'].split('_').length < 1) || (message['user'].split('_')[message['user'].split('_').length - 1] == ''))
		{//Código no especificado
			if (game.searchRoomCode('') != -1)
			{
				index = game.searchRoomCode('');
				message['roomCode'] = game.rooms[game.searchRoomCode('')]['roomCode'];
			}
			else
			{
				message['roomCode'] = game.generateRoomCode();
				flagAddRoom = true;
			}
			game.extractUserName(message);
		}
		else
		{
			message['roomCode'] = message['user'].split('_')[message['user'].split('_').length - 1];
			game.extractUserName(message);
			if (message['roomCode'] != 'private')
			{
				if (game.searchRoomCode(message['roomCode']) != -1)
				{
					index = game.searchRoomCode(message['roomCode']);
				}
				else
				{//Pendiente hacer visible el error.
					message['type'] = 'error';
					message['error'] = 'Error: The code \'' + message['roomCode'] + '\' was not found.';
				}
			}
			else
			{
				message['roomCode'] = game.generateRoomCode();
				flagAddRoom = true;
				private = true;
			}
		}
		if (flagAddRoom)
		{
			//console.log('Añadiendo: ' + socket.id);
			game.rooms.push({
				'roomCode' : message['roomCode'], 
				'users' : [message['user']], 
				'usersIds' : [socket.id], 
				'usersPoints' : [0], 
				'usersTurns' : [message['user']], 
				'usersUsed' : [], 
				'private' : private, 
				'full' : false, 
				'selectedUser' : '', 
				'round' : [1, rounds]
			});
			message['usersInRoom'] = [...game.rooms[game.rooms.length - 1]['users']];
		}
		else
		{
			if (index != undefined)
			{
				if (game.rooms[index]['users'].indexOf(message['user']) != -1)
				{//Pendiente revisar en todos los rooms si está el usuario.
					message['type'] = 'error';
					message['error'] = 'Error: The player \'' + message['user'] + '\' is in the game.';
				}
				else
				{
					if ((message['user'] != undefined) && (message['user'] != ''))
					{
						game.rooms[index]['users'].push(message['user']);//Esto se hace cuando hay más de un usuario.
						if (game.rooms[index]['users'].length == maxUsers)
						{
							game.rooms[index]['full'] = true;
						}
            game.rooms[index]['usersIds'].push(socket.id);
						game.rooms[index]['usersPoints'].push(0);
						message['usersInRoom'] = [...game.rooms[index]['users']];
						if (game.rooms[index]['selectedUser'] == '')
						{//Esto se haría al principio.
							game.rooms[index]['usersUsed'] = [];
							game.rooms[index]['round'] = [1, rounds];
							game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
							if (game.rooms[index]['usersTurns'].length)
							{
								game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
								game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
								game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

								message['selectedUser'] = game.rooms[index]['selectedUser'];
								var aux = [];
								while (aux.length < 5)
								{
									var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
									if (aux.indexOf(w) == -1)
									{
										aux.push(w);
									}
								}
								message['words'] = aux;
								message['round'] = [...game.rooms[index]['round']];
							}
						}
					}
				}
			}
		}
    message['id'] = socket.id;
    socket.emit('update', message);
    socket.broadcast.emit('update', message);
		//console.log(message);
		//console.log(game.rooms);
	});
  socket.on('rematch', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false, message['type']);
    for (var i = 0; i < game.rooms[index]['usersPoints'].length; i++)
    {
      game.rooms[index]['usersPoints'][i] = 0;
    }
    game.rooms[index]['usersUsed'] = [];
    game.rooms[index]['usersTurns'] = [];
    game.rooms[index]['selectedUser'] = '';
    message['usersInRoom'] = [...game.rooms[index]['users']];
    game.rooms[index]['usersUsed'] = [];
    game.rooms[index]['round'] = [1, rounds];
    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
    game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
    game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
    message['selectedUser'] = game.rooms[index]['selectedUser'];
    var aux = [];
    while (aux.length < 5)
    {
      var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
      if (aux.indexOf(w) == -1)
      {
        aux.push(w);
      }
    }
    message['words'] = aux;
    message['round'] = [...game.rooms[index]['round']];
    message['type'] = 'rematch';
    if (game.rooms[index]['users'].length < maxUsers)
    {
      game.rooms[index]['full'] = false;
    }
    message['full'] = game.rooms[index]['full'];
    socket.emit('rematch', message);
    socket.broadcast.emit('rematch', message);
  });
  socket.on('newUserNeedsInfo', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    message['selectedUser'] = game.rooms[index]['selectedUser'];
    message['roomCode'] = game.rooms[index]['roomCode'];
    message['round'] = [...game.rooms[index]['round']];
    message['full'] = game.rooms[index]['full'];
    message['type'] = 'returningGameInfo';
    socket.emit('returningGameInfo', message);
    socket.broadcast.emit('returningGameInfo', message);
  });
  socket.on('wordSelected', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    game.rooms[index]['word'] = message['word'];
    game.rooms[index]['full'] = true;
    message['wordLength'] = message['word'].length;
    message['word'] = null;
    message['words'] = null;
    message['selectedUser'] = game.rooms[index]['selectedUser'];
    message['type'] = 'startDrawing';
    socket.emit('startDrawing', message);
    socket.broadcast.emit('startDrawing', message);
    //console.log(message);
    //console.log(game.rooms);
  });
  socket.on('drawing', (data) => {
    var message = JSON.parse(data);
    socket.emit('drawing', message);
    socket.broadcast.emit('drawing', message);
  });
  socket.on('guess', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    if ((game.rooms[index]['selectedUser'] != message['user']) && (game.rooms[index]['word'] != undefined) && (game.rooms[index]['word'] != null))
    {
      if (game.rooms[index]['word'].toLowerCase() == message['guess'].toLowerCase())
      {
        for (var i = 0; i < game.rooms[index]['users'].length; i++)
        {
          if (game.rooms[index]['users'][i] == message['user'])
          {
            game.rooms[index]['usersPoints'][i] += puntuation;
          }
        }
        message['puntuation'] = game.rooms[index]['usersPoints'];
        game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
        var aux = [];
                  while (aux.length < 5)
                  {
                    var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
                    if (aux.indexOf(w) == -1)
                    {
                      aux.push(w);
                    }
                  }
        if (game.rooms[index]['usersTurns'].length)
                  {
                    game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                    game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

                    message['selectedUser'] = game.rooms[index]['selectedUser'];
              message['words'] = aux;
              message['word'] = game.rooms[index]['word'];
              message['full'] = game.rooms[index]['full'];
              message['type'] = 'nextTurn';
              message['round'] = [...game.rooms[index]['round']];
                  }
        else
        {
          if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
          {
            game.rooms[index]['round'][0] += 1;
            message['round'] = [...game.rooms[index]['round']];
            message['word'] = game.rooms[index]['word'];
            message['full'] = game.rooms[index]['full'];
                      message['type'] = 'nextTurn';
                      message['round'] = [...game.rooms[index]['round']];

                      game.rooms[index]['usersUsed'] = [];
            game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
            if (game.rooms[index]['usersTurns'].length)
                      {
                        game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                        game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                        game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

                        message['selectedUser'] = game.rooms[index]['selectedUser'];
                  message['words'] = aux;
                  message['round'] = [...game.rooms[index]['round']];
                      }
          }
          else
          {
            message['word'] = game.rooms[index]['word'];
            var mayor = [0];
            for (var i = 1; i < game.rooms[index]['users'].length; i++)
            {
              if (game.rooms[index]['usersPoints'][i] > game.rooms[index]['usersPoints'][mayor[0]])
              {
                mayor = [i];
              }
              else
              {
                if (game.rooms[index]['usersPoints'][i] == game.rooms[index]['usersPoints'][mayor[0]])
                {
                  mayor.push(i);
                }
              }
            }
            var ganadores = [[game.rooms[index]['users'][mayor[0]], game.rooms[index]['usersPoints'][mayor[0]]]];
            for (var i = 1; i < mayor.length; i++)
            {
              ganadores.push([game.rooms[index]['users'][mayor[i]], game.rooms[index]['usersPoints'][mayor[i]]]);
            }
            message['puntuation'] = game.rooms[index]['usersPoints'];
            message['winners'] = [...ganadores];
            message['type'] = 'gameOver';
          }
        }
      }
      else
      {
        message['type'] = 'wrongWord';
      }
    }
    else
    {
      message['type'] = 'message';
    }
    socket.emit(message['type'], message);
    socket.broadcast.emit(message['type'], message);
  });
  socket.on('timeOut', (data) => {
    var message = JSON.parse(data);
    index = game.searchRoomCode(message['roomCode'], false);
    message['timeOut'] = true;
    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
    var aux = [];
          while (aux.length < 5)
          {
            var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
            if (aux.indexOf(w) == -1)
            {
              aux.push(w);
            }
          }
    if (game.rooms[index]['usersTurns'].length)
    {
      game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
      game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
      game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
      message['selectedUser'] = game.rooms[index]['selectedUser'];
      message['words'] = aux;
      message['user'] = '';
      message['word'] = game.rooms[index]['word'];
      message['full'] = game.rooms[index]['full'];
      message['type'] = 'nextTurn';
      message['round'] = [...game.rooms[index]['round']];
      message['puntuation'] = game.rooms[index]['usersPoints'];
    }
    else
    {
      if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
      {
        game.rooms[index]['round'][0] += 1;
        message['round'] = [...game.rooms[index]['round']];
        message['user'] = '';
        message['word'] = game.rooms[index]['word'];
        message['full'] = game.rooms[index]['full'];
        message['puntuation'] = game.rooms[index]['usersPoints'];
                message['type'] = 'nextTurn';
                message['round'] = [...game.rooms[index]['round']];

                game.rooms[index]['usersUsed'] = [];
        game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
        if (game.rooms[index]['usersTurns'].length)
                  {
                    game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                    game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                    game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];

                    message['selectedUser'] = game.rooms[index]['selectedUser'];
                    message['words'] = aux;
              message['round'] = [...game.rooms[index]['round']];
                  }
      }
      else
      {
        message['word'] = game.rooms[index]['word'];
        var mayor = [0];
        for (var i = 1; i < game.rooms[index]['users'].length; i++)
        {
          if (game.rooms[index]['usersPoints'][i] > game.rooms[index]['usersPoints'][mayor[0]])
          {
            mayor = [i];
          }
          else
          {
            if (game.rooms[index]['usersPoints'][i] == game.rooms[index]['usersPoints'][mayor[0]])
            {
              mayor.push(i);
            }
          }
        }
        var ganadores = [[game.rooms[index]['users'][mayor[0]], game.rooms[index]['usersPoints'][mayor[0]]]];
        for (var i = 1; i < mayor.length; i++)
        {
          ganadores.push([game.rooms[index]['users'][mayor[i]], game.rooms[index]['usersPoints'][mayor[i]]]);
        }
        message['puntuation'] = game.rooms[index]['usersPoints'];
        message['winners'] = [...ganadores];
        message['type'] = 'gameOver';
      }
    }
    socket.emit(message['type'], message);
    socket.broadcast.emit(message['type'], message);
  });
  socket.on('disconnect', () => {
    console.log(socket.id);
		userInfo = game.userDisconected(socket.id);
    var message = {
      'type' : 'userDisconected', 
      'roomCode' : userInfo[0], 
      'user' : userInfo[1]
    }
    index = game.searchRoomCode(userInfo[0], false);
    if (index != -1)
    {
      if ((game.rooms[index]['selectedUser'] == undefined) || (game.rooms[index]['selectedUser'] == '') || (game.rooms[index]['selectedUser'] == userInfo[1]))
      {
        game.rooms[index]['selectedUser'] = '';
        game.rooms[index]['word'] = null;
        if (game.rooms[index]['usersTurns'].length)
            {
              if (game.rooms[index]['users'].length >= 2)
              {//Cuando se va el selectedUser pero quedan otros.
                game.rooms[index]['selectedUser'] = game.rooms[index]['usersTurns'][Math.floor(Math.random() * Math.floor(game.rooms[index]['usersTurns'].length))];
                message['selectedUser'] = game.rooms[index]['selectedUser'];
                game.rooms[index]['usersUsed'].push(game.rooms[index]['selectedUser']);
                var aux = [];
                while (aux.length < 5)
                {
                  var w = words[(Math.floor(Math.random() * Math.floor(words.length)))];
                  if (aux.indexOf(w) == -1)
                  {
                    aux.push(w);
                  }
                }
                message['words'] = aux;
                message['round'] = [...game.rooms[index]['round']];
                message['full'] = game.rooms[index]['full'];
                message['subType'] = 'reasignedSelectedUser';
              }
            }
            else
            {//No hay turnos disponibles.
              if (game.rooms[index]['users'].length > 1)
              {//Debería pasar a la siguiente ronda o terminar el juego.
                if (game.rooms[index]['round'][0] < game.rooms[index]['round'][1])
                {
                  game.rooms[index]['round'][0] += 1;
                  message['round'] = [...game.rooms[index]['round']];
                  message['word'] = game.rooms[index]['word'];
                  message['full'] = game.rooms[index]['full'];
                  message['subType'] = 'nextTurn';
                  message['round'] = [...game.rooms[index]['round']];
                  game.rooms[index]['usersUsed'] = [];
                  game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
                }
                else
                {
                  message['word'] = game.rooms[index]['word'];
                  message['subType'] = 'gameOver';
                }
              }
              else
              {//Volver al estado inicial.
                game.rooms[index]['round'] = [1, rounds];
              }
            }
      }
      else
      {
        if (!(game.rooms[index]['users'].length > 1))
        {
          if ((game.rooms[index]['word'] != undefined) && (game.rooms[index]['word'] != ''))
          {//El que queda gana por abandono si es que en algún momento se seleccionó una palabra.
            message['word'] = game.rooms[index]['word'];
            message['winners'] = [[game.rooms[index]['users'][0], game.rooms[index]['usersPoints'][0]]];
            message['subType'] = 'gameOver';
          }
          else
          {//Quedó sólamente el selectedUser.
            game.rooms[index]['selectedUser'] = '';
            game.rooms[index]['full'] = false;
          }
        }
      }
      game.rooms[index]['usersTurns'] = [...game.usersInRoom(game.rooms[index]['roomCode'], game.rooms[index]['usersUsed'])];
      message['full'] = game.rooms[index]['full'];
      //Si es la primer ronda, 19 users, full, word null, usersUsed == []
      if ((game.rooms[index]['round'][0] == 1) && game.rooms[index]['full'] && (game.rooms[index]['users'].length < maxUsers)
         && ((game.rooms[index]['word'] == null) || (game.rooms[index]['word'] == undefined))
         && (game.rooms[index]['usersUsed'].length <= 1)
      )
      {
        game.rooms[index]['full'] = false;
      }
      var index;
      for (var i = 0; i < game.rooms.length; i++)
      {
        if (message['roomCode'] == game.rooms[i]['roomCode'])
        {
          index = i;
        }
      }
      if ((index != undefined) && (!game.rooms[index]['usersIds'].length))
      {
        game.rooms[index]['full'] = true;
      }
    }
    socket.broadcast.emit('userDisconected', message);
	});
});
