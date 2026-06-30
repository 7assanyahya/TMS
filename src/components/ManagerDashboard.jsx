import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap, CircleMarker } from 'react-leaflet';
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
        if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
    }, [organizers, areas, map]);
    return null;
}

const getAreaColor = (status) => {
    switch (status) {
        case 'closed': return '#ef4444';
        case 'flow-control': return '#f59e0b';
        default: return '#22d3ee';
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
        osc.stop(ctx.currentTime + 0.35);
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
        congestion: organizers.filter((o) => o.status === 'congestion').length,
        accident: organizers.filter((o) => o.status === 'accident').length,
    }), [organizers]);

    // Audio-visual alert when a unit reports a critical incident
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
        <div className="flex h-screen w-screen overflow-hidden bg-base">
            {/* ── Ops sidebar ─────────────────────────────────────────────── */}
            <aside className="w-[340px] shrink-0 flex flex-col bg-panel border-r border-line overflow-y-auto">
                <div className="p-5 border-b border-line">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-ink">Command Center</h2>
                        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-live">
                            <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" /> Live
                        </span>
                    </div>
                    <p className="font-mono text-[11px] text-ink-faint mt-1 tracking-wide">RIYADH · SECTOR A</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-px bg-line">
                    <Stat value={`${stats.online}/${stats.total}`} label="Units Online" tone="text-live" />
                    <Stat value={stats.accident} label="Accidents" tone="text-accident" />
                </div>

                {/* Task dispatch */}
                <Section title="Task Dispatch">
                    <form onSubmit={handleDispatch} className="flex flex-col gap-2">
                        <select
                            value={dispatchTarget}
                            onChange={(e) => setDispatchTarget(e.target.value)}
                            className="px-3 py-2.5 rounded-lg bg-panel-2 border border-line text-ink text-sm outline-none focus:border-live/60"
                        >
                            <option value="">Select unit…</option>
                            {organizers.filter((o) => o.online).map((o) => (
                                <option key={o.id} value={o.id}>{o.name}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={dispatchMessage}
                                onChange={(e) => setDispatchMessage(e.target.value)}
                                placeholder="Movement order / instruction…"
                                className="flex-1 px-3 py-2.5 rounded-lg bg-panel-2 border border-line text-ink text-sm placeholder:text-ink-faint outline-none focus:border-live/60"
                            />
                            <button
                                type="submit"
                                disabled={!dispatchTarget || !dispatchMessage.trim()}
                                className="px-3.5 rounded-lg bg-live flex items-center justify-center transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ color: '#06212b' }}
                                aria-label="Dispatch"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </Section>

                {/* Area control */}
                <Section
                    title="Zone Control"
                    action={
                        <button onClick={() => setShowAddAreaForm(true)} className="text-ink-dim hover:text-live transition-colors" aria-label="Add zone">
                            <Plus size={16} />
                        </button>
                    }
                >
                    <div className="flex flex-col gap-2">
                        {areas.length === 0 && <p className="text-ink-faint text-sm">No zones defined.</p>}
                        {areas.map((area) => (
                            <div key={area.id} className="rounded-lg bg-panel-2 border border-line p-3">
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className="flex items-center gap-2 text-ink font-medium text-sm">
                                        <AreaIcon type={area.type} size={15} className="text-ink-dim" />
                                        {area.name}
                                    </span>
                                    <StatusPill status={area.status} />
                                </div>
                                <div className="grid grid-cols-4 gap-1.5">
                                    <ZoneBtn active={area.status === 'open'} onClick={() => updateAreaStatus(area.id, 'open')} tone="live"><CheckCircle size={15} /></ZoneBtn>
                                    <ZoneBtn active={area.status === 'flow-control'} onClick={() => updateAreaStatus(area.id, 'flow-control')} tone="congestion"><Zap size={15} /></ZoneBtn>
                                    <ZoneBtn active={area.status === 'closed'} onClick={() => updateAreaStatus(area.id, 'closed')} tone="accident"><Ban size={15} /></ZoneBtn>
                                    <ZoneBtn onClick={() => removeArea(area.id)} tone="accident"><Trash size={15} /></ZoneBtn>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Field reports */}
                <Section title="Field Reports">
                    <div className="flex flex-col gap-2">
                        {organizers.length === 0 && <p className="text-ink-faint text-sm">No units registered.</p>}
                        {organizers.map((org) => (
                            <div key={org.id} className="flex items-start gap-3 rounded-lg bg-panel-2 border border-line p-3">
                                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[org.status] || 'bg-ink-faint'}`} />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-sm font-medium text-ink">
                                        <span className="truncate">{org.name}</span>
                                        {!org.online && <span className="font-mono text-[10px] text-ink-faint">OFFLINE</span>}
                                        {org.presence === 'emergency' && <Siren size={13} className="text-emergency shrink-0" />}
                                    </div>
                                    <div className="font-mono text-[11px] text-ink-dim capitalize">
                                        {org.status} · {org.presence === 'break' ? 'on break' : org.presence}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            </aside>

            {/* ── Map ─────────────────────────────────────────────────────── */}
            <main className={`relative flex-1 ${isDrawing ? 'cursor-crosshair' : ''}`}>
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 z-[1000] w-10 h-10 rounded-lg border border-line bg-panel/90 backdrop-blur flex items-center justify-center text-ink-dim hover:text-live transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>

                {/* Critical alerts */}
                {alerts.length > 0 && (
                    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 w-80">
                        {alerts.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 rounded-lg border border-accident/50 bg-accident/15 backdrop-blur p-3.5 animate-pulse-alert">
                                <Siren size={18} className="text-accident shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-ink font-semibold text-sm truncate">{a.name}</div>
                                    <div className="font-mono text-[11px] text-accident">{a.reason}</div>
                                </div>
                                <button onClick={() => dismissAlert(a.id)} className="text-ink-faint hover:text-ink"><X size={15} /></button>
                            </div>
                        ))}
                    </div>
                )}

                <MapContainer center={[24.7136, 46.6753]} zoom={13} scrollWheelZoom zoomControl={false} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController organizers={organizers} areas={areas} />
                    {isDrawing && <MapDrawHandler onDraw={handleDraw} />}

                    {isDrawing && newAreaPath.length > 0 && (
                        <>
                            <Polyline positions={newAreaPath} pathOptions={{ color: '#22d3ee', dashArray: '5, 10' }} />
                            {newAreaPath.map((point, i) => (
                                <CircleMarker
                                    key={i}
                                    center={point}
                                    radius={5}
                                    pathOptions={{ color: '#22d3ee', fillColor: '#22d3ee', fillOpacity: 1 }}
                                    eventHandlers={{ click: () => handleRemovePoint(i) }}
                                >
                                    <Tooltip>Click to remove</Tooltip>
                                </CircleMarker>
                            ))}
                        </>
                    )}

                    {areas.map((area) => (
                        <Polyline key={area.id} positions={area.path} pathOptions={{ color: getAreaColor(area.status), weight: 5, opacity: 0.85 }}>
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
                                iconSize: [22, 22],
                                iconAnchor: [11, 11],
                            })}
                        >
                            <Popup>
                                <strong>{org.name}</strong><br />
                                Status: {org.status}<br />
                                Presence: {org.presence === 'break' ? 'On Break' : org.presence}
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
        <div className="bg-panel p-4 text-center">
            <div className={`text-2xl font-bold font-mono ${tone}`}>{value}</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mt-0.5">{label}</div>
        </div>
    );
}

function Section({ title, action, children }) {
    return (
        <div className="p-5 border-t border-line">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-dim">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function StatusPill({ status }) {
    const map = {
        open: 'bg-live/15 text-live',
        'flow-control': 'bg-congestion/15 text-congestion',
        closed: 'bg-accident/15 text-accident',
    };
    return (
        <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${map[status] || ''}`}>
            {status.replace('-', ' ')}
        </span>
    );
}

function ZoneBtn({ active, onClick, tone, children }) {
    const toneMap = {
        live: 'hover:bg-live/20 hover:text-live',
        congestion: 'hover:bg-congestion/20 hover:text-congestion',
        accident: 'hover:bg-accident/20 hover:text-accident',
    };
    const activeMap = {
        live: 'bg-live/20 text-live',
        congestion: 'bg-congestion/20 text-congestion',
        accident: 'bg-accident/20 text-accident',
    };
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-center py-2 rounded-md border border-line text-ink-dim transition-colors ${active ? activeMap[tone] : toneMap[tone]}`}
        >
            {children}
        </button>
    );
}
