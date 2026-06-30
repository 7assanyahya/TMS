import mongoose from 'mongoose';

const commandLogSchema = new mongoose.Schema({
    organizerId: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('CommandLog', commandLogSchema);
