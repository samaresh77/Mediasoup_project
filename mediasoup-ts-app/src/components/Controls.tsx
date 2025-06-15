import React from 'react';
import { Socket } from 'socket.io-client/build/esm/socket';

interface ControlsProps {
  localStream: MediaStream;
  socket: Socket;
  roomId: string;
  username: string;
}

const Controls: React.FC<ControlsProps> = ({ localStream, socket, roomId, username }) => {
  const [audioEnabled, setAudioEnabled] = React.useState(true);
  const [videoEnabled, setVideoEnabled] = React.useState(true);

  const toggleAudio = () => {
    localStream.getAudioTracks()[0].enabled = !audioEnabled;
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    localStream.getVideoTracks()[0].enabled = !videoEnabled;
    setVideoEnabled(!videoEnabled);
  };

  const leaveRoom = () => {
    socket.emit('leaveRoom', { username, roomId });
    localStream.getTracks().forEach(track => track.stop());
    window.location.reload();
  };

  return (
    <div className="controls">
      <button onClick={toggleAudio}>
        {audioEnabled ? 'Mute' : 'Unmute'}
      </button>
      <button onClick={toggleVideo}>
        {videoEnabled ? 'Stop Video' : 'Start Video'}
      </button>
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
};

export default Controls;