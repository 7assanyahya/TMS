import React from 'react';
import { Radio, Smartphone, Map as MapIcon, ChevronRight, Activity } from 'lucide-react';

export default function Landing({ onSelectRole }) {
    return (
        <div className="ops-grid relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
            {/* Ambient glow */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-live/10 blur-[120px]" />
                <div className="absolute -bottom-1/4 -right-1/4 w-[55vw] h-[55vw] rounded-full bg-accident/10 blur-[120px]" />
            </div>

            {/* Status bar */}
            <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 py-3 border-b border-line text-[11px] font-mono uppercase tracking-[0.2em] text-ink-faint">
                <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse-live" />
                    System Online
                </span>
                <span>STMS · Human-as-a-Sensor</span>
            </div>

            {/* Hero */}
            <header className="text-center mb-12 max-w-2xl">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl border border-line-strong bg-panel-2 mb-5 shadow-lg">
                    <Activity size={28} className="text-live" />
                </div>
                <div className="font-mono text-[11px] uppercase tracking-[0.35em] text-live mb-3">
                    Traffic Operations Room
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-ink">
                    Command Center
                </h1>
                <p className="mt-4 text-ink-dim text-lg">
                    Real-time traffic intelligence from the field. Select your console to begin.
                </p>
            </header>

            {/* Role consoles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl">
                <RoleConsole
                    onClick={() => onSelectRole('organizer')}
                    icon={<Smartphone size={26} />}
                    accent="live"
                    tag="Field Node"
                    title="Field Organizer"
                    desc="The eye of the system — stream live location and report road conditions from the ground."
                />
                <RoleConsole
                    onClick={() => onSelectRole('manager')}
                    icon={<MapIcon size={26} />}
                    accent="accident"
                    tag="Command"
                    title="Command Center"
                    desc="The brain of the system — monitor the live fleet, control zones, and dispatch orders."
                />
            </div>

            <footer className="mt-12 font-mono text-[11px] text-ink-faint tracking-widest">
                <Radio size={12} className="inline mr-1.5 -mt-0.5" />
                LAT 24.7136 · LNG 46.6753 · RIYADH SECTOR A
            </footer>
        </div>
    );
}

function RoleConsole({ onClick, icon, accent, tag, title, desc }) {
    const accentText = accent === 'live' ? 'text-live' : 'text-accident';
    const accentBorder = accent === 'live' ? 'group-hover:border-live/40' : 'group-hover:border-accident/40';
    const iconBg = accent === 'live' ? 'bg-live/10 text-live' : 'bg-accident/10 text-accident';

    return (
        <button
            onClick={onClick}
            className={`group relative text-left rounded-xl border border-line bg-panel ${accentBorder} p-7 transition-all duration-300 hover:bg-panel-2 hover:-translate-y-1`}
        >
            <div className="absolute top-6 right-6 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-ink">
                <ChevronRight size={20} />
            </div>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-5 transition-colors ${iconBg}`}>
                {icon}
            </div>
            <div className={`font-mono text-[10px] uppercase tracking-[0.25em] mb-1.5 ${accentText}`}>
                {tag}
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">{title}</h2>
            <p className="text-sm text-ink-dim leading-relaxed">{desc}</p>
        </button>
    );
}
