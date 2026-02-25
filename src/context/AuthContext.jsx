import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Load initial state from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("skillmirror_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (data) => {
    setUser(data);
    localStorage.setItem("skillmirror_user", JSON.stringify(data));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("skillmirror_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
