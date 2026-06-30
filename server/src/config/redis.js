import Redis from 'ioredis';

const ORGANIZERS_KEY = 'tms:organizers';

let redis = null;
let memoryStore = null;

export function connectRedis(url) {
    redis = new Redis(url, {
        lazyConnect: true,
        retryStrategy: () => null,
    });

    redis.on('error', (err) => {
        if (redis) {
            console.warn('[redis] connection failed, falling back to in-memory organizer cache:', err.message);
            redis.disconnect();
            redis = null;
            memoryStore = new Map();
        }
    });

    return redis.connect()
        .then(() => console.log('[redis] connected'))
        .catch(() => {
            console.warn('[redis] unavailable, using in-memory organizer cache');
            redis = null;
            memoryStore = new Map();
        });
}

export async function setOrganizer(id, data) {
    if (redis) {
        await redis.hset(ORGANIZERS_KEY, id, JSON.stringify(data));
    } else {
        memoryStore.set(id, data);
    }
}

export async function getOrganizer(id) {
    if (redis) {
        const raw = await redis.hget(ORGANIZERS_KEY, id);
        return raw ? JSON.parse(raw) : null;
    }
    return memoryStore.get(id) || null;
}

export async function getAllOrganizers() {
    if (redis) {
        const all = await redis.hgetall(ORGANIZERS_KEY);
        return Object.values(all).map((raw) => JSON.parse(raw));
    }
    return Array.from(memoryStore.values());
}

export async function deleteOrganizer(id) {
    if (redis) {
        await redis.hdel(ORGANIZERS_KEY, id);
    } else {
        memoryStore.delete(id);
    }
}
