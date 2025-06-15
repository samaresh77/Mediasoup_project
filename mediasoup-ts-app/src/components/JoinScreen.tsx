import React, { useState } from 'react';
import io, { type Socket } from 'socket.io-client';

interface JoinScreenProps {
  onJoin: (socket: typeof Socket, username: string, roomId: string) => void | Promise<void>;
}

const JoinScreen: React.FC<JoinScreenProps> = ({ onJoin }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  const handleJoin = () => {
    if (username && roomId) {
      const socket = io('http://localhost:5000');
      onJoin(socket, username, roomId);
    }
  };

  return (
    <div className="join-screen">
      <h2>Join Room</h2>
      <input
        type="text"
        placeholder="Enter your name"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleJoin}>Join</button>
    </div>
  );
};

export default JoinScreen;