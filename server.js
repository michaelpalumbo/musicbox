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

//TODO
let cubeState = {
    selectedCubes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rotate: {},
    position: {}
}
wss.on('connection', function connection(ws) {
    console.log('new connection established, sending current state', cubeState)
    ws.send(JSON.stringify({
        cmd: "cubeState",
        data: cubeState
    }))
  ws.on('message', function incoming(message) {
    msg = JSON.parse(message)
        // console.log(msg)

        switch (msg.cmd){

            // in case you want to receive other data and route it elsewhere
            case 'cubeSend':
                console.log(msg)
                let data = msg.data.split(' ')
                
                switch(data[0]){
                    case "selectedCubes":
                        let index = msg.data.split(' ')[1]
                        cubeState.selectedCubes[index] = msg.data.split(' ')[2]
                        console.log(cubeState)
                    break

                    case "spatial":
                        let spatialdata = data
                        spatialdata.shift()
                        let cube = spatialdata[0]
                        
                        switch(spatialdata[1]){
                            case "rotate":
                                cubeState.rotate[cube] = msg.data
                            break

                            case "position":
                                cubeState.position[cube] = msg.data
                            break
                        }
                        // cubeState.rotate = msg.data
                        console.log(spatialdata)
                    break

                    case "position":
                        cubeState.position = msg.data
                    break
                }
                broadcast(JSON.stringify({
                    cmd: "cubeSend",
                    data: msg.data,
                    name: msg.name
                }))
                
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

