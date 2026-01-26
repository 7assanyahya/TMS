import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, AlertTriangle, Activity, CheckCircle } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import './OrganizerApp.css';

const MY_ID = 1; // Simulating "Unit Alpha"
const MY_NAME = "Unit Alpha";

export default function OrganizerApp({ onBack }) {
    const { organizers, updateOrganizer, addOrganizer } = useTrafficData();
    const [active, setActive] = useState(true);

    // Find my current state
    const me = organizers.find(o => o.id === MY_ID) || { status: 'clear' };

    // Register myself if I don't exist
    useEffect(() => {
        const exists = organizers.find(o => o.id === MY_ID);
        if (!exists) {
            addOrganizer({
                id: MY_ID,
                name: MY_NAME,
                lat: 24.7136, // Default fallback
                lng: 46.6753,
                status: 'clear',
                active: true
            });
        }
    }, [organizers, addOrganizer]);

    // Real GPS Tracking
    useEffect(() => {
        if (!active) return;

        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by your browser");
            return;
        }

        const handleSuccess = (position) => {
            updateOrganizer(MY_ID, {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
        };

        const handleError = (error) => {
            console.error("GPS Error:", error);
        };

        const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, [active, updateOrganizer]);

    const handleReport = (status) => {
        updateOrganizer(MY_ID, { status });
        // In a real app, we might also send a dedicated alert event
    };

    const toggleActive = () => {
        const newState = !active;
        setActive(newState);
        updateOrganizer(MY_ID, { active: newState });
    };

    return (
        <div className="organizer-container">
            <div className="org-header">
                <button onClick={onBack} className="btn glass-panel p-3">
                    <ArrowLeft size={20} className="text-white" />
                </button>
                <div className="org-profile">
                    <div className="profile-avatar">A</div>
                    <div>
                        <h3 className="text-white font-bold">{MY_NAME}</h3>
                        <div className={`status-badge ${active ? 'status-active' : 'status-busy'}`}>
                            {active ? 'Tracking Active' : 'Off Duty'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="glass-panel location-card">
                <div className="gps-pulse"></div>
                <div>
                    <p className="text-sm text-slate-400">Current Location (GPS)</p>
                    <div className="text-white font-mono text-sm">
                        {me.lat?.toFixed(5)}, {me.lng?.toFixed(5)}
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
