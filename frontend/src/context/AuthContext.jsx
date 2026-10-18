import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const loadUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  return {
    token,
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = (d) => {
    const u = {
      token: d.token,
      userId: d.userId ?? d.id,
      name: d.fullName || d.name || d.userName || d.email,
      role: String(d.role).replace('ROLE_', ''),
    };
    localStorage.setItem('token', u.token);
    localStorage.setItem('userId', u.userId);
    localStorage.setItem('userName', u.name);
    localStorage.setItem('userRole', u.role);
    setUser(u);
    return u;
  };

  const logout = () => {
    ['token', 'userId', 'userName', 'userRole'].forEach((k) => localStorage.removeItem(k));
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
