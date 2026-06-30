import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { connectMongo } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { registerSocketHandlers } from './sockets/index.js';
import areasRouter from './routes/areas.js';

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN },
});
app.set('io', io);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/areas', areasRouter);

registerSocketHandlers(io);

async function start() {
    await connectRedis(process.env.REDIS_URL || 'redis://localhost:6379');
    connectMongo(process.env.MONGODB_URI || 'mongodb://localhost:27017/tms');

    httpServer.listen(PORT, () => {
        console.log(`[server] STMS backend listening on port ${PORT}`);
    });
}

start();
