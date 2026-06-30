import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';

export default function OrganizerLogin({ onJoin, onBack }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const id = `org-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        onJoin({ id, name: name.trim() });
    };

    return (
        <div className="ops-grid relative min-h-screen flex items-center justify-center p-6">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[50vw] h-[50vw] rounded-full bg-live/10 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md rounded-xl border border-line bg-panel p-8">
                <button
                    onClick={onBack}
                    className="absolute top-5 left-5 text-ink-faint hover:text-ink transition-colors"
                    aria-label="Back"
                >
                    <ArrowLeft size={20} />
                </button>

                <div className="text-center mb-8 mt-2">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-live/10 text-live mb-4">
                        <Smartphone size={28} />
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-live mb-2">
                        Field Node · Identify
                    </div>
                    <h2 className="text-2xl font-bold text-ink">Register Unit</h2>
                    <p className="text-ink-dim text-sm mt-1.5">
                        Enter your call sign to join the operations network.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Unit Bravo / Officer John"
                        className="w-full px-4 py-3.5 rounded-lg bg-panel-2 border border-line text-ink placeholder:text-ink-faint outline-none focus:border-live/60 transition-colors"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-3.5 rounded-lg bg-live font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ color: '#06212b' }}
                    >
                        Join Network <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
