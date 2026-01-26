import { useState, useEffect } from 'react';
import { ref, onValue, set, update, push } from 'firebase/database';
import { db } from '../lib/firebase';

const STORAGE_KEY = 'tms_traffic_data_v2';

export function useTrafficData() {
  const [organizers, setOrganizers] = useState([]);

  // Sync with Firebase Realtime Database
  useEffect(() => {
    try {
      const organizersRef = ref(db, 'organizers');
      const unsubscribe = onValue(organizersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          // Convert object (Firebase) to array (App)
          const orgList = Object.values(data);
          setOrganizers(orgList);

          // Legacy support: also update local storage for fallback/debug
          localStorage.setItem(STORAGE_KEY, JSON.stringify(orgList));
        } else {
          setOrganizers([]);
        }
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Firebase connection error. Check your config.", error);
    }
  }, []);

  // Update an existing organizer
  const updateOrganizer = (id, newData) => {
    // Optimistic update
    setOrganizers(prev => prev.map(o => o.id === id ? { ...o, ...newData } : o));

    // Firebase Update
    // We assume ID is used as key for simplicity, or we query to find the key
    // For this simple app, let's use the ID as the path key if possible, 
    // or just overwrite the object in the array logic. 
    // To keep it simple and robust: we will write to `organizers/ID`

    update(ref(db, `organizers/${id}`), newData);
  };

  // Add a new organizer
  const addOrganizer = (organizer) => {
    // Optimistic update
    setOrganizers(prev => [...prev, organizer]);

    // Firebase set
    set(ref(db, `organizers/${organizer.id}`), organizer);
  };

  return { organizers, updateOrganizer, addOrganizer };
}
