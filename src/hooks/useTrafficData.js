import { useState, useEffect } from 'react';
import { ref, onValue, set, update, push, remove } from 'firebase/database';
import { db } from '../lib/firebase';

/**
 * Central Firebase Realtime Database data layer for the command center.
 * Subscribes to live organizers + areas and exposes mutation helpers.
 */
export function useTrafficData() {
    const [organizers, setOrganizers] = useState([]);
    const [areas, setAreas] = useState([]);

    // Live organizers
    useEffect(() => {
        const organizersRef = ref(db, 'organizers');
        const unsubscribe = onValue(organizersRef, (snapshot) => {
            const data = snapshot.val();
            setOrganizers(data ? Object.values(data) : []);
        }, (error) => {
            console.error('Firebase connection error (organizers). Check config.', error);
        });
        return () => unsubscribe();
    }, []);

    // Live areas
    useEffect(() => {
        const areasRef = ref(db, 'areas');
        const unsubscribe = onValue(areasRef, (snapshot) => {
            const data = snapshot.val();
            setAreas(data ? Object.values(data) : []);
        }, (error) => {
            console.error('Firebase connection error (areas). Check config.', error);
        });
        return () => unsubscribe();
    }, []);

    // ── Organizer mutations ──────────────────────────────────────────────
    const addOrganizer = (organizer) => {
        set(ref(db, `organizers/${organizer.id}`), organizer);
    };

    const updateOrganizer = (id, newData) => {
        update(ref(db, `organizers/${id}`), newData);
    };

    const setPresence = (id, presence) => {
        update(ref(db, `organizers/${id}`), { presence });
    };

    // ── Area mutations ───────────────────────────────────────────────────
    const updateAreaStatus = (id, status) => {
        update(ref(db, `areas/${id}`), { status });
    };

    const addArea = (areaData) => {
        const newAreaRef = push(ref(db, 'areas'));
        const newAreaId = newAreaRef.key;
        set(newAreaRef, { id: newAreaId, ...areaData });
        return newAreaId;
    };

    const removeArea = (id) => {
        remove(ref(db, `areas/${id}`));
    };

    // ── Task dispatch (manager → organizer) ──────────────────────────────
    const sendCommand = (organizerId, message) => {
        set(ref(db, `commands/${organizerId}`), {
            message,
            timestamp: Date.now(),
        });
    };

    return {
        organizers,
        areas,
        addOrganizer,
        updateOrganizer,
        setPresence,
        updateAreaStatus,
        addArea,
        removeArea,
        sendCommand,
    };
}

/**
 * Subscribe to commands dispatched to a single organizer.
 * Returns the latest command object ({ message, timestamp }) or null.
 */
export function useOrganizerCommands(organizerId) {
    const [command, setCommand] = useState(null);

    useEffect(() => {
        if (!organizerId) return;
        const commandRef = ref(db, `commands/${organizerId}`);
        const unsubscribe = onValue(commandRef, (snapshot) => {
            setCommand(snapshot.val() || null);
        });
        return () => unsubscribe();
    }, [organizerId]);

    return command;
}
