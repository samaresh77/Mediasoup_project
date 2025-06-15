import express from 'express';
import http from 'http';
import { Server } from 'ws';
import mediasoup from 'mediasoup';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

interface Worker {
  worker: mediasoup.types.Worker;
  router: mediasoup.types.Router;
}

const workers: Worker[] = [];
let nextWorkerIndex = 0;

// Initialize Mediasoup workers
async function initializeWorkers() {
  const numWorkers = parseInt(process.env.MEDIASOUP_NUM_WORKERS || '4');
  
  for (let i = 0; i < numWorkers; i++) {
    
    const worker = await mediasoup.createWorker({
      logLevel: 'debug',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
  });

  console.log('Worker created:', worker);
    
    // const router = await worker.createRouter({
    //   mediaCodecs: [
    //     {
    //       kind: 'audio',
    //       mimeType: 'audio/opus',
    //       clockRate: 48000,
    //       channels: 2
    //     },
    //     {
    //       kind: 'video',
    //       mimeType: 'video/VP8',
    //       clockRate: 90000,
    //       parameters: {
    //         'x-google-start-bitrate': 1000
    //       }
    //     }
    //   ]
    // });
    
    // workers.push({ worker, router });
  }
}

const rooms = new Map<string, {
  router: mediasoup.types.Router;
  peers: Map<string, {
    transports: Map<string, mediasoup.types.Transport>;
    producers: Map<string, mediasoup.types.Producer>;
    consumers: Map<string, mediasoup.types.Consumer>;
  }>;
}>();

wss.on('connection', (ws) => {
  ws.on('message', async (message: string) => {
    const data = JSON.parse(message);
    switch (data.type) {
      case 'createRoom':
        const roomId = data.roomId;
        const worker = workers[nextWorkerIndex % workers.length];
        nextWorkerIndex++;
        
        rooms.set(roomId, {
          router: worker.router,
          peers: new Map()
        });
        
        ws.send(JSON.stringify({ type: 'roomCreated', roomId }));
        break;
        
      case 'join':
        const { roomId: joinRoomId, peerId } = data;
        const room = rooms.get(joinRoomId);
        if (!room) {
          ws.send(JSON.stringify({ type: 'error', message: 'Room not found' }));
          return;
        }
        
        // Create WebRTC transport
        const transport = await room.router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        });
        
        room.peers.set(peerId, {
          transports: new Map([[transport.id, transport]]),
          producers: new Map(),
          consumers: new Map()
        });
        
        ws.send(JSON.stringify({
          type: 'transportCreated',
          transportOptions: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
          }
        }));
        break;
        
      // Add other cases (produce, consume, etc.)
    }
  });
});

initializeWorkers().then(() => {
  server.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
  });
});