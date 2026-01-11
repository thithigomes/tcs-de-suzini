import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tournaments from "./pages/Tournaments";
import Matches from "./pages/Matches";
import Rankings from "./pages/Rankings";
import Training from "./pages/Training";
import News from "./pages/News";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Referent from "./pages/Referent";
import ResetPassword from "./pages/ResetPassword";

// IMPORTANT: Set REACT_APP_BACKEND_URL environment variable in Vercel dashboard
// Example: https://your-backend-url.railway.app or https://your-backend-url.onrender.com
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
if (!process.env.REACT_APP_BACKEND_URL) {
  console.warn("⚠️  REACT_APP_BACKEND_URL is not configured. Using default: http://localhost:8000");
}
export const API = `${BACKEND_URL}/api`;

export const AuthContext = React.createContext();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeData = async () => {
      try {
        await axios.post(`${API}/seed-data`);
      } catch (error) {
        console.log('Seed data already exists or error:', error.message);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          // Se for visitante, não fazer requisição
          if (token === 'temp-guest-token') {
            setLoading(false);
            return;
          }
          const response = await axios.get(`${API}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Error fetching user:', error);
          // NÃO fazer logout automático - manter token válido mesmo se API falhar
          // localStorage.removeItem('token');
          // setToken(null);
          setUser(null); // Apenas limpar user, mas manter token
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <div className="text-[#064E3B] text-xl font-manrope">Chargement...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/tournaments" element={token ? <Tournaments /> : <Navigate to="/login" />} />
          <Route path="/matches" element={token ? <Matches /> : <Navigate to="/login" />} />
          <Route path="/rankings" element={token ? <Rankings /> : <Navigate to="/login" />} />
          <Route path="/training" element={token ? <Training /> : <Navigate to="/login" />} />
          <Route path="/news" element={token ? <News /> : <Navigate to="/login" />} />
          <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/admin" element={token && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
          <Route path="/referent" element={token && user?.role === 'referent' ? <Referent /> : <Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthContext.Provider>
  );
}

export default App;