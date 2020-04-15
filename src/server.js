const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const pokemons = require("./model/pokemons");
const party = require("./model/party");
const user = require("./model/user");
const msg = require("./model/message");
var HashMap = require('hashmap');


const PORT = process.env.PORT || 3000;
const app = express();

let http = require('http');
const server = require('http').createServer(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
const io = require('socket.io')(server);
rooms = new HashMap();
let tokens = ["TEST"];
let tpokemons = new pokemons();
let tmessage = new msg();
let tuser = new user(0,"toto", tpokemons.pokemonsList[0].name, false);
let tparty = new party(tokens[0], tpokemons, [tuser], tuser);
let tpartyList = new HashMap();
tpartyList.set(tokens[0], tparty);
addrooms(tokens[0]);



app.get('/', function (req, res) {
  res.send('Hello from server')
});




io.on("connection", (socket) => {
  console.log('user connected');

  socket.on('new-connection', (message) => {
    console.log('new connection');


    gameId = message.id;
    console.log(tpartyList.get(gameId));
  //  const message2send = new msg(gameId, "server", message.status, tpartyList.get(gameId).users)
  

  //  socket.emit('New-subconnection', message2send);


  });
  socket.on('disconnect', function () {
    console.log('Got disconnect!');
  });

});


function addrooms(id) {
  console.log("in : " + id);
  const subroom = io.of('/' + id)
  rooms.set(id, subroom);
  subroom.on('connection', function (s) {
    console.log('sub connection');
    console.log(s.nsp.name);
    console.log(s.id);
    const message2send = new msg(id, "server", null, tpartyList.get(id).users);
    subroom.emit('update-players', message2send);
    console.log(tpartyList.get(id).users)
    console.log("updated players sent");
   
    s.on('new-player', (message) => {

      const newPlayer = new user(message.content.id,message.content.username, message.content.pokemon, message.content.isMainUser)
      const gameId = message.id;
      let message2send;
      let test = false; /* le user id du joueur est déjà connu ?  */
      let oldUser;
    
      for (let index = 0; index < tpartyList.get(gameId).users.length; index++) {
        if (tpartyList.get(gameId).users[index].id=== message.content.id) {
          test = true
      
        } 
      }

      if (test) {
        let test2 = true; /* ce username n'a pas encore été utilisé par un autre joueur ?*/
       for (let index = 0; index < tpartyList.get(gameId).users.length; index++) {
          if ((tpartyList.get(gameId).users[index].id != newPlayer.id) &&(tpartyList.get(gameId).users[index].usermane=== newPlayer.username)){
            test2 = false
            console.log("user name deja pris : " + u.usermane)
          } 
        }
        if(test2) {

          for (let index = 0; index < tpartyList.get(gameId).users.length; index++) {
            if (tpartyList.get(gameId).users[index].id=== message.content.id) {
            tpartyList.get(gameId).users[index]= new user(message.content.id,message.content.username, message.content.pokemon, message.content.isMainUser);;
            
          }
          }
              
          if(newPlayer.pokemon ==="inconnu") {
            message2send = new msg(gameId, "server", message.status, "OK -"+newPlayer.username);
            subroom.emit('update-players', message2send);
            console.log("updated players sent");
          }else {
            message2send = new msg(gameId, "server", message.status, tpartyList.get(gameId).users);
            subroom.emit('update-players', message2send);
            console.log("updated players sent");
          }
        } else {
          message2send = new msg(gameId, "server", message.status, "KO -"+newPlayer.username);
          subroom.emit('update-players', message2send);
          console.log("updated players sent");
        }
      } else {
        let test3 = true; /* ce username n'a pas encore été utilisé par un autre joueur*/

        for (let index = 0; index < tpartyList.get(gameId).users.length; index++) {
          if (tpartyList.get(gameId).users[index].username=== message.content.username) {
            test3 = false
           
          } 
        }
        if(test3) {
          tpartyList.get(gameId).users.push(newPlayer);
          if(newPlayer.pokemon ==="inconnu") {
            message2send = new msg(gameId, "server", message.status, "OK -"+newPlayer.username);
            subroom.emit('update-players', message2send);
            console.log("updated players sent");
          }else {
            message2send = new msg(gameId, "server", message.status, tpartyList.get(gameId).users);
            subroom.emit('update-players', message2send);
            console.log("updated players sent");
          }
        } else {
          message2send = new msg(gameId, "server", message.status, "KO -"+newPlayer.username);
          subroom.emit('update-players', message2send);
          console.log("updated players sent");
        }
      }
      console.log(tpartyList.get(gameId).users);
    });
    s.on('start-party', (message) => {

      const message2send = new msg(gameId, "server", message.status, message)
      console.log(message.from);

      subroom.emit('start-party', message2send);
      console.log("start-party sent");
    });
    s.on('update-party', (message) => {

      const message2send = new msg(gameId, "server", message.status, message)
      console.log(message.from);

      subroom.emit('update-party', message2send);
      console.log("update-party sent");
    });
    
    s.on('new-message', (message) => {
      const gameId = message.id;
      const message2send = new msg(gameId, "server", message.status, message)
      console.log(message.from);
      subroom.emit('new-message', message2send);
      console.log("new-message sent");
    });

    s.on('disconnect', function () {
      console.log('Got disconnect!');
    });
  });
}

app.post('/checktoken', function (req, res) {
  console.log(req.body)
  const mes = req.body['message'];

  tokens.includes(mes) ? res.status(200).send({ "message": "OK token -" + mes }) : res.status(200).send({ "message": "Error token - " + mes });
  //addrooms(mes);
});
app.post('/checkusername', function (req, res) {
  console.log(req.body)
  const mes = req.body['message'];
  const test = false;
  mes = mes.split("-");
  tpartyList.get(mes[0]).users.forEach(user => {
    if(user.username=mes[1]){
      test = true
    }
    
  });
  
 test ? res.status(200).send({ "message": "OK username -" + mes }) : res.status(200).send({ "message": "Error username -" + mes  });
  //addrooms(mes);
});
app.post('/checkuserid', function (req, res) {
  console.log(req.body)
  const mes = req.body['message'];
  const test = false;
  mes = mes.split("-");
  tpartyList.get(mes[0]).users.forEach(user => {
    if(user.id=mes[1]){
      test = true
    }
    
  });
  
 test ? res.status(200).send({ "message": "OK username -" + mes }) : res.status(200).send({ "message": "Error username -" + mes  });
  //addrooms(mes);
});
app.post('/newtoken', function (req, res) {
  let token = generatetoken();
  tokens.push(token);
  let tparty = new party(token, new pokemons(), [], null);
  tpartyList.set(token, tparty);
  addrooms(token);
  console.log(tokens)
  res.status(200).send({ "message": "New token -" + token });
});

app.post('/viewtokens', function (req, res) {
  console.log(tokens)
  res.status(200).send({ "message": "all tokens -" + tokens });
});

app.post('/cleanAllTokens', function (req, res) {
  tokens = ["TEST"];
  console.log(tokens)
  res.status(200).send({ "message": "clean tokens -" + tokens });
});



function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function generatetoken() {
  var result = "";
  var i;
  for (i = 0; i < 6; i++) {
    result = result + String.fromCharCode(65 + getRandomInt(25));
  }
  return result;
}

server.listen(PORT, () => {
  console.log(`started on port: ${PORT}`);
});
