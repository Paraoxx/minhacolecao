import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { Home } from "./pages/Home"
import { Gallery } from "./pages/Gallery"
import { AuthView } from "./components/AuthView"
import { Settings } from "./pages/Settings"
import { Toaster } from 'react-hot-toast'
function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null; // Handle potential JSON parse errors safely
      }
    }
    return null;
  });

  const handleLoginSuccess = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Gallery />} />
          <Route path="/categories" element={<div className="p-8 text-2xl font-bold">Categories Placeholder</div>} />
          <Route path="/settings" element={<Settings onLogout={handleLogout} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
