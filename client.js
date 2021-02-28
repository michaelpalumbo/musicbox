const WebSocket = require('ws');
const username = require('username')
const maxapi = require('max-api')
let ws; // keep this here
const ReconnectingWebSocket = require('reconnecting-websocket');


let name;
(async () => {
    name = await username()
    maxapi.post(name +  ' connecting to server')
})();

// const serverIP = `ws://localhost:8081`;
const serverIP = `ws://musicbox-dino.herokuapp.com/8081`;
    // options for the reconnecting websocket
    const rwsOptions = {
        // make rws use the webSocket module implementation
        WebSocket: WebSocket, 
        // ms to try reconnecting:
        connectionTimeout: 1000,
        //debug:true, 
    }

    // create a websocket
    // console.log(`attempting to connect to server at ${serverIP}`)
    ws = new ReconnectingWebSocket(serverIP, [], rwsOptions);

    // if the server responds with an error
    ws.addEventListener('error', () => {
        //maxapi.post(`connection error: ${serverIP}`);
       
    });
    // on successful connection to server:
    ws.addEventListener('open', () => {
        maxapi.outlet('connectionStatus', 1)

    });
    // on close:
    ws.addEventListener('close', () => {
		maxapi.outlet('connectionStatus', 0)
        //maxapi.post("server connection closed");
        // localSend.close();
        // localReceive.close();
    });
    // handle messages
    ws.addEventListener('message', (data) => {
        //maxapi.post(data)
        let msg = JSON.parse(data.data);

        switch (msg.cmd){

            case 'cubeSend':
                if(msg.name != name){
                    maxapi.outlet(msg.data)
                } else{
                    // ignore messages originating from this instance
                }
            break;
            
            case "cubeState":

                if(msg.name != name){
                    // maxapi.outlet(msg.data)

                    // pass the selected cubes out
                    let selected = msg.data.selectedCubes
                    maxapi.post('cubes', selected)
                    //iterate thru the cube array, passing it out to the patch
                    for(i=0;i<selected.length;i++){
                        // for some reason, the '1' values are strings
                        if(typeof selected[i] == 'string'){
                            maxapi.post('target', i, parseInt(selected[i]))
                            maxapi.outlet('startArray', i, parseInt(selected[i]))
                        } else {
                            maxapi.outlet('startArray', i, selected[i])
                        }
                        
                    }
                    maxapi.outlet(msg.data.selectedCubes)

                    // pass any position data
                    let positions = Object.keys(msg.data.position)
                    for (const pos of positions) {
                    //console.log(pos)
                    maxapi.outlet(msg.data.position[pos])

                    }

                    let rotations = Object.keys(msg.data.rotate)
                    for (const rot of rotations) {
                    //console.log(pos)
                        maxapi.outlet(msg.data.rotate[rot])

                    }
                } else{
                    // ignore messages originating from this instance
                }

                //todo: iterate through msg.data.rotate and -position and pass each entry out
            break
            default:
                // inform user that unknown message commang used
                console.log('client sent message with unknown cmd: ' + msg)
            break;
        }
    });

maxapi.addHandler("cubeSend", (msg) => {
    
    ws.send(JSON.stringify({
        cmd: 'cubeSend',
        data: msg,
        name: name

    }))
});
