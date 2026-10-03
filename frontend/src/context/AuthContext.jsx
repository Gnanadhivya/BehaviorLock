import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as loginApi, registerUser as registerApi, getCurrentUser as getMeApi } from '../services/api';
import api from '../services/api';
import { getDeviceFingerprint } from '../sdk/deviceFingerprint';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('behaviorlock_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('behaviorlock_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const userData = await getMeApi();
          setUser(userData);
          localStorage.setItem('behaviorlock_user', JSON.stringify(userData));
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (email, password) => {
    const fp = await getDeviceFingerprint();
    const data = await loginApi({ email, password, deviceFingerprint: fp });
    setToken(data.token);
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
    localStorage.setItem('behaviorlock_token', data.token);
    localStorage.setItem('behaviorlock_user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
    return data;
  };

  const loginWithGoogle = async (googleIdentity) => {
    const fp = await getDeviceFingerprint();
    const res = await api.post('/api/auth/google', {
      idToken: googleIdentity.idToken || 'mock_google_id_token',
      email: googleIdentity.email,
      name: googleIdentity.name,
      picture: googleIdentity.picture,
      deviceFingerprint: fp
    });
    const data = res.data;
    setToken(data.token);
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
    localStorage.setItem('behaviorlock_token', data.token);
    localStorage.setItem('behaviorlock_user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const data = await registerApi({ name, email, password, confirmPassword });
    setToken(data.token);
    setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
    localStorage.setItem('behaviorlock_token', data.token);
    localStorage.setItem('behaviorlock_user', JSON.stringify({ id: data.id, name: data.name, email: data.email, role: data.role }));
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('behaviorlock_token');
    localStorage.removeItem('behaviorlock_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
