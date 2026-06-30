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
    { key: 'clear', label: 'Fluid', icon: CheckCircle, cssVar: 'var(--color-clear)', idleIcon: 'text-clear', ring: 'ring-clear' },
    { key: 'congestion', label: 'Congested', icon: Activity, cssVar: 'var(--color-congestion)', idleIcon: 'text-congestion', ring: 'ring-congestion' },
    { key: 'accident', label: 'Blocked', icon: AlertTriangle, cssVar: 'var(--color-accident)', idleIcon: 'text-accident', ring: 'ring-accident' },
];

export default function OrganizerApp({ onBack, user }) {
    const { organizers, updateOrganizer, addOrganizer, setPresence } = useTrafficData();
    const [gpsStatus, setGpsStatus] = useState('locating'); // locating, active, error
    const [dismissedTs, setDismissedTs] = useState(null);

    const command = useOrganizerCommands(user.id);
    const me = organizers.find((o) => o.id === user.id) || { status: 'clear', presence: 'active' };

    // Register this unit on the network once
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

    // Presence/connection lifecycle — mark online now, offline on disconnect/unmount
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

    // Real GPS tracking
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

    const presenceLabel = PRESENCE_OPTIONS.find((p) => p.key === me.presence)?.label || 'Active';
    const showCommand = command && command.timestamp !== dismissedTs;

    return (
        <div className="ops-grid min-h-screen max-w-xl mx-auto flex flex-col p-5">
            {/* Header */}
            <header className="flex items-center justify-between mb-5">
                <button
                    onClick={onBack}
                    className="w-11 h-11 rounded-lg border border-line bg-panel flex items-center justify-center text-ink-dim hover:text-ink transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={18} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="font-semibold text-ink leading-tight">{user.name}</div>
                        <div className={`font-mono text-[10px] uppercase tracking-widest ${me.presence === 'emergency' ? 'text-emergency' : 'text-live'}`}>
                            {presenceLabel}
                        </div>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-live/15 text-live flex items-center justify-center font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* Incoming command */}
            {showCommand && (
                <div className="relative flex items-start gap-3 rounded-lg border border-live/40 bg-live/10 p-4 mb-5">
                    <Bell size={18} className="text-live mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-live">Command from Center</div>
                        <div className="text-ink font-medium mt-0.5">{command.message}</div>
                    </div>
                    <button onClick={() => setDismissedTs(command.timestamp)} className="text-ink-faint hover:text-ink">
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* GPS readout */}
            <div className="flex items-center gap-3 rounded-lg border border-line bg-panel p-4 mb-6">
                <span className="relative flex w-3 h-3">
                    {gpsStatus === 'active' && (
                        <span className="absolute inline-flex w-full h-full rounded-full bg-clear opacity-60 animate-ping" />
                    )}
                    <span className={`relative inline-flex w-3 h-3 rounded-full ${
                        gpsStatus === 'active' ? 'bg-clear' : gpsStatus === 'error' ? 'bg-accident' : 'bg-congestion'
                    }`} />
                </span>
                <div>
                    <div className="text-xs text-ink-dim">
                        {gpsStatus === 'locating' ? 'Acquiring satellites…' : gpsStatus === 'error' ? 'GPS signal lost' : 'GPS active · high accuracy'}
                    </div>
                    <div className="font-mono text-sm text-ink">
                        {gpsStatus === 'active' && me.lat != null
                            ? `${me.lat.toFixed(5)}, ${me.lng.toFixed(5)}`
                            : 'searching…'}
                    </div>
                </div>
            </div>

            {/* Report buttons */}
            <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-ink-dim mb-4">
                    Report Road Status
                </h2>
                <div className="grid gap-4">
                    {REPORTS.map((r) => {
                        const active = me.status === r.key;
                        return (
                            <button
                                key={r.key}
                                onClick={() => updateOrganizer(user.id, { status: r.key })}
                                className={`flex items-center gap-4 rounded-xl border p-5 transition-all ${
                                    active
                                        ? `border-transparent ring-2 ${r.ring}`
                                        : 'border-line hover:border-line-strong opacity-90 hover:opacity-100'
                                }`}
                                style={{ background: active ? r.cssVar : 'var(--color-panel-2)' }}
                            >
                                <r.icon size={28} className={active ? 'text-white' : r.idleIcon} />
                                <span className={`text-lg font-semibold ${active ? 'text-white' : 'text-ink'}`}>{r.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Presence toggle */}
            <div className="grid grid-cols-3 gap-2.5 mt-6">
                {PRESENCE_OPTIONS.map((opt) => {
                    const active = me.presence === opt.key;
                    return (
                        <button
                            key={opt.key}
                            onClick={() => setPresence(user.id, opt.key)}
                            className={`flex items-center justify-center gap-1.5 rounded-lg border py-3 text-sm transition-all ${
                                active
                                    ? 'border-live/60 bg-live/10 text-ink'
                                    : 'border-line bg-panel text-ink-dim hover:text-ink'
                            }`}
                        >
                            <opt.icon size={16} /> {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
