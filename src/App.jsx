import React, { useState } from 'react';
import Landing from './components/Landing';
import OrganizerApp from './components/OrganizerApp';
import ManagerDashboard from './components/ManagerDashboard';
import OrganizerLogin from './components/OrganizerLogin';

function App() {
  const [view, setView] = useState('landing'); // landing, organizer-login, organizer-app, manager
  const [organizerUser, setOrganizerUser] = useState(null);

  const handleBack = () => setView('landing');

  const handleOrganizerJoin = (user) => {
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
