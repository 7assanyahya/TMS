import mongoose from 'mongoose';

const areaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['road', 'walkway', 'parking', 'event_space'], required: true },
    path: { type: [[Number]], required: true },
    status: { type: String, enum: ['open', 'flow-control', 'closed'], default: 'open' },
}, { timestamps: true });

areaSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
    },
});
areaSchema.set('toObject', { virtuals: true });
areaSchema.virtual('id').get(function () {
    return this._id.toString();
});

export default mongoose.model('Area', areaSchema);
