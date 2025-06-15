import React, { useRef, useEffect } from 'react';
import { Participant } from '../types';

interface ParticipantViewProps {
  participants: Participant[];
}

const ParticipantView: React.FC<ParticipantViewProps> = ({ participants }) => {
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});

  useEffect(() => {
    participants.forEach(participant => {
      const videoElement = videoRefs.current[participant.id];
      if (videoElement && participant.stream) {
        videoElement.srcObject = participant.stream;
      }
    });
  }, [participants]);

  return (
    <div className="participant-view">
      {participants.map(participant => (
        <video
          key={participant.id}
          ref={el => { videoRefs.current[participant.id] = el; }}
          autoPlay
          playsInline
          muted={participant.id === 'local'}
        />
      ))}
    </div>
  );
};

export default ParticipantView;