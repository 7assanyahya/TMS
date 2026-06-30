import mongoose from 'mongoose';

export async function connectMongo(uri) {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
        console.log('[mongo] connected');
    } catch (err) {
        console.warn('[mongo] connection failed, area persistence and logs are disabled:', err.message);
    }
}

export function isMongoConnected() {
    return mongoose.connection.readyState === 1;
}
