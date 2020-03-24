const bodyParser = require('body-parser');
const cors = require('cors')
let express = require('express')
let app = express();

app.use(bodyParser.json());
app.use(cors())
let http = require('http');
let server = http.Server(app);

//let socketIO = require('socket.io');
//let io = socketIO(server);

const port = process.env.PORT || 3000;

const games = {};
let tokens = ["TEST"];


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
console.log('server running');

app.post('/checktoken', function (req, res) {
  console.log(req.body)
  tokens.includes(req.body) ? res.status(200).send({ "message": "OK token -" + req.body }) : res.status(200).send({ "message": "Error token - " + req.body });
})
app.post('/newtoken', function (req, res) {
  let token = generatetoken();
  tokens.push(token);
  console.log(tokens)
  res.status(200).send({ "message": "New token -" + token });
})
io.on("connection", (socket) => {
  console.log('user connected');

  socket.on('new-connection', (message) => {
    console.log(message);
    const gameId = message.id;
    // games[gameId] = gameId;
    io.emit('new-connection-' + gameId, message);
  });

  socket.on('new-message', (message) => {
    console.log(message);
    const gameId = message.id;
    io.emit('new-message-' + gameId, message);
  });

  /*let previousId;
  const safeJoin = currentId => {
    socket.leave(previousId);
    socket.join(currentId);
    previousId = currentId;
  };

  socket.on("getDoc", docId => {
    safeJoin(docId);
    console.log(' get doc');
    socket.emit("document", documents[docId]);
  });

  socket.on("addDoc", doc => {
      console.log('add doc');
    documents[doc.id] = doc;
    safeJoin(doc.id);
    io.emit("documents", Object.keys(documents));
    socket.emit("document", doc);
  });

  socket.on("editDoc", doc => {
      console.log('edit doc');
    documents[doc.id] = doc;
    socket.to(doc.id).emit("document", doc);
  });

  io.emit("documents", Object.keys(documents));*/
});

server.listen(port, () => {
  console.log(`started on port: ${port}`);
});