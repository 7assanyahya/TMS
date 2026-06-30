import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle, Activity, CheckCircle, Coffee, Siren, Radio, Bell } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import './OrganizerApp.css';

const PRESENCE_OPTIONS = [
    { key: 'active', label: 'Active', icon: Radio },
    { key: 'break', label: 'On Break', icon: Coffee },
    { key: 'emergency', label: 'Emergency', icon: Siren },
];

export default function OrganizerApp({ onBack, user }) {
    const { organizers, joinOrganizer, updateLocation, reportStatus, setPresence, commands } = useTrafficData();
    const [gpsStatus, setGpsStatus] = useState('locating'); // locating, active, error
    const [notice, setNotice] = useState(null);

    const me = organizers.find((o) => o.id === user.id) || { status: 'clear', presence: 'active' };

    // Announce presence on the network when this app mounts; the server marks
    // us offline automatically when the socket disconnects.
    useEffect(() => {
        joinOrganizer(user.id, user.name);
    }, [joinOrganizer, user.id, user.name]);

    // Real GPS tracking, streamed to the server over the socket
    useEffect(() => {
        if (!navigator.geolocation) {
            setGpsStatus('error');
            return;
        }

        setGpsStatus('locating');

        const handleSuccess = (position) => {
            setGpsStatus('active');
            updateLocation(user.id, position.coords.latitude, position.coords.longitude);
        };

        const handleError = (error) => {
            console.error('GPS Error:', error);
            setGpsStatus('error');
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000,
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [updateLocation, user.id]);

    // Show the latest command pushed from the command center as a banner
    useEffect(() => {
        if (commands.length === 0) return;
        const latest = commands[commands.length - 1];
        setNotice(latest);
        const timer = setTimeout(() => setNotice(null), 8000);
        return () => clearTimeout(timer);
    }, [commands]);

    const handleReport = (status) => reportStatus(user.id, status);
    const handlePresence = (presence) => setPresence(user.id, presence);

    return (
        <div className="organizer-container">
            <div className="org-header">
                <button onClick={onBack} className="btn glass-panel p-3">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <div className="org-profile">
                    <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 className="text-white font-bold">{user.name}</h3>
                        <div className={`status-badge ${me.presence === 'emergency' ? 'status-busy' : 'status-active'}`}>
                            {PRESENCE_OPTIONS.find((p) => p.key === me.presence)?.label || 'Active'}
                        </div>
                    </div>
                </div>
            </div>

            {notice && (
                <div className="glass-panel command-banner">
                    <Bell size={18} />
                    <div>
                        <div className="text-xs uppercase tracking-widest text-slate-400">Command from Center</div>
                        <div className="text-white font-bold">{notice.message}</div>
                    </div>
                </div>
            )}

            <div className="glass-panel location-card">
                <div className={`gps-pulse ${gpsStatus === 'active' ? 'bg-green-500' : gpsStatus === 'error' ? 'bg-red-500 animate-none' : 'bg-yellow-500'}`}></div>
                <div>
                    <p className="text-sm text-slate-400">
                        {gpsStatus === 'locating' ? 'Locating Satellites...' :
                            gpsStatus === 'error' ? 'GPS Signal Lost' :
                                'GPS Active (High Accuracy)'}
                    </p>
                    <div className="text-white font-mono text-sm">
                        {gpsStatus === 'active' && me.lat != null ?
                            `${me.lat.toFixed(5)}, ${me.lng.toFixed(5)}` :
                            'Searching...'}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-slate-400 uppercase tracking-widest text-sm mb-4 text-center">
                    Report Road Status
                </h2>

                <div className="action-grid">
                    <button
                        onClick={() => handleReport('clear')}
                        className={`action-btn btn-clear ${me.status === 'clear' ? 'ring-2 ring-white' : 'opacity-80'}`}
                    >
                        <CheckCircle size={32} />
                        Fluid
                    </button>

                    <button
                        onClick={() => handleReport('congestion')}
                        className={`action-btn btn-congestion ${me.status === 'congestion' ? 'ring-2 ring-white' : 'opacity-80'}`}
                    >
                        <Activity size={32} />
                        Congested
                    </button>

                    <button
                        onClick={() => handleReport('accident')}
                        className={`action-btn btn-accident ${me.status === 'accident' ? 'ring-2 ring-white' : 'opacity-80'}`}
                    >
                        <AlertTriangle size={32} />
                        Blocked
                    </button>
                </div>
            </div>

            <div className="presence-toggle-row">
                {PRESENCE_OPTIONS.map((option) => (
                    <button
                        key={option.key}
                        onClick={() => handlePresence(option.key)}
                        className={`btn glass-panel presence-btn ${me.presence === option.key ? 'active' : ''}`}
                    >
                        <option.icon size={16} /> {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
