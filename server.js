// const yargs = require('yargs/yargs')
// const { hideBin } = require('yargs/helpers')
// const argv = yargs(hideBin(process.argv)).argv
const username = require('username');
const WebSocket = require('ws');

let host = 'musicbox-dino.herokuapp.com'

let name;
(async () => {
    name = await username()
})();

let listenPort = (process.env.PORT || 8081)

const wss = new WebSocket.Server({ port: listenPort });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    msg = JSON.parse(message)
        // console.log(msg)

        switch (msg.cmd){

            // in case you want to receive other data and route it elsewhere
            case 'cubeSend':
                console.log(msg)
                broadcast(JSON.stringify(msg))
                
            break;

        
            default:
                console.log('client sent message with unknown cmd: ' + msg)
                // ws.send('server received message but did not understand: ' +  msg)
            break;
        }
  });

//   ws.send('something');
});

// we can use this if we want to send to multiple clients!
function broadcast(msg){
    wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
    }
    });
}

