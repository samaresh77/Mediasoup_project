import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import mediasoupClient from 'mediasoup-client';

const socket = io('http://localhost:5000');

const WebRTC = () => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  let device, producerTransport, consumerTransport, producer;

  useEffect(() => {
    async function init() {
      device = new mediasoupClient.Device();
      
      socket.emit('createTransport', {}, async ({ id, iceParameters, iceCandidates, dtlsParameters }) => {
        producerTransport = device.createSendTransport({ id, iceParameters, iceCandidates, dtlsParameters });

        producerTransport.on('connect', async ({ dtlsParameters }, callback) => {
          socket.emit('connectTransport', { dtlsParameters });
          callback();
        });

        producerTransport.on('produce', async ({ kind, rtpParameters }, callback) => {
          socket.emit('produce', { kind, rtpParameters }, ({ id }) => callback({ id }));
        });

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(async (stream) => {
          localVideoRef.current.srcObject = stream;
          const track = stream.getVideoTracks()[0];
          producer = await producerTransport.produce({ track });
        });
      });

      socket.emit('createTransport', {}, async ({ id, iceParameters, iceCandidates, dtlsParameters }) => {
        consumerTransport = device.createRecvTransport({ id, iceParameters, iceCandidates, dtlsParameters });

        consumerTransport.on('connect', async ({ dtlsParameters }, callback) => {
          socket.emit('connectTransport', { dtlsParameters });
          callback();
        });

        socket.emit('consume', { rtpCapabilities: device.rtpCapabilities }, async ({ id, producerId, kind, rtpParameters }) => {
          const consumer = await consumerTransport.consume({ id, producerId, kind, rtpParameters });
          remoteVideoRef.current.srcObject = new MediaStream([consumer.track]);
        });
      });
    }

    init();
  }, []);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted />
      <video ref={remoteVideoRef} autoPlay />
    </div>
  );
};

export default WebRTC;
