import { Router } from 'express';
import Area from '../models/Area.js';
import { isMongoConnected } from '../config/db.js';

const router = Router();

function requireMongo(_req, res, next) {
    if (!isMongoConnected()) {
        return res.status(503).json({ error: 'Area storage (MongoDB) is unavailable' });
    }
    next();
}

router.get('/', requireMongo, async (_req, res) => {
    const areas = await Area.find().sort({ createdAt: 1 });
    res.json(areas.map((a) => a.toJSON()));
});

router.post('/', requireMongo, async (req, res) => {
    const { name, type, path, status } = req.body;
    if (!name || !type || !Array.isArray(path) || path.length < 2) {
        return res.status(400).json({ error: 'name, type and a path with at least 2 points are required' });
    }
    const area = await Area.create({ name, type, path, status });
    const json = area.toJSON();
    req.app.get('io').emit('area:created', json);
    res.status(201).json(json);
});

router.patch('/:id', requireMongo, async (req, res) => {
    const { status } = req.body;
    const area = await Area.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!area) return res.status(404).json({ error: 'Area not found' });
    const json = area.toJSON();
    req.app.get('io').emit('area:updated', json);
    res.json(json);
});

router.delete('/:id', requireMongo, async (req, res) => {
    const area = await Area.findByIdAndDelete(req.params.id);
    if (!area) return res.status(404).json({ error: 'Area not found' });
    req.app.get('io').emit('area:deleted', { id: req.params.id });
    res.status(204).end();
});

export default router;
