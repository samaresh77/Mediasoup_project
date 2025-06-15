import express from 'express';
import http from 'http';
import path from 'path';
import { Server } from 'socket.io';

const app = express();
const __dirname = path.resolve();

// Create an HTTP server and attach Express app to it
const server = http.createServer(app);

// Attach Socket.io to the HTTP server
const io = new Server(server);

app.get('/', (req, res) => {
  res.send('Hello Mediasoup!');
});

app.use('/sfu', express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

// Start the HTTP server instead of the Express app
server.listen(PORT, (err) => {
  if (err) {
    console.error('Error starting server:', err);
  } else {
    console.log(`Server is running on https://localhost:${PORT}`);
  }
});

// Socket.io namespace for Mediasoup
const peers = io.of('/mediasoup');
peers.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.emit('connection-success', { success: socket.id });
});
