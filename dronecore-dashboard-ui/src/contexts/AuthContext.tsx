
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('tpdrones_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Get all registered users
    const savedUsers = localStorage.getItem('tpdrones_users');
    const users = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Add default users if no users exist
    if (users.length === 0) {
      const defaultUsers = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@tpdrones.com',
          role: 'admin',
          password: 'admin123',
          active: true,
          createdAt: '2024-01-01'
        },
        {
          id: '2',
          name: 'Tarcísio',
          email: 'tarcisiodsp08@gmail.com',
          role: 'admin',
          password: '040908',
          active: true,
          createdAt: '2024-01-01'
        }
      ];
      users.push(...defaultUsers);
      localStorage.setItem('tpdrones_users', JSON.stringify(users));
    }
    
    // Find user by email and password
    const foundUser = users.find((u: any) => 
      u.email === email && u.password === password && u.active
    );
    
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role
      };
      setUser(userSession);
      localStorage.setItem('tpdrones_current_user', JSON.stringify(userSession));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tpdrones_current_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
