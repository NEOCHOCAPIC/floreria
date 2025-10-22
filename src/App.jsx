import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Flores from './pages/Flores'
import Joyeria from './pages/Joyeria'
import Promociones from './pages/Promociones'
import QuienesSomos from './pages/QuienesSomos'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import WhatsAppButton from './components/WspButton'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Rutas del Admin (sin Header/Footer) */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Rutas públicas (con Header/Footer) */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/flores" element={<Flores />} />
                  <Route path="/joyeria" element={<Joyeria />} />
                  <Route path="/promociones" element={<Promociones />} />
                  <Route path="/quienes-somos" element={<QuienesSomos />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
        <WhatsAppButton />
      </div>
    </Router>
  )
}

export default App
