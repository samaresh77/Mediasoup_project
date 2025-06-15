import React, { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { device, TransportOptions } from './mediasoup';

const VideoRoom: React.FC<{ roomId: string }> = ({ roomId }) => {
  const [localStream, setLocalStream] = useState<MediaStream>();
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);
  const socket = useRef<Socket>();
  const transports = useRef<Map<string, mediasoupClient.types.Transport>>(new Map());

  useEffect(() => {
    // Connect to WebSocket
    socket.current = io('http://localhost:3001');
    
    // Get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setLocalStream(stream);
      });
      
    // Handle WebSocket messages
    socket.current.on('transportCreated', async (options: TransportOptions) => {
      await device.load({ routerRtpCapabilities: options.routerRtpCapabilities });
      
      const transport = device.createSendTransport({
        id: options.id,
        iceParameters: options.iceParameters,
        iceCandidates: options.iceCandidates,
        dtlsParameters: options.dtlsParameters,
      });
      
      transports.current.set(transport.id, transport);
      
      transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        socket.current?.emit('connectTransport', {
          transportId: transport.id,
          dtlsParameters,
        }, callback, errback);
      });
      
      transport.on('produce', async (parameters, callback, errback) => {
        socket.current?.emit('produce', {
          transportId: transport.id,
          kind: parameters.kind,
          rtpParameters: parameters.rtpParameters,
        }, ({ id }) => callback({ id }));
      });
      
      // Start producing
      const videoTrack = localStream?.getVideoTracks()[0];
      const audioTrack = localStream?.getAudioTracks()[0];
      
      if (videoTrack) {
        await transport.produce({ track: videoTrack });
      }
      if (audioTrack) {
        await transport.produce({ track: audioTrack });
      }
    });
    
    return () => {
      socket.current?.disconnect();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div>
      <div>
        <h2>Local Video</h2>
        <video autoPlay muted ref={video => {
          if (video && localStream) video.srcObject = localStream;
        }} />
      </div>
      <div>
        <h2>Remote Videos</h2>
        {remoteStreams.map((stream, i) => (
          <video key={i} autoPlay ref={video => {
            if (video) video.srcObject = stream;
          }} />
        ))}
      </div>
    </div>
  );
};

export default VideoRoom;