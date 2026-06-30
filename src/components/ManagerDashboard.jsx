import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, CircleMarker, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import {
    ArrowLeft, Ban, CheckCircle, Zap, Car, PersonStanding, ParkingSquare, Building,
    Plus, Trash, Send, Siren, X,
} from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import AddAreaForm from './AddAreaForm';
import MapDrawHandler from './MapDrawHandler';

function MapController({ organizers, areas }) {
    const map = useMap();
    useEffect(() => {
        const online = organizers.filter((o) => o.online);
        const entities = [...online, ...areas.flatMap((r) => r.path.map((p) => ({ lat: p[0], lng: p[1] })))];
        if (entities.length === 0) {
            map.setView([24.7136, 46.6753], 13);
            return;
        }
        const bounds = L.latLngBounds(entities.map((e) => [e.lat, e.lng]));
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15, animate: true });
    }, [organizers, areas, map]);
    return null;
}

const getAreaColor = (status) => {
    switch (status) {
        case 'closed': return '#ea4335';
        case 'flow-control': return '#f9ab00';
        default: return '#1a73e8';
    }
};

const AreaIcon = ({ type, ...props }) => {
    switch (type) {
        case 'road': return <Car {...props} />;
        case 'walkway': return <PersonStanding {...props} />;
        case 'parking': return <ParkingSquare {...props} />;
        case 'event_space': return <Building {...props} />;
        default: return null;
    }
};

const STATUS_DOT = {
    clear: 'bg-clear',
    congestion: 'bg-congestion',
    accident: 'bg-accident',
};

const STATUS_LABEL = {
    clear: 'Fluid',
    congestion: 'Congested',
    accident: 'Blocked',
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
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        osc.onended = () => ctx.close();
    } catch {
        /* audio unavailable — visual alert still shows */
    }
}

