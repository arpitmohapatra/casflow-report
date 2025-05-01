import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { UserCircle, LogOut } from 'lucide-react';

interface User {
  name: string;
  email: string;
  roles: string[];
}

const Header: React.FC = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [localAuth, setLocalAuth] = useState<boolean>(false);

  useEffect(() => {
    // Check for local authentication
    const isLocalAuth = localStorage.getItem('authenticated') === 'true';
    setLocalAuth(isLocalAuth);
    
    if (isLocalAuth) {
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (e) {
          console.error('Failed to parse user data');
        }
      }
    }
  }, []);

  const handleLogout = () => {
    if (process.env.NODE_ENV === 'development') {
      localStorage.removeItem('authenticated');
      localStorage.removeItem('user');
      setUser(null);
      setLocalAuth(false);
      window.location.reload();
    } else {
      instance.logoutRedirect();
    }
  };

  const isUserAuthenticated = isAuthenticated || localAuth;

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Cashflow Report Generator</h1>
        </div>
        <div className="flex items-center gap-3">
          {isUserAuthenticated && user && (
            <div className="flex items-center gap-2 text-sm">
              <UserCircle className="h-5 w-5" />
              <span>{user.name}</span>
            </div>
          )}
          
          {isUserAuthenticated && (
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 