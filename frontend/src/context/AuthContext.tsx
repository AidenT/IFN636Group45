import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserResponseData } from '../types/authTypes';

// Define the shape of the AuthContext
interface AuthContextType {
  user: UserResponseData | null;
  login: (userData: UserResponseData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define props for the AuthProvider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserResponseData | null>(null);

  const login = (userData: UserResponseData): void => {
    setUser(userData);
  };

  const logout = (): void => {
    setUser(null);
  };

  // Computed property to check if user is authenticated
  const isAuthenticated = user !== null;

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook with proper type checking
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};