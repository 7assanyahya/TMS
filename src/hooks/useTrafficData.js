import { useState, useEffect } from 'react';
import { ref, onValue, set, update, get, push, remove } from 'firebase/database';
import { db } from '../lib/firebase';

// const initialAreas = {
//     'area-1': {
//         id: 'area-1',
//         name: 'King Fahd Road',
//         type: 'road',
//         status: 'open',
//         path: [[24.7136, 46.6753], [24.72, 46.68]]
//     },
//     'area-2': {
//         id: 'area-2',
//         name: 'Olaya Street',
//         type: 'road',
//         status: 'open',
//         path: [[24.70, 46.68], [24.71, 46.69]]
//     },
//     'area-3': {
//         id: 'area-3',
//         name: 'Main Event Stage',
//         type: 'event_space',
//         status: 'open',
//         path: [[24.69, 46.675], [24.695, 46.68]]
//     },
//     'area-4': {
//         id: 'area-4',
//         name: 'North Parking',
//         type: 'parking',
//         status: 'open',
//         path: [[24.725, 46.67], [24.728, 46.675]]
//     },
//     'area-5': {
//         id: 'area-5',
//         name: 'West Walkway',
//         type: 'walkway',
//         status: 'open',
//         path: [[24.71, 46.67], [24.715, 46.672]]
//     }
// };

// async function seedInitialData() {
//     const areasRef = ref(db, 'areas');
//     const snapshot = await get(areasRef);
//     if (!snapshot.exists() || snapshot.val() === null) {
//         console.log('No area data found, seeding initial areas...');
//         await set(areasRef, initialAreas);
//     }
// }

// // Seed data on initial load
// seedInitialData();

export function useTrafficData() {
    const [organizers, setOrganizers] = useState([]);
    const [areas, setAreas] = useState([]);

    // Sync Organizers with Firebase
    useEffect(() => {
        try {
            const organizersRef = ref(db, 'organizers');
            const unsubscribe = onValue(organizersRef, (snapshot) => {
                const data = snapshot.val();
                setOrganizers(data ? Object.values(data) : []);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase connection error (organizers). Check config.", error);
        }
    }, []);

    // Sync Areas with Firebase
    useEffect(() => {
        try {
            const areasRef = ref(db, 'areas');
            const unsubscribe = onValue(areasRef, (snapshot) => {
                const data = snapshot.val();
                setAreas(data ? Object.values(data) : []);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase connection error (areas). Check config.", error);
        }
    }, []);


    // Update an existing organizer
    const updateOrganizer = (id, newData) => {
        update(ref(db, `organizers/${id}`), newData);
    };

    // Add a new organizer
    const addOrganizer = (organizer) => {
        set(ref(db, `organizers/${organizer.id}`), organizer);
    };

    // Update an area's status
    const updateAreaStatus = (id, status) => {
        update(ref(db, `areas/${id}`), { status });
    };

    // Add a new area
    const addArea = (areaData) => {
        const newAreaRef = push(ref(db, 'areas'));
        const newAreaId = newAreaRef.key;
        const newArea = {
            id: newAreaId,
            ...areaData
        };
        set(newAreaRef, newArea);
        return newAreaId;
    };

    // Remove an area
    const removeArea = (id) => {
        remove(ref(db, `areas/${id}`));
    };

    return { organizers, areas, updateOrganizer, addOrganizer, updateAreaStatus, addArea, removeArea };
}
