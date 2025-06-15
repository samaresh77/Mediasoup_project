import React, { useState, useEffect } from 'react';
import JoinScreen from './components/JoinScreen';
import Controls from './components/Controls';
import ParticipantView from './components/ParticipantView';
import * as mediasoupClient from 'mediasoup-client';
import { Socket } from 'socket.io-client/build/esm/socket';
import { Participant } from './types';

const App: React.FC = () => {
  const [joined, setJoined] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (socket) {
      socket.on('newParticipant', (participant: Participant) => {
        setParticipants(prev => [...prev, participant]);
      });

      socket.on('participantLeft', (participantId: string) => {
        setParticipants(prev => prev.filter(p => p.id !== participantId));
      });
    }

    return () => {
      socket?.off('newParticipant');
      socket?.off('participantLeft');
    };
  }, [socket]);

  const handleJoin = async (socket: Socket, username: string, roomId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
      
      setLocalStream(stream);
      setSocket(socket);
      setRoomId(roomId);
      setUsername(username);
      setJoined(true);
      
      // Add local participant
      setParticipants([{ id: 'local', stream }]);
      
      // Initialize MediaSoup client
      const device = new mediasoupClient.Device();
      const routerRtpCapabilities = await fetchRouterRtpCapabilities();
      await device.load({ routerRtpCapabilities });
      
      // Transport creation logic here

    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const fetchRouterRtpCapabilities = async () => {
    const response = await fetch('http://localhost:5000/rtp-capabilities');
    return response.json();
  };

  return (
    <div className="app">
      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : localStream ? (
        <>
          <ParticipantView participants={participants} />
          <Controls
            localStream={localStream}
            socket={socket!}
            roomId={roomId}
            username={username}
          />
        </>
      ) : null}
    </div>
  );
};

export default App;