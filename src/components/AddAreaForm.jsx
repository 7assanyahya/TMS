import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, Edit } from 'lucide-react';
import './AddAreaForm.css';

export default function AddAreaForm({ onAdd, onCancel, isDrawing, onToggleDrawing, newPath, onClearPath }) {
    const [name, setName] = useState('');
    const [type, setType] = useState('road');
    const [error, setError] = useState('');
    const [pathStr, setPathStr] = useState('');

    useEffect(() => {
        setPathStr(newPath.map(p => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(' '));
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

        const areaData = {
            name,
            type,
            path: newPath.map(p => [p.lat, p.lng]),
            status: 'open',
        };

        onAdd(areaData);
        onCancel(); // Close form on success
    };

    return (
        <div className="add-area-form-overlay">
            <div className="add-area-form glass-panel">
                <div className="form-header">
                    <h3 className="text-lg font-bold text-white">
                        {isDrawing ? 'Drawing Path...' : 'Add New Area'}
                    </h3>
                    <button onClick={onCancel} className="btn-icon">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="form-group">
                        <label htmlFor="area-name">Name</label>
                        <input id="area-name" type="text" placeholder="e.g., Main Street" value={name} onChange={e => setName(e.target.value)} className="form-input" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="area-type">Type</label>
                        <select id="area-type" value={type} onChange={e => setType(e.target.value)} className="form-input">
                            <option value="road">Road</option>
                            <option value="walkway">Walkway</option>
                            <option value="parking">Parking</option>
                            <option value="event_space">Event Space</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Path</label>
                        <div className="path-controls">
                            <button type="button" onClick={onToggleDrawing} className={`btn btn-draw ${isDrawing ? 'active' : ''}`}>
                                <Edit size={16} /> {isDrawing ? 'Finish Drawing' : 'Draw on Map'}
                            </button>
                            <button type="button" onClick={onClearPath} className="btn btn-clear-path">
                                <Trash2 size={16} /> Clear
                            </button>
                        </div>
                        <textarea
                            value={pathStr}
                            className="form-input path-textarea"
                            rows="3"
                            readOnly
                        />
                    </div>


                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={isDrawing}>
                            <Plus size={18} /> Add Area
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
