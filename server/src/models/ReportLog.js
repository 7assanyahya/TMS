import mongoose from 'mongoose';

const reportLogSchema = new mongoose.Schema({
    organizerId: { type: String, required: true },
    organizerName: { type: String, required: true },
    status: { type: String, enum: ['clear', 'congestion', 'accident'], required: true },
    lat: Number,
    lng: Number,
}, { timestamps: true });

export default mongoose.model('ReportLog', reportLogSchema);
