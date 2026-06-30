import React from 'react';
import { Smartphone, Map as MapIcon, ChevronRight } from 'lucide-react';

export default function Landing({ onSelectRole }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-surface-2">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white mb-4">
                        <MapIcon size={24} />
                    </div>
                    <h1 className="text-2xl font-medium text-ink">Smart Traffic Management</h1>
                    <p className="text-ink-dim mt-1">Choose how you want to sign in.</p>
                </div>

                <div className="flex flex-col gap-3">
                    <RoleButton
                        onClick={() => onSelectRole('organizer')}
                        icon={<Smartphone size={22} />}
                        title="Field Organizer"
                        subtitle="Report road conditions from the ground"
                    />
                    <RoleButton
                        onClick={() => onSelectRole('manager')}
                        icon={<MapIcon size={22} />}
                        title="Command Center"
                        subtitle="Monitor the live map and dispatch orders"
                    />
                </div>
            </div>
        </div>
    );
}

function RoleButton({ onClick, icon, title, subtitle }) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-4 w-full text-left bg-surface rounded-lg border border-line p-4 transition-shadow hover:shadow-g"
        >
            <span className="flex items-center justify-center w-11 h-11 rounded-full bg-surface-2 text-primary shrink-0">
                {icon}
            </span>
            <span className="flex-1">
                <span className="block font-medium text-ink">{title}</span>
                <span className="block text-sm text-ink-dim">{subtitle}</span>
            </span>
            <ChevronRight size={20} className="text-ink-faint group-hover:text-ink-dim" />
        </button>
    );
}
