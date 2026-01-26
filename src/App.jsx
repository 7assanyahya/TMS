import React, { useState } from 'react';
import Landing from './components/Landing';
import OrganizerApp from './components/OrganizerApp';
import ManagerDashboard from './components/ManagerDashboard';

function App() {
  const [view, setView] = useState('landing'); // landing, organizer, manager

  const handleBack = () => setView('landing');

  return (
    <>
      {view === 'landing' && (
        <Landing onSelectRole={(role) => setView(role)} />
      )}

      {view === 'organizer' && (
        <OrganizerApp onBack={handleBack} />
      )}

      {view === 'manager' && (
        <ManagerDashboard onBack={handleBack} />
      )}
    </>
  );
}

export default App;
