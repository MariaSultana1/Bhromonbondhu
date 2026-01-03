import { useState } from 'react';
import { HostHome } from './HostHome';
import { AllBookings } from './AllBookings';
import { AllReviews } from './AllReviews';

export function HostDashboardWrapper({ user, activeTab }) {
  const [view, setView] = useState('home');

  
  if (activeTab !== 'home' && view !== 'home') {
    setView('home');
  }

  if (activeTab === 'home') {
    if (view === 'allBookings') {
      return <AllBookings onBack={() => setView('home')} />;
    }

    if (view === 'allReviews') {
      return <AllReviews onBack={() => setView('home')} />;
    }

    return (
      <HostHome
        user={user}
        onViewAllBookings={() => setView('allBookings')}
        onViewAllReviews={() => setView('allReviews')}
      />
    );
  }

  return null;
}