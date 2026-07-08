import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'

import Home      from './pages/Home'
import Services  from './pages/Services'
import Booking   from './pages/Booking'
import Shop      from './pages/Shop'
import Workshops from './pages/Workshops'
import Admin     from './pages/Admin'
import Navbar    from './components/Navbar'

function App() {
  const { token, fetchMe } = useAuthStore()

  useEffect(() => {
    if (token) fetchMe()
  }, [])

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"           element={<Home />} />
        <Route path="/servicios"  element={<Services />} />
        <Route path="/agendar"    element={<Booking />} />
        <Route path="/tienda"     element={<Shop />} />
        <Route path="/talleres"   element={<Workshops />} />
        <Route path="/admin"      element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
