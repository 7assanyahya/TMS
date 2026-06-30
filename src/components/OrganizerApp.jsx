import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Activity, CheckCircle, Coffee, Siren, Radio, Bell, X } from 'lucide-react';
import { ref, onDisconnect } from 'firebase/database';
import { useTrafficData, useOrganizerCommands } from '../hooks/useTrafficData';
import { db } from '../lib/firebase';

const PRESENCE_OPTIONS = [
    { key: 'active', label: 'Active', icon: Radio },
    { key: 'break', label: 'On Break', icon: Coffee },
    { key: 'emergency', label: 'Emergency', icon: Siren },
];

const REPORTS = [
    { key: 'clear', label: 'Fluid', icon: CheckCircle, color: 'var(--color-clear)' },
    { key: 'congestion', label: 'Congested', icon: Activity, color: 'var(--color-congestion)' },
    { key: 'accident', label: 'Blocked', icon: AlertTriangle, color: 'var(--color-accident)' },
];

export default function OrganizerApp({ onBack, user }) {
    const { organizers, updateOrganizer, addOrganizer, setPresence } = useTrafficData();
    const [gpsStatus, setGpsStatus] = useState('locating'); // locating, active, error
    const [dismissedTs, setDismissedTs] = useState(null);

    const command = useOrganizerCommands(user.id);
    const me = organizers.find((o) => o.id === user.id) || { status: 'clear', presence: 'active' };

    // Register this unit once
    useEffect(() => {
        const exists = organizers.find((o) => o.id === user.id);
        if (!exists) {
            addOrganizer({
                id: user.id,
                name: user.name,
                lat: 24.7136,
                lng: 46.6753,
                status: 'clear',
                presence: 'active',
                online: true,
            });
        }
    }, [organizers, addOrganizer, user]);

    // Online/offline lifecycle
    useEffect(() => {
        const userRef = ref(db, `organizers/${user.id}`);
        updateOrganizer(user.id, { online: true });
        onDisconnect(userRef).update({ online: false });
        return () => {
            updateOrganizer(user.id, { online: false });
            onDisconnect(userRef).cancel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.id]);

    // GPS tracking
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('error');
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setGpsStatus('active');
                updateOrganizer(user.id, { lat: pos.coords.latitude, lng: pos.coords.longitude });
            },
            (err) => {
                console.error('GPS Error:', err);
                setGpsStatus('error');
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, [updateOrganizer, user.id]);

    const showCommand = command && command.timestamp !== dismissedTs;

    return (
        <div className="min-h-screen flex flex-col bg-surface-2">
            {/* Top bar */}
            <header className="flex items-center gap-3 bg-surface border-b border-line px-4 py-3 shadow-g">
                <button onClick={onBack} className="text-ink-dim hover:text-ink" aria-label="Back">
                    <ArrowLeft size={22} />
                </button>
                <div className="flex-1">
                    <div className="font-medium text-ink leading-tight">{user.name}</div>
                    <div className="text-xs text-ink-dim">
                        {gpsStatus === 'active' && me.lat != null
                            ? `${me.lat.toFixed(5)}, ${me.lng.toFixed(5)}`
                            : gpsStatus === 'error' ? 'GPS unavailable' : 'Locating…'}
                    </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-ink-dim">
                    <span className={`w-2 h-2 rounded-full ${
                        gpsStatus === 'active' ? 'bg-clear' : gpsStatus === 'error' ? 'bg-accident' : 'bg-congestion'
                    }`} />
                    GPS
                </span>
            </header>

            <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col">
                {/* Incoming command */}
                {showCommand && (
                    <div className="flex items-start gap-3 bg-surface border-l-4 border-primary rounded shadow-g p-3 mb-4">
                        <Bell size={18} className="text-primary mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <div className="text-xs text-ink-dim">Message from Command Center</div>
                            <div className="text-ink">{command.message}</div>
                        </div>
                        <button onClick={() => setDismissedTs(command.timestamp)} className="text-ink-faint hover:text-ink">
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Report */}
                <h2 className="text-sm font-medium text-ink-dim mb-3 mt-2">Report road status</h2>
                <div className="flex flex-col gap-3">
                    {REPORTS.map((r) => {
                        const active = me.status === r.key;
                        return (
                            <button
                                key={r.key}
                                onClick={() => updateOrganizer(user.id, { status: r.key })}
                                className={`flex items-center gap-3 rounded-lg border p-4 bg-surface transition-shadow ${
                                    active ? 'shadow-g' : 'border-line hover:shadow-g'
                                }`}
                                style={active ? { borderColor: r.color, borderWidth: 2 } : undefined}
                            >
                                <span
                                    className="flex items-center justify-center w-10 h-10 rounded-full text-white shrink-0"
                                    style={{ background: r.color }}
                                >
                                    <r.icon size={20} />
                                </span>
                                <span className="font-medium text-ink">{r.label}</span>
                                {active && (
                                    <span className="ml-auto text-xs font-medium" style={{ color: r.color }}>
                                        Reported
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Presence */}
                <h2 className="text-sm font-medium text-ink-dim mb-3 mt-6">Your status</h2>
                <div className="flex bg-surface border border-line rounded-lg overflow-hidden">
                    {PRESENCE_OPTIONS.map((opt, i) => {
                        const active = me.presence === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => setPresence(user.id, opt.key)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm transition-colors ${
                                    i > 0 ? 'border-l border-line' : ''
                                } ${active ? 'bg-primary text-white' : 'text-ink-dim hover:bg-surface-2'}`}
                            >
                                <opt.icon size={16} /> {opt.label}
                            </button>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
