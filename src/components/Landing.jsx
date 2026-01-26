import React from 'react';
import { Shield, Smartphone, Map as MapIcon, ChevronRight } from 'lucide-react';
import './Landing.css';

export default function Landing({ onSelectRole }) {
    return (
        <div className="landing-container">
            <div className="bg-ambience">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
            </div>

            <div className="hero-content">
                <div className="icon-wrapper-hero">
                    <Shield size={48} className="text-white" />
                </div>
                <h1 className="title-gradient">
                    Traffic Command
                </h1>
                <p className="subtitle">
                    Advanced Human-as-a-Sensor Operation Room.
                    Select your interface to begin.
                </p>
            </div>

            <div className="role-grid">
                <button
                    onClick={() => onSelectRole('organizer')}
                    className="role-card glass-panel card-organizer"
                >
                    <div className="arrow-icon">
                        <ChevronRight />
                    </div>
                    <div className="role-icon">
                        <Smartphone size={32} />
                    </div>
                    <h2 className="role-title">Field Organizer</h2>
                    <p className="role-desc">
                        "The Eye of the System"
                        <br />
                        Report real-time incidents and location status from the ground.
                    </p>
                </button>

                <button
                    onClick={() => onSelectRole('manager')}
                    className="role-card glass-panel card-manager"
                >
                    <div className="arrow-icon">
                        <ChevronRight />
                    </div>
                    <div className="role-icon">
                        <MapIcon size={32} />
                    </div>
                    <h2 className="role-title">Command Center</h2>
                    <p className="role-desc">
                        "The Brain of the System"
                        <br />
                        Monitor live fleet movements and traffic conditions on the map.
                    </p>
                </button>
            </div>
        </div>
    );
}