export default function ManagerDashboard({ onBack }) {
    const { organizers, areas, updateAreaStatus, addArea, removeArea, sendCommand } = useTrafficData();
    const [showAddAreaForm, setShowAddAreaForm] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [newAreaPath, setNewAreaPath] = useState([]);
    const [dispatchTarget, setDispatchTarget] = useState('');
    const [dispatchMessage, setDispatchMessage] = useState('');
    const [alerts, setAlerts] = useState([]);
    const knownCritical = useRef(new Set());

    const stats = useMemo(() => ({
        total: organizers.length,
        online: organizers.filter((o) => o.online).length,
        accident: organizers.filter((o) => o.status === 'accident').length,
    }), [organizers]);

    // Audio-visual alert on a new critical incident
    useEffect(() => {
        const critical = organizers.filter((o) => o.status === 'accident' || o.presence === 'emergency');
        const fresh = critical.filter((o) => !knownCritical.current.has(o.id));
        if (fresh.length > 0) {
            playAlertTone();
            setAlerts((prev) => [
                ...prev,
                ...fresh.map((o) => ({
                    id: `${o.id}-${Date.now()}`,
                    name: o.name,
                    reason: o.presence === 'emergency' ? 'Emergency declared' : 'Accident reported',
                })),
            ]);
        }
        knownCritical.current = new Set(critical.map((o) => o.id));
    }, [organizers]);

    const dismissAlert = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

    const handleAddArea = (areaData) => {
        addArea(areaData);
        setShowAddAreaForm(false);
        setIsDrawing(false);
        setNewAreaPath([]);
    };
    const handleCancelAddArea = () => {
        setShowAddAreaForm(false);
        setIsDrawing(false);
        setNewAreaPath([]);
    };
    const handleDraw = (latlng) => { if (isDrawing) setNewAreaPath((p) => [...p, latlng]); };
    const handleRemovePoint = (i) => setNewAreaPath((p) => p.filter((_, idx) => idx !== i));

    const handleDispatch = (e) => {
        e.preventDefault();
        if (!dispatchTarget || !dispatchMessage.trim()) return;
        sendCommand(dispatchTarget, dispatchMessage.trim());
        setDispatchMessage('');
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-surface">
            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="w-[360px] shrink-0 flex flex-col bg-surface border-r border-line overflow-y-auto">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-line">
                    <button onClick={onBack} className="text-ink-dim hover:text-ink" aria-label="Back">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-medium text-ink">Command Center</h1>
                </div>

                {/* Stats */}
                <div className="flex gap-3 p-4">
                    <Stat value={`${stats.online}/${stats.total}`} label="Units online" />
                    <Stat value={stats.accident} label="Accidents" tone={stats.accident > 0 ? 'text-accident' : undefined} />
                </div>

                {/* Dispatch */}
                <Section title="Send a message">
                    <form onSubmit={handleDispatch} className="flex flex-col gap-2">
                        <select
                            value={dispatchTarget}
                            onChange={(e) => setDispatchTarget(e.target.value)}
                            className="px-3 py-2 rounded border border-line text-ink text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        >
                            <option value="">Select a unit…</option>
                            {organizers.filter((o) => o.online).map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={dispatchMessage}
                                onChange={(e) => setDispatchMessage(e.target.value)}
                                placeholder="Instruction…"
                                className="flex-1 px-3 py-2 rounded border border-line text-ink text-sm placeholder:text-ink-faint outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                            <button
                                type="submit"
                                disabled={!dispatchTarget || !dispatchMessage.trim()}
                                className="flex items-center justify-center px-3 rounded bg-primary text-white hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Send"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Zones */}
                <Section
                    title="Zones"
                    action={
                        <button onClick={() => setShowAddAreaForm(true)} className="flex items-center gap-1 text-sm text-primary hover:text-primary-hover">
                            <Plus size={16} /> Add
                        </button>
                    }
                >
                    <div className="flex flex-col gap-2">
                        {areas.length === 0 && <p className="text-ink-faint text-sm">No zones yet.</p>}
                        {areas.map((area) => (
                            <div key={area.id} className="rounded-lg border border-line p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="flex items-center gap-2 text-ink font-medium text-sm">
                                        <AreaIcon type={area.type} size={16} className="text-ink-dim" />
                                        {area.name}
                                    </span>
                                    <StatusPill status={area.status} />
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    <ZoneBtn active={area.status === 'open'} onClick={() => updateAreaStatus(area.id, 'open')} tone="primary" title="Open"><CheckCircle size={16} /></ZoneBtn>
                                    <ZoneBtn active={area.status === 'flow-control'} onClick={() => updateAreaStatus(area.id, 'flow-control')} tone="congestion" title="Flow control"><Zap size={16} /></ZoneBtn>
                                    <ZoneBtn active={area.status === 'closed'} onClick={() => updateAreaStatus(area.id, 'closed')} tone="accident" title="Closed"><Ban size={16} /></ZoneBtn>
                                    <ZoneBtn onClick={() => removeArea(area.id)} tone="accident" title="Delete"><Trash size={16} /></ZoneBtn>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Units */}
                <Section title="Units">
                    <div className="flex flex-col">
                        {organizers.length === 0 && <p className="text-ink-faint text-sm">No units registered.</p>}
                        {organizers.map((org) => (
                            <div key={org.id} className="flex items-center gap-3 py-2.5 border-b border-line last:border-0">
                                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[org.status] || 'bg-ink-faint'}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 text-sm text-ink">
                                        <span className="truncate font-medium">{org.name}</span>
                                        {org.presence === 'emergency' && <Siren size={13} className="text-accident shrink-0" />}
                                    </div>
                                    <div className="text-xs text-ink-dim">
                                        {STATUS_LABEL[org.status] || org.status}
                                        {!org.online && ' · offline'}
                                        {org.presence === 'break' && ' · on break'}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            </aside>

            {/* ── Map ─────────────────────────────────────────────────────── */}
            <main className={`relative flex-1 ${isDrawing ? 'cursor-crosshair' : ''}`}>
                {/* Critical alerts */}
                {alerts.length > 0 && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-2 w-[min(92%,420px)]">
                        {alerts.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 bg-surface border-l-4 border-accident rounded shadow-g-lg p-3">
                                <Siren size={18} className="text-accident shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-ink font-medium text-sm truncate">{a.name}</div>
                                    <div className="text-xs text-accident">{a.reason}</div>
                                </div>
                                <button onClick={() => dismissAlert(a.id)} className="text-ink-faint hover:text-ink"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <MapContainer center={[24.7136, 46.6753]} zoom={13} scrollWheelZoom zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <ZoomControl position="bottomright" />
                    <MapController organizers={organizers} areas={areas} />
                    {isDrawing && <MapDrawHandler onDraw={handleDraw} />}

                    {isDrawing && newAreaPath.length > 0 && (
                        <>
                            <Polyline positions={newAreaPath} pathOptions={{ color: '#1a73e8', dashArray: '5, 10' }} />
                            {newAreaPath.map((point, i) => (
                                <CircleMarker
                                    key={i}
                                    center={point}
                                    radius={5}
                                    pathOptions={{ color: '#1a73e8', fillColor: '#1a73e8', fillOpacity: 1 }}
                                    eventHandlers={{ click: () => handleRemovePoint(i) }}
                                >
                                    <Tooltip>Click to remove</Tooltip>
                                </CircleMarker>
                            ))}
                        </>
                    )}

                    {areas.map((area) => (
                        <Polyline key={area.id} positions={area.path} pathOptions={{ color: getAreaColor(area.status), weight: 6, opacity: 0.85 }}>
                            <Tooltip>{area.name} ({area.type})</Tooltip>
                            <Popup>{area.name}: <span style={{ color: getAreaColor(area.status) }}>{area.status}</span></Popup>
                        </Polyline>
                    ))}

                    {organizers.filter((o) => o.online).map((org) => (
                        <Marker
                            key={org.id}
                            position={[org.lat, org.lng]}
                            icon={L.divIcon({
                                className: `unit-marker marker-${org.status} ${org.presence === 'emergency' ? 'marker-emergency' : ''}`,
                                html: '<div class="ring"></div><div class="dot"></div>',
                                iconSize: [16, 16],
                                iconAnchor: [8, 8],
                            })}
                        >
                            <Popup>
                                <strong>{org.name}</strong><br />
                                Status: {STATUS_LABEL[org.status] || org.status}<br />
                                {org.presence === 'break' ? 'On break' : org.presence === 'emergency' ? 'Emergency' : 'Active'}
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </main>

            {showAddAreaForm && (
                <AddAreaForm
                    onAdd={handleAddArea}
                    onCancel={handleCancelAddArea}
                    isDrawing={isDrawing}
                    onToggleDrawing={() => setIsDrawing((d) => !d)}
                    newPath={newAreaPath}
                    onClearPath={() => setNewAreaPath([])}
                />
            )}
        </div>
    );
}

function Stat({ value, label, tone }) {
    return (
        <div className="flex-1 rounded-lg border border-line p-3">
            <div className={`text-2xl font-medium ${tone || 'text-ink'}`}>{value}</div>
            <div className="text-xs text-ink-dim mt-0.5">{label}</div>
        </div>
    );
}

function Section({ title, action, children }) {
    return (
        <div className="px-4 py-4 border-t border-line">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-ink-dim">{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

function StatusPill({ status }) {
    const map = {
        open: 'bg-clear/15 text-clear',
        'flow-control': 'bg-congestion/20 text-congestion',
        closed: 'bg-accident/15 text-accident',
    };
    const label = { open: 'Open', 'flow-control': 'Flow control', closed: 'Closed' };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || ''}`}>
            {label[status] || status}
        </span>
    );
}

function ZoneBtn({ active, onClick, tone, title, children }) {
    const toneMap = {
        primary: 'hover:bg-primary/10 hover:text-primary',
        congestion: 'hover:bg-congestion/15 hover:text-congestion',
        accident: 'hover:bg-accident/10 hover:text-accident',
    };
    const activeMap = {
        primary: 'bg-primary/10 text-primary',
        congestion: 'bg-congestion/20 text-congestion',
        accident: 'bg-accident/10 text-accident',
    };
    return (
        <button
            onClick={onClick}
            title={title}
            className={`flex items-center justify-center py-2 rounded border border-line text-ink-dim transition-colors ${active ? activeMap[tone] : toneMap[tone]}`}
        >
            {children}
        </button>
    );
}
