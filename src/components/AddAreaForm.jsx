import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Pencil } from 'lucide-react';

export default function AddAreaForm({ onAdd, onCancel, isDrawing, onToggleDrawing, newPath, onClearPath }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('road');
    const [error, setError] = useState('');
    const [pathStr, setPathStr] = useState('');

    useEffect(() => {
        setPathStr(newPath.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join('  '));
    }, [newPath]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !type) {
            setError('Name and type are required.');
            return;
        }
        if (newPath.length < 2) {
            setError('Path must have at least 2 points.');
            return;
        }
        onAdd({ name, type, path: newPath.map((p) => [p.lat, p.lng]), status: 'open' });
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center p-6 pt-24 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-line-strong bg-panel p-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-ink">
                        {isDrawing ? 'Drawing path…' : 'New Zone'}
                    </h3>
                    <button onClick={onCancel} className="text-ink-faint hover:text-ink" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="area-name" className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">Name</label>
                        <input
                            id="area-name"
                            type="text"
                            placeholder="e.g. King Fahd Road"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="px-3.5 py-2.5 rounded-lg bg-panel-2 border border-line text-ink placeholder:text-ink-faint outline-none focus:border-live/60"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="area-type" className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">Type</label>
                        <select
                            id="area-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-3.5 py-2.5 rounded-lg bg-panel-2 border border-line text-ink outline-none focus:border-live/60"
                        >
                            <option value="road">Road</option>
                            <option value="walkway">Walkway</option>
                            <option value="parking">Parking</option>
                            <option value="event_space">Event Space</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-ink-dim">Path · {newPath.length} pts</label>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={onToggleDrawing}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm transition-colors ${
                                    isDrawing ? 'border-live/60 bg-live/10 text-ink' : 'border-line bg-panel-2 text-ink-dim hover:text-ink'
                                }`}
                            >
                                <Pencil size={15} /> {isDrawing ? 'Finish' : 'Draw on map'}
                            </button>
                            <button
                                type="button"
                                onClick={onClearPath}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-line bg-panel-2 text-ink-dim hover:text-accident transition-colors"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <textarea
                            value={pathStr}
                            readOnly
                            rows="2"
                            placeholder="Click points on the map to trace the zone…"
                            className="px-3.5 py-2.5 rounded-lg bg-panel-2 border border-line text-ink-dim font-mono text-xs placeholder:text-ink-faint outline-none resize-none"
                        />
                    </div>

                    {error && <p className="text-accident text-sm">{error}</p>}

                    <button
                        type="submit"
                        disabled={isDrawing}
                        className="flex items-center justify-center gap-2 py-3 rounded-lg bg-live font-semibold transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: '#06212b' }}
                    >
                        <Plus size={18} /> Add Zone
                    </button>
                </form>
            </div>
        </div>
    );
}
