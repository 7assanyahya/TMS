import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tms_traffic_data_v2';

const INITIAL_DATA = [];

export function useTrafficData() {
  const [organizers, setOrganizers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  // Sync with localStorage changes (cross-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        setOrganizers(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save changes
  const updateOrganizer = (id, newData) => {
    const updated = organizers.map(org =>
      org.id === id ? { ...org, ...newData } : org
    );
    setOrganizers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addOrganizer = (organizer) => {
    const updated = [...organizers, organizer];
    setOrganizers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return { organizers, updateOrganizer, addOrganizer };
}
