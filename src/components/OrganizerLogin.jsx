import React, { useState } from 'react';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import './OrganizerApp.css'; // Reuse styles

export default function OrganizerLogin({ onJoin, onBack }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        // Generate a simple unique ID
        const id = `org-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        onJoin({ id, name });
    };

    return (
        <div className="landing-container">
            <div className="glass-panel p-8 max-w-md w-full relative">
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="text-center mb-8 mt-4">
                    <div className="mx-auto w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4">
                        <User size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Identify Yourself</h2>
                    <p className="text-slate-400">Enter your name to join the operations network.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Agent Name (e.g. Officer John)"
                        className="w-full p-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={!name.trim()}
                        className="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Join Network <ArrowRight size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
