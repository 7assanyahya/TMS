import React, { useState, useEffect } from 'react';
import Landing from './components/Landing';
import OrganizerApp from './components/OrganizerApp';
import ManagerDashboard from './components/ManagerDashboard';
import OrganizerLogin from './components/OrganizerLogin';

function App() {
  const [view, setView] = useState('landing'); // landing, organizer-login, organizer-app, manager
  const [organizerUser, setOrganizerUser] = useState(null);

  // Check for persisted user on mount
  useEffect(() => {
    const stored = localStorage.getItem('tms_organizer_user');
    if (stored) {
      const user = JSON.parse(stored);
      setOrganizerUser(user);
      setView('organizer-app');
    }
  }, []);

  const handleBack = () => {
    // If we are in organizer app, "Back" implies "Logout" or "Leave"
    // For now, let's clear the session so they *can* change their name if needed
    // OR should we keep it? "Save just one time" implies KEEP IT.
    // Let's Keep it in storage for refreshes, but if they click "Back", they go to landing.
    setView('landing');
  };

  const handleOrganizerJoin = (user) => {
    localStorage.setItem('tms_organizer_user', JSON.stringify(user));
    setOrganizerUser(user);
    setView('organizer-app');
  };

  return (
    <>
      {view === 'landing' && (
        <Landing onSelectRole={(role) => {
          if (role === 'organizer') setView('organizer-login');
          else setView('manager');
        }} />
      )}

      {view === 'organizer-login' && (
        <OrganizerLogin
          onJoin={handleOrganizerJoin}
          onBack={handleBack}
        />
      )}

      {view === 'organizer-app' && organizerUser && (
        <OrganizerApp
          user={organizerUser}
          onBack={handleBack}
        />
      )}

      {view === 'manager' && (
        <ManagerDashboard onBack={handleBack} />
      )}
    </>
  );
}

export default App;
