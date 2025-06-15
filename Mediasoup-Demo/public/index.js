const io = require('socket.io-client');
const socket = io('/mediasoup');

socket.on('connection-success', (data) => {
  console.log('Connection success:', data.success);
});

let params = {}

const streamSuccess = async (stream) => {
    localVideo.srcObject = stream
    const track = stream.getVideoTracks()[0]
    params = {
        track,
        ...params
    }
}

const getLocalStream = () => {
    navigator.getUserMedia({
        audio: false,
        video: {
            width: {
                min: 640,
                max: 1920,
            },
            height: {
                min: 400,
                max: 1080,
            }
        }
    }, streamSuccess, error => {
        console.log(error.message)
    })
}

btnLocalVideo.addEventListener('click', getLocalStream);
btnLocalVideoOff.addEventListener('click', () => {
  localVideo.srcObject = null;
  params.track.stop();
});