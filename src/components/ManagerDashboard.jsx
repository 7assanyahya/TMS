import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Ban, CheckCircle, Zap, Car, PersonStanding, ParkingSquare, Building, Plus, Trash, Send, Siren, X } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import AddAreaForm from './AddAreaForm';
import MapDrawHandler from './MapDrawHandler';
import './ManagerDashboard.css';

function MapController({ organizers, areas }) {
    const map = useMap();

    React.useEffect(() => {
        const onlineOrgs = organizers.filter(o => o.online);
        const allEntities = [...onlineOrgs, ...areas.flatMap(r => r.path.map(p => ({ lat: p[0], lng: p[1] })))];

        if (allEntities.length === 0) {
            map.setView([24.7136, 46.6753], 13);
            return;
        }

        const bounds = L.latLngBounds(allEntities.map(e => [e.lat, e.lng]));
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true });
        }
    }, [organizers, areas, map]);

    return null;
}

const getAreaColor = (status) => {
    switch (status) {
        case 'closed': return '#ef4444'; // red-500
        case 'flow-control': return '#f59e0b'; // amber-500
        case 'open':
        default: return '#3b82f6'; // blue-500
    }
};

const AreaIcon = ({ type }) => {
    switch (type) {
        case 'road': return <Car size={16} className="text-slate-500" />;
        case 'walkway': return <PersonStanding size={16} className="text-slate-500" />;
        case 'parking': return <ParkingSquare size={16} className="text-slate-500" />;
        case 'event_space': return <Building size={16} className="text-slate-500" />;
        default: return null;
    }
};

function playAlertTone() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
        osc.onended = () => ctx.close();
    } catch {
        // Audio not available in this environment; the visual banner still appears.
    }
}

