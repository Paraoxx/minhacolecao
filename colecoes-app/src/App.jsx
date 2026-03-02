import { useState } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppLayout } from "./components/AppLayout"
import { Home } from "./pages/Home"
import { Gallery } from "./pages/Gallery"
import { AuthView } from "./components/AuthView"

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <AuthView onLoginSuccess={setCurrentUser} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/collections" element={<Gallery />} />
          <Route path="/categories" element={<div className="p-8 text-2xl font-bold">Categories Placeholder</div>} />
          <Route path="/settings" element={<div className="p-8 text-2xl font-bold">Settings Placeholder</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
