import { io } from 'socket.io-client';

function createConnection(urlService) {
    const connection = io(urlService);
    return connection;
}

const wssServerUrl = 'wss://0.0.0.0:6969';
const httpsServerUrl = 'https://0.0.0.0:6969';

const serverConnection = createConnection('wss://0.0.0.0:6969');

serverConnection.on('connect', () => {
    console.log(`Create connection: ${serverConnection.id}`);
});

serverConnection.on('createConnection', (roomId)=>{
    console.log(`Add to room: ${roomId}`);
});

serverConnection.on('webrtc-message', async(message) => {
    ////
    // if (message.answer)
    // if (message.offer)
    // if (message.iceCandidate)
})

var clients = [];

serverConnection.on('clientsChanged', async () => {
    const urlRequest = `${httpsServerUrl}/connections`;
    const response = await fetch(urlRequest);
    const data = await response.json();
    clients = data.clients.filter(
        (remoteClient) => remoteClient !== serverConnection.id 
    );
    if(clients.length > 0){
        createRTCConnection(clients[0]);
    }
});

async function createRTCConnection(called) {
    const caller = serverConnection.id;
    const urlRequest = `${httpsServerUrl}/connections?caller=${caller}&called=${called}`;
    await fetch(urlRequest, { method: 'put' });
}

/////

// async function openInterviewConnection() {
//     // this.setAttribute('status', 'working');
//     localStream.getTracks().forEach((track) => peerConnection.addTrack(track));
//     const offer = await createConnectionOffer();
//     serverConnection.emit('webrtc-request', {
//         id: serverConnection.id, //....
//         offer: offer
//     })

// }

var localStream = null;
var remoteStream = null;
var dataChannel = null;
var peerConnection = createInterviewConnection();

function setLocalVideo() {
    const constraints = { video: true, audio: true };
    localStream = navigator.mediaDevices.getUserMedia(constraints);
}

async function stopStream(stream) {
    if(stream != null) {
        stream.getTracks.forEach(function(track) {
            track.stop();
        });
    localStream = null;
    }
}

async function clearLocalVideo() {
    stopStream(localStream);
}

async function clearRemoteVideo() {
    stopStream(remoteStream);
}

function setRemoteVideo() {
    const remoteVideoElement = document.getElementById('remote_view1234');
    const remoteStream = new MediaStream();
    remoteVideoElement.srcObject = remoteStream;
    ///????
}



function createInterviewConnection() {
    const iceServers = [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
        { url: 'stun:stun2.l.google.com:19302' },
        { url: 'stun:stun3.l.google.com:19302' },
        { url: 'stun:stun4.l.google.com:19302' },
        {
          url: 'turn:numb.viagenie.ca',
          credential: 'muazkh',
          username: 'webrtc@live.com',
        },
        {
          url: 'turn:192.158.29.39:3478?transport=udp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
        {
          url: 'turn:192.158.29.39:3478?transport=tcp',
          credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
          username: '28224511:1379330808',
        },
      ];

    const configuration = { iceServers: iceServers };
    const peerConnection = new RTCPeerConnection(configuration);

    dataChannel = peerConnection.createDataChannel('chat', {negotiated: true, id:0 });
    dataChannel.onmessage = function(event) {
        document.getElementById('textInput').value = event.data;
    }

    peerConnection.addEventListener('icecandidate', (event) => {
        if(event.candidate) {
            serverConnection.emit('webrtc-request'), {
                id: serverConnection.id, ///?
                iceCandidate: event.candidate
            };
        }
    });

    peerConnection.addEventListener('connectionstatechange', (event)=>{
        if (peerConnection.connectionState === 'connected') {
            console.log('Peers connected!');
        }
    });

    peerConnection.addEventListener('track', (event)=>{
        remoteStream.addTrack(event.track); ////
    });

    return peerConnection;
}

async function openInterviewConnection() {
    // setAttribute status working
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track));
    const offer = await createConnectionOffer();
    serverConnection.emit('webrtc-request', {
        id: serverConnection.id, //>>>>????
        offer: offer
    });

}

async function createConnectionOffer() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
}

async function createConnectionAnswer() {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
}

async function handleRemoteOffer(offer) {
    ////setAttribute status working
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track));
    peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await createConnectionAnswer();
    serverConnection.emit('webrtc-request', {
        id: serverConnection.id, /////dgfdg
        answer: answer
    });
}

async function handleRemoteAnswer(answer) {
    const remoteDescription = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(remoteDescription);
}

async function handleICECandidate(iceCandidate) {
    try {
        await peerConnection.addIceCandidate(iceCandidate);
    } catch (e) {
        console.error('error add ice candidate', e);
    }
}

// async function createConnectionOffer() {
//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     return offer;
// }

// async function createConnectionAnswer() {
//     const answer = peerConnection.createAnswer();
//     await peerConnection.setLocalDescription(answer);
//     return answer;
// }

async function handleStartInterview() {
    openInterviewConnection();
}

window.handleStartInterview = handleStartInterview;

async function handleStopInterview() {
    //// status ready
}

function prepare() {
    setLocalVideo().then(()=>{setRemoteVideo();});
    // setRemoteVideo();
}

window.prepare = prepare;