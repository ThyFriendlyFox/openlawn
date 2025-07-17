import { Leaf } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSettings = () => {
    console.log('Settings clicked');
    // TODO: Navigate to settings page
  };

  const handleNotifications = () => {
    console.log('Notifications clicked');
    // TODO: Open notifications panel
  };

  const handleHelp = () => {
    console.log('Help clicked');
    // TODO: Open help/support page
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background z-10 shadow-sm">
      <div className="flex items-center">
        <Leaf className="text-primary w-6 h-6 mr-2" />
        <h1 className="text-xl font-bold text-gray-800 font-headline">
          LawnRoute
        </h1>
      </div>
      
      {user && (
        <UserProfile
          user={user}
          onLogout={handleLogout}
          onSettings={handleSettings}
          onNotifications={handleNotifications}
          onHelp={handleHelp}
        />
      )}
    </header>
  );
}
