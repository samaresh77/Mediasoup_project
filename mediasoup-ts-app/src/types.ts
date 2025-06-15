export interface Participant {
    id: string;
    stream: MediaStream;
  }
  
  export interface TransportOptions {
    id: string;
    iceParameters: object;
    iceCandidates: object[];
    dtlsParameters: object;
  }