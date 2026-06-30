import { useState, useEffect, useCallback } from 'react';
import { socket, API_URL } from '../lib/socket';

export function useTrafficData() {
    const [organizers, setOrganizers] = useState([]);
    const [areas, setAreas] = useState([]);
    const [commands, setCommands] = useState([]);

    // Real-time organizer sync over the socket
    useEffect(() => {
        const handleSync = (data) => setOrganizers(data);
        socket.on('organizers:sync', handleSync);
        socket.on('organizers:update', handleSync);
        return () => {
            socket.off('organizers:sync', handleSync);
            socket.off('organizers:update', handleSync);
        };
    }, []);

    // Areas: initial REST fetch, then live updates over the socket
    useEffect(() => {
        fetch(`${API_URL}/areas`)
            .then((res) => (res.ok ? res.json() : []))
            .then(setAreas)
            .catch((err) => console.error('Failed to load areas', err));

        const handleCreated = (area) => setAreas((prev) => [...prev, area]);
        const handleUpdated = (area) =>
            setAreas((prev) => prev.map((a) => (a.id === area.id ? area : a)));
        const handleDeleted = ({ id }) => setAreas((prev) => prev.filter((a) => a.id !== id));

        socket.on('area:created', handleCreated);
        socket.on('area:updated', handleUpdated);
        socket.on('area:deleted', handleDeleted);
        return () => {
            socket.off('area:created', handleCreated);
            socket.off('area:updated', handleUpdated);
            socket.off('area:deleted', handleDeleted);
        };
    }, []);

    // Commands dispatched from the manager, received by this client's organizer
    useEffect(() => {
        const handleCommand = (command) => setCommands((prev) => [...prev, command]);
        socket.on('command:received', handleCommand);
        return () => socket.off('command:received', handleCommand);
    }, []);

    const joinOrganizer = useCallback((id, name, lat, lng) => {
        socket.emit('organizer:join', { id, name, lat, lng });
    }, []);

    const updateLocation = useCallback((id, lat, lng) => {
        socket.emit('organizer:location', { id, lat, lng });
    }, []);

    const reportStatus = useCallback((id, status) => {
        socket.emit('organizer:status', { id, status });
    }, []);

    const setPresence = useCallback((id, presence) => {
        socket.emit('organizer:presence', { id, presence });
    }, []);

    const sendCommand = useCallback((organizerId, message) => {
        socket.emit('manager:command', { organizerId, message });
    }, []);

    const addArea = useCallback(async (areaData) => {
        const res = await fetch(`${API_URL}/areas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(areaData),
        });
        if (!res.ok) throw new Error('Failed to add area');
        return res.json();
    }, []);

    const updateAreaStatus = useCallback(async (id, status) => {
        const res = await fetch(`${API_URL}/areas/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error('Failed to update area');
        return res.json();
    }, []);

    const removeArea = useCallback(async (id) => {
        const res = await fetch(`${API_URL}/areas/${id}`, { method: 'DELETE' });
        if (!res.ok && res.status !== 404) throw new Error('Failed to remove area');
    }, []);

    return {
        organizers,
        areas,
        commands,
        joinOrganizer,
        updateLocation,
        reportStatus,
        setPresence,
        sendCommand,
        addArea,
        updateAreaStatus,
        removeArea,
    };
}
