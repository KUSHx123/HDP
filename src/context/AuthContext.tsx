import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

type UserType = {
  id: string;
  email: string;
  fullName: string;
  user_metadata?: {
    avatar_url?: string;
    full_name?: string;
    role?: string;
  };
};

export type AuthContextType = {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>;
  signOut: () => void;
  updateProfile: (fullName: string, file?: File) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>; // ✅ Added deleteAccount
  token: string | null;
  user: UserType | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || null);
  const [user, setUser] = useState<UserType | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ✅ Sign In function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/login', { email, password });

      if (response.data.access_token) {
        setToken(response.data.access_token);

        const newUser: UserType = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          user_metadata: response.data.user.user_metadata,
        };

        setUser(newUser);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Sign Up function
  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        username: fullName,
        password,
        email
      });

      if (response.data.access_token) {
        setToken(response.data.access_token);

        const newUser: UserType = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.fullName,
          user_metadata: response.data.user.user_metadata,
        };

        setUser(newUser);
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('user', JSON.stringify(newUser));
      }

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Signup failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Sign Out function
  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // ✅ Update Profile function
  const updateProfile = async (fullName: string, file?: File) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      if (file) {
        formData.append('avatar', file);
      }

      const response = await axios.put('http://localhost:8000/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        const updatedUser: UserType = {
          id: response.data.user.id,
          email: response.data.user.email,
          fullName: response.data.user.full_name, // ✅ Fixed to fullName
          user_metadata: response.data.user.user_metadata || {},
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Profile update failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Delete Account function
  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      const response = await axios.delete('http://localhost:8000/user/delete', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      return {};
    } catch (error: any) {
      return { error: error.response?.data?.detail || 'Failed to delete account' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut,
        updateProfile,
        deleteAccount, // ✅ Added to context
        token,
        user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
