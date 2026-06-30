import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Pencil } from 'lucide-react';

export default function AddAreaForm({ onAdd, onCancel, isDrawing, onToggleDrawing, newPath, onClearPath }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('road');
    const [error, setError] = useState('');
    const [pathStr, setPathStr] = useState('');

    useEffect(() => {
        setPathStr(newPath.map((p) => `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`).join('\n'));
    }, [newPath]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !type) {
            setError('Name and type are required.');
            return;
        }
        if (newPath.length < 2) {
            setError('Draw a path with at least 2 points on the map.');
            return;
        }
        onAdd({ name, type, path: newPath.map((p) => [p.lat, p.lng]), status: 'open' });
        onCancel();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-start justify-center p-6 pt-20 bg-black/30">
            <div className="w-full max-w-sm bg-surface rounded-lg shadow-g-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-ink">
                        {isDrawing ? 'Click the map to draw' : 'Add zone'}
                    </h3>
                    <button onClick={onCancel} className="text-ink-faint hover:text-ink" aria-label="Close">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="area-name" className="block text-sm text-ink-dim mb-1.5">Name</label>
                        <input
                            id="area-name"
                            type="text"
                            placeholder="e.g. King Fahd Road"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2.5 rounded border border-line text-ink placeholder:text-ink-faint outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label htmlFor="area-type" className="block text-sm text-ink-dim mb-1.5">Type</label>
                        <select
                            id="area-type"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-3 py-2.5 rounded border border-line text-ink outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="road">Road</option>
                            <option value="walkway">Walkway</option>
                            <option value="parking">Parking</option>
                            <option value="event_space">Event Space</option>
                        </select>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm text-ink-dim">Path · {newPath.length} points</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={onToggleDrawing}
                                    className={`flex items-center gap-1.5 text-sm px-2.5 py-1 rounded transition-colors ${
                                        isDrawing ? 'bg-primary text-white' : 'text-primary hover:bg-surface-2'
                                    }`}
                                >
                                    <Pencil size={14} /> {isDrawing ? 'Done' : 'Draw'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClearPath}
                                    className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded text-ink-dim hover:bg-surface-2"
                                >
                                    <Trash2 size={14} /> Clear
                                </button>
                            </div>
                        </div>
                        <textarea
                            value={pathStr}
                            readOnly
                            rows="3"
                            placeholder="Click points on the map to trace the zone…"
                            className="w-full px-3 py-2 rounded border border-line text-ink-dim text-sm placeholder:text-ink-faint outline-none resize-none bg-surface-2"
                        />
                    </div>

                    {error && <p className="text-accident text-sm">{error}</p>}

                    <div className="flex justify-end gap-2 pt-1">
                        <button type="button" onClick={onCancel} className="px-4 py-2 rounded text-ink-dim font-medium hover:bg-surface-2">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isDrawing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus size={16} /> Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