export default function ManagerDashboard({ onBack }) {
    const { organizers, areas, updateAreaStatus, addArea, removeArea, sendCommand } = useTrafficData();
    const [showAddAreaForm, setShowAddAreaForm] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newAreaPath, setNewAreaPath] = useState([]);
    const [dispatchTarget, setDispatchTarget] = useState('');
    const [dispatchMessage, setDispatchMessage] = useState('');
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const knownCriticalIds = useRef(new Set());

    const stats = useMemo(() => ({
        total: organizers.length,
        online: organizers.filter(o => o.online).length,
        congestion: organizers.filter(o => o.status === 'congestion').length,
        accident: organizers.filter(o => o.status === 'accident').length,
        emergency: organizers.filter(o => o.presence === 'emergency').length,
    }), [organizers]);

    // Instant audio-visual alert when an organizer reports a critical incident
    useEffect(() => {
        const criticalNow = organizers.filter(o => o.status === 'accident' || o.presence === 'emergency');
        const newlyCritical = criticalNow.filter(o => !knownCriticalIds.current.has(o.id));

        if (newlyCritical.length > 0) {
            playAlertTone();
            setCriticalAlerts(prev => [...prev, ...newlyCritical.map(o => ({
                id: `${o.id}-${Date.now()}`,
                organizerId: o.id,
                name: o.name,
                reason: o.presence === 'emergency' ? 'Emergency declared' : 'Accident reported',
            }))]);
        }

        knownCriticalIds.current = new Set(criticalNow.map(o => o.id));
    }, [organizers]);

    const dismissAlert = (id) => setCriticalAlerts(prev => prev.filter(a => a.id !== id));

    const handleAddArea = (areaData) => {
        addArea(areaData);
        setShowAddAreaForm(false);
        setIsDrawing(false);
        setNewAreaPath([]);
    };

    const handleToggleDrawing = () => setIsDrawing(!isDrawing);
    const handleDraw = (latlng) => {
        if (isDrawing) setNewAreaPath([...newAreaPath, latlng]);
    };
    const handleClearPath = () => setNewAreaPath([]);
    const handleRemovePoint = (index) => setNewAreaPath(newAreaPath.filter((_, i) => i !== index));
    const handleCancelAddArea = () => {
        setShowAddAreaForm(false);
        setIsDrawing(false);
        setNewAreaPath([]);
    };

    const handleDispatch = (e) => {
        e.preventDefault();
        if (!dispatchTarget || !dispatchMessage.trim()) return;
        sendCommand(dispatchTarget, dispatchMessage.trim());
        setDispatchMessage('');
    };

    return (
        <div className="manager-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Command Center</h2>
                        <div className="live-indicator"><span className="live-dot"></span> Live</div>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Riyadh Sector A</p>
                </div>

                <div className="sidebar-section">
                    <div className="section-header">Stats</div>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-value text-blue-400">{stats.online}/{stats.total}</div>
                            <div className="stat-label">Units Online</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-value text-red-500">{stats.accident}</div>
                            <div className="stat-label">Accidents</div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="section-header">Task Dispatch</div>
                    <form onSubmit={handleDispatch} className="flex flex-col gap-2">
                        <select
                            value={dispatchTarget}
                            onChange={(e) => setDispatchTarget(e.target.value)}
                            className="form-input"
                        >
                            <option value="">Select organizer...</option>
                            {organizers.filter(o => o.online).map(o => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={dispatchMessage}
                                onChange={(e) => setDispatchMessage(e.target.value)}
                                placeholder="Movement order / instruction..."
                                className="form-input flex-1"
                            />
                            <button type="submit" className="btn-add" disabled={!dispatchTarget || !dispatchMessage.trim()}>
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </div>

                <div className="sidebar-section">
                    <div className="flex justify-between items-center mb-4">
                        <div className="section-header !mb-0">Area Control</div>
                        <button onClick={() => setShowAddAreaForm(true)} className="btn-add">
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="action-list">
                        {areas.map(area => (
                            <div key={area.id} className="action-item">
                                <div className="action-item-header">
                                    <div className="flex items-center gap-2">
                                        <AreaIcon type={area.type} />
                                        <span className="font-bold text-white">{area.name}</span>
                                    </div>
                                    <span className={`status-pill status-${area.status}`}>{area.status.replace('-', ' ')}</span>
                                </div>
                                <div className="action-buttons">
                                    <button onClick={() => updateAreaStatus(area.id, 'open')} className={`action-btn-small btn-open ${area.status === 'open' ? 'active' : ''}`}><CheckCircle size={16} /></button>
                                    <button onClick={() => updateAreaStatus(area.id, 'flow-control')} className={`action-btn-small btn-flow ${area.status === 'flow-control' ? 'active' : ''}`}><Zap size={16} /></button>
                                    <button onClick={() => updateAreaStatus(area.id, 'closed')} className={`action-btn-small btn-closed ${area.status === 'closed' ? 'active' : ''}`}><Ban size={16} /></button>
                                    <button onClick={() => removeArea(area.id)} className="action-btn-small btn-delete"><Trash size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="sidebar-section">
                    <div className="section-header">Field Reports</div>
                    <div className="alerts-list">
                         {organizers.map(org => (
                            <div key={org.id} className={`alert-item alert-${org.status}`}>
                                <div className={`w-2 h-2 rounded-full mt-2 ${org.status === 'clear' ? 'bg-green-500' : org.status === 'congestion' ? 'bg-orange-500' : 'bg-red-500'}`} />
                                <div>
                                    <div className="text-sm font-bold text-white flex items-center gap-2">
                                        {org.name}
                                        {!org.online && <span className="text-xs text-slate-500">(Offline)</span>}
                                        {org.presence === 'emergency' && <Siren size={14} className="text-red-500" />}
                                    </div>
                                    <div className="text-xs text-slate-400 capitalize">
                                        Status: <span className={org.status === 'accident' ? 'text-red-400 font-bold' : org.status === 'congestion' ? 'text-orange-400' : 'text-slate-400'}>{org.status}</span>
                                        {' · '}
                                        <span className="capitalize">{org.presence === 'break' ? 'On Break' : org.presence}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showAddAreaForm && (
                <AddAreaForm
                    onAdd={handleAddArea}
                    onCancel={handleCancelAddArea}
                    isDrawing={isDrawing}
                    onToggleDrawing={handleToggleDrawing}
                    newPath={newAreaPath}
                    onClearPath={handleClearPath}
                />
            )}

            <div className={`map-wrapper ${isDrawing ? 'drawing-cursor' : ''}`}>
                <button onClick={onBack} className="back-btn-float glass-panel hover:text-blue-400 transition-colors">
                    <ArrowLeft size={20} />
                </button>

                {criticalAlerts.length > 0 && (
                    <div className="critical-alerts-stack">
                        {criticalAlerts.map(alert => (
                            <div key={alert.id} className="glass-panel critical-alert">
                                <Siren size={18} className="text-red-500" />
                                <div className="flex-1">
                                    <div className="text-white font-bold text-sm">{alert.name}</div>
                                    <div className="text-xs text-red-300">{alert.reason}</div>
                                </div>
                                <button onClick={() => dismissAlert(alert.id)} className="btn-icon">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <MapContainer center={[24.7136, 46.6753]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController organizers={organizers} areas={areas} />

                    {isDrawing && <MapDrawHandler onDraw={handleDraw} />}

                    {/* Draw new path */}
                    {isDrawing && newAreaPath.length > 0 && (
                        <>
                            <Polyline positions={newAreaPath} pathOptions={{ color: 'lime', dashArray: '5, 10' }} />
                            {newAreaPath.map((point, index) => (
                                <CircleMarker
                                    key={index}
                                    center={point}
                                    radius={5}
                                    pathOptions={{ color: 'lime', fillColor: 'lime', fillOpacity: 1 }}
                                    eventHandlers={{
                                        click: () => handleRemovePoint(index),
                                    }}
                                >
                                    <Tooltip>Click to remove</Tooltip>
                                </CircleMarker>
                            ))}
                        </>
                    )}

                    {/* Existing Areas */}
                    {areas.map(area => (
                        <Polyline
                            key={area.id}
                            positions={area.path}
                            pathOptions={{ color: getAreaColor(area.status), weight: 5, opacity: 0.8 }}
                        >
                            <Tooltip>{area.name} ({area.type})</Tooltip>
                            <Popup>{area.name}: <span style={{ color: getAreaColor(area.status) }}>{area.status}</span></Popup>
                        </Polyline>
                    ))}

                    {/* Organizers */}
                    {organizers.filter(o => o.online).map(org => (
                        <Marker
                            key={org.id}
                            position={[org.lat, org.lng]}
                            icon={L.divIcon({
                                className: `custom-marker marker-${org.status} ${org.presence === 'emergency' ? 'marker-emergency' : ''}`,
                                html: `<div class="marker-inner"></div>`,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20]
                            })}
                        >
                            <Popup className="glass-popup">
                                <div className="p-2">
                                    <strong className="text-slate-900">{org.name}</strong><br />
                                    Status: {org.status}<br />
                                    Presence: {org.presence === 'break' ? 'On Break' : org.presence}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
