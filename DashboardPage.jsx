import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('hb-money-token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('hb-money-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('hb-money-token', token);
    } else {
      localStorage.removeItem('hb-money-token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('hb-money-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('hb-money-user');
    }
  }, [user]);

  const value = useMemo(
    () => ({
      token,
      user,
      login(nextToken, nextUser) {
        setToken(nextToken);
        setUser(nextUser);
      },
      logout() {
        setToken(null);
        setUser(null);
      },
      updateUser(nextUser) {
        setUser((current) => ({ ...current, ...nextUser }));
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
