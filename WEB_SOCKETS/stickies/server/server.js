const WebSocketServer = require("ws").Server;
const crypto = require('crypto');
// store all clients
const clients = new Set();


// create server and setup handler for every new connection from a client
const server = new WebSocketServer({ host: "0.0.0.0", port: 8001 });
server.on("connection", (client) => {
  clients.add(client);
  console.log(`new client: ${clients.size} clients connected`);

  // handle errors
  client.on("error", (e) => {
    console.log(e);
  });

  // handle close
  client.on("close", (e) => {
    clients.delete(client);
    console.log(`disconnected client: ${clients.size} clients`);
  });

  // handle new message from client
  client.on("message", (data) => {
    let decoded = JSON.parse(data);
    if(decoded.id === null || decoded.id === "") {
      decoded = {
        ...decoded,
       id: crypto.randomBytes(20).toString('hex')
      }
    }
  
    //notes.set(decoded.id, decoded.text0);
    console.log(`message: ${JSON.stringify(decoded)}`);

    // send the message to all connected clients
    for (const client of clients) {
      client.send(JSON.stringify(decoded));
    }
  });
});

console.log("listening on 0.0.0.0:8001");
