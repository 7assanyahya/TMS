import { setOrganizer, getOrganizer, getAllOrganizers } from '../config/redis.js';
import { isMongoConnected } from '../config/db.js';
import ReportLog from '../models/ReportLog.js';
import CommandLog from '../models/CommandLog.js';

const socketToOrganizer = new Map();

async function broadcastOrganizers(io) {
    const organizers = await getAllOrganizers();
    io.emit('organizers:update', organizers);
}

export function registerSocketHandlers(io) {
    io.on('connection', async (socket) => {
        socket.emit('organizers:sync', await getAllOrganizers());

        socket.on('organizer:join', async ({ id, name, lat, lng }) => {
            socketToOrganizer.set(socket.id, id);
            socket.join(`organizer:${id}`);

            const existing = await getOrganizer(id);
            const organizer = existing || {
                id,
                name,
                lat: lat ?? 24.7136,
                lng: lng ?? 46.6753,
                status: 'clear',
                presence: 'active',
                online: true,
            };
            organizer.online = true;
            organizer.name = name;
            await setOrganizer(id, organizer);
            await broadcastOrganizers(io);
        });

        socket.on('organizer:location', async ({ id, lat, lng }) => {
            const organizer = await getOrganizer(id);
            if (!organizer) return;
            organizer.lat = lat;
            organizer.lng = lng;
            await setOrganizer(id, organizer);
            await broadcastOrganizers(io);
        });

        socket.on('organizer:status', async ({ id, status }) => {
            const organizer = await getOrganizer(id);
            if (!organizer) return;
            organizer.status = status;
            await setOrganizer(id, organizer);
            await broadcastOrganizers(io);

            if (isMongoConnected()) {
                ReportLog.create({
                    organizerId: id,
                    organizerName: organizer.name,
                    status,
                    lat: organizer.lat,
                    lng: organizer.lng,
                }).catch((err) => console.warn('[mongo] failed to write report log:', err.message));
            }
        });

        socket.on('organizer:presence', async ({ id, presence }) => {
            const organizer = await getOrganizer(id);
            if (!organizer) return;
            organizer.presence = presence;
            await setOrganizer(id, organizer);
            await broadcastOrganizers(io);
        });

        socket.on('manager:command', async ({ organizerId, message }) => {
            if (!organizerId || !message) return;
            io.to(`organizer:${organizerId}`).emit('command:received', {
                message,
                timestamp: Date.now(),
            });

            if (isMongoConnected()) {
                CommandLog.create({ organizerId, message }).catch((err) =>
                    console.warn('[mongo] failed to write command log:', err.message)
                );
            }
        });

        socket.on('disconnect', async () => {
            const id = socketToOrganizer.get(socket.id);
            socketToOrganizer.delete(socket.id);
            if (!id) return;

            const organizer = await getOrganizer(id);
            if (organizer) {
                organizer.online = false;
                await setOrganizer(id, organizer);
                await broadcastOrganizers(io);
            }
        });
    });
}
