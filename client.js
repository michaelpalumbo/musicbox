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

const serverIP = `ws://localhost:8080`;
// const serverIP = `ws://musicbox-dino.herokuapp.com/8081`;
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
        maxapi.post(`connection error: ${serverIP}`);
       
    });
    // on successful connection to server:
    ws.addEventListener('open', () => {
        maxapi.post(`connected to server at ${serverIP}`)

    });
    // on close:
    ws.addEventListener('close', () => {
        maxapi.post("server connection closed");
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
                    maxapi.post('other user')
                    maxapi.outlet(msg.data)
                } else{
                    // ignore messages originating from this instance
                }
            break;

            default:
                // inform user that unknown message commang used
                console.log('client sent message with unknown cmd: ' + msg)
            break;
        }
    });

maxapi.addHandler("cubeSend", (msg) => {
    maxapi.post('msg',msg)
    ws.send(JSON.stringify({
        cmd: 'cubeSend',
        data: msg,
        name: name
    }))
});
