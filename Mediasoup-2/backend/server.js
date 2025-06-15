const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mediasoup = require('mediasoup');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const mediaCodecs = [
  { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
  { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
];

let worker, router, producerTransport, consumerTransport;

(async function () {
  worker = await mediasoup.createWorker();
  router = await worker.createRouter({ mediaCodecs });
})();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createTransport', async (_, callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: 'YOUR_SERVER_IP' }],
      enableUdp: true,
      enableTcp: true
    });

    transport.on('dtlsstatechange', (state) => {
      if (state === 'closed') transport.close();
    });

    callback({ id: transport.id, iceParameters: transport.iceParameters, iceCandidates: transport.iceCandidates, dtlsParameters: transport.dtlsParameters });
  });

  socket.on('produce', async ({ kind, rtpParameters }, callback) => {
    const producer = await producerTransport.produce({ kind, rtpParameters });
    callback({ id: producer.id });
  });

  socket.on('consume', async ({ rtpCapabilities }, callback) => {
    if (!router.canConsume({ producerId: producerTransport.id, rtpCapabilities })) return callback({ error: 'Cannot consume' });

    const consumer = await consumerTransport.consume({ producerId: producerTransport.id, rtpCapabilities, paused: true });
    callback({ id: consumer.id, producerId: producerTransport.id, kind: consumer.kind, rtpParameters: consumer.rtpParameters });
  });

  socket.on('disconnect', () => console.log(`User disconnected: ${socket.id}`));
});

server.listen(5000, () => console.log('Server running on port 5000'));
