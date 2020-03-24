const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const pokemons = require("./model/pokemons");
const party = require("./model/party");
const user = require("./model/user");


const PORT = process.env.PORT || 3000;
const app = express();

let http = require('http');
const server = require('http').createServer(app);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
let tokens = ["TEST"];
let tpokemons = new pokemons();
let tuser= new user("toto",tpokemons.pokemonsList[0].name,false);
let tparty = new party (tokens[0],tpokemons,{tuser},tuser);
let tpartyList= {};
tpartyList[tokens[0]]=tparty;
console.log(tpartyList);
console.log(tpartyList["TEST"].users[0].username);

app.get('/', function (req, res) {
    res.send('Hello from server')
});

const io = require('socket.io')(server);


io.on("connection", (socket) => {
    console.log('user connected');
  
    socket.on('new-player', (message) => {
      console.log(message);
      const gameId = message.id;
      const newPlayer = message.content;
      tpartyList[gameId].users.push(newPlayer);
      // games[gameId] = gameId;
      io.emit('update-players' ,tpartyList[gameId].users);
    });
    socket.on('new-connection', (message) => {
      console.log(message);
      const gameId = message.id;
      socket.join(gameId);
      // games[gameId] = gameId;
      io.emit('new-connection-' + gameId, message);
    });
  
    socket.on('new-message', (message) => {
      console.log(message);
      const gameId = message.id;
      io.to(gameId).emit('new-message-' + gameId, message);
    });
  });
  

app.post('/checktoken', function (req, res) {
    console.log(req.body)
    const mes =req.body['message'];
    tokens.includes(mes) ? res.status(200).send({ "message": "OK token -" + mes }) : res.status(200).send({ "message": "Error token - " + mes });
});
app.post('/newtoken', function (req, res) {
    let token = generatetoken();
    tokens.push(token);
    console.log(tokens)
    res.status(200).send({ "message": "New token -" + token });
});
app.post('/viewtokens', function (req, res) {

    console.log(tokens)
    res.status(200).send({ "message": "all tokens -" + tokens });
});

app.post('/cleantokens', function (req, res) {
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
