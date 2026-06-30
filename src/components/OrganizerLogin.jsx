import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function OrganizerLogin({ onJoin, onBack }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        const id = `org-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        onJoin({ id, name: name.trim() });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-2">
            <div className="w-full max-w-sm bg-surface rounded-lg border border-line shadow-g p-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-5"
                >
                    <ArrowLeft size={18} /> Back
                </button>

                <h2 className="text-xl font-medium text-ink">Sign in as Organizer</h2>
                <p className="text-ink-dim text-sm mt-1 mb-5">Enter your name to join the network.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm text-ink-dim mb-1.5">Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Officer John"
                            className="w-full px-3 py-2.5 rounded border border-line text-ink placeholder:text-ink-faint outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-2.5 rounded bg-primary text-white font-medium transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
