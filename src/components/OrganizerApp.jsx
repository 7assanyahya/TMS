import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, AlertTriangle, Activity, CheckCircle } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import { ref, onDisconnect } from 'firebase/database';
import { db } from '../lib/firebase';
import './OrganizerApp.css';

export default function OrganizerApp({ onBack, user }) {
    const { organizers, updateOrganizer, addOrganizer } = useTrafficData();
    const [active, setActive] = useState(true);

    // Find my current state
    const me = organizers.find(o => o.id === user.id) || { status: 'clear' };

    // Register myself if I don't exist
    useEffect(() => {
        const exists = organizers.find(o => o.id === user.id);
        if (!exists) {
            addOrganizer({
                id: user.id,
                name: user.name,
                lat: 24.7136, // Default fallback
                lng: 46.6753,
                status: 'clear',
                active: true
            });
        }
    }, [organizers, addOrganizer, user]);

    // Handle presence/disconnect (Leave site/Close Tab)
    useEffect(() => {
        const userRef = ref(db, `organizers/${user.id}`);

        // Ensure we rely on 'active' state, but also set it here to be sure
        updateOrganizer(user.id, { active: true });

        // If user closes tab or loses connection
        onDisconnect(userRef).update({
            active: false
        });

        // If user navigates away (unmount triggers this cleanup)
        return () => {
            updateOrganizer(user.id, { active: false });
            onDisconnect(userRef).cancel();
        };
    }, [user.id]); // Depend on user.id, ignore updateOrganizer stability issues

    const [gpsStatus, setGpsStatus] = useState('waiting'); // waiting, active, error

    // Real GPS Tracking
    useEffect(() => {
        if (!active) {
            setGpsStatus('off');
            return;
        }

        if (!navigator.geolocation) {
            setGpsStatus('error');
            alert("Geolocation is not supported by your browser");
            return;
        }

        setGpsStatus('locating');

        const handleSuccess = (position) => {
            setGpsStatus('active');
            updateOrganizer(user.id, {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        };

        const handleError = (error) => {
            console.error("GPS Error:", error);
            setGpsStatus('error');
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 20000
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [active, updateOrganizer, user.id]);

    const handleReport = (status) => {
        updateOrganizer(user.id, { status });
        // In a real app, we might also send a dedicated alert event
    };

    const toggleActive = () => {
        const newState = !active;
        setActive(newState);
        updateOrganizer(user.id, { active: newState });
    };

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
                        <div className={`status-badge ${active ? 'status-active' : 'status-busy'}`}>
                            {active ? 'Tracking Active' : 'Off Duty'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel location-card">
                <div className={`gps-pulse ${gpsStatus === 'active' ? 'bg-green-500' : gpsStatus === 'error' ? 'bg-red-500 animate-none' : 'bg-yellow-500'}`}></div>
                <div>
                    <p className="text-sm text-slate-400">
                        {gpsStatus === 'locating' ? 'Locating Satellites...' :
                            gpsStatus === 'error' ? 'GPS Signal Lost' :
                                gpsStatus === 'off' ? 'GPS Off' :
                                    'GPS Active (High Accuracy)'}
                    </p>
                    <div className="text-white font-mono text-sm">
                        {gpsStatus === 'active' || gpsStatus === 'waiting' ?
                            `${me.lat?.toFixed(5)}, ${me.lng?.toFixed(5)}` :
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
                        Traffic Clear
                    </button>

                    <button
                        onClick={() => handleReport('congestion')}
                        className={`action-btn btn-congestion ${me.status === 'congestion' ? 'ring-2 ring-white' : 'opacity-80'}`}
                    >
                        <Activity size={32} />
                        Congestion
                    </button>

                    <button
                        onClick={() => handleReport('accident')}
                        className={`action-btn btn-accident ${me.status === 'accident' ? 'ring-2 ring-white' : 'opacity-80'}`}
                    >
                        <AlertTriangle size={32} />
                        Accident Alert
                    </button>
                </div>
            </div>

            <button
                onClick={toggleActive}
                className="btn glass-panel w-full py-4 text-slate-400 hover:text-white mb-4"
            >
                {active ? 'Go Off Duty' : 'Go On Duty'}
            </button>
        </div>
    );
}
