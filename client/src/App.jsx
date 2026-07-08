import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/useAuthStore'

import Home           from './pages/Home'
import Services       from './pages/Services'
import Booking        from './pages/Booking'
import MyBookings     from './pages/MyBookings'
import Shop           from './pages/Shop'
import Checkout       from './pages/Checkout'
import MyOrders       from './pages/MyOrders'
import Workshops      from './pages/Workshops'
import Admin          from './pages/Admin'
import Login          from './pages/Login'
import Navbar         from './components/Navbar'
import CartDrawer     from './components/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
    const { token, fetchMe } = useAuthStore()

    useEffect(() => {
        if (token) fetchMe()
    }, [])

    return (
        <BrowserRouter>
            <Navbar />
            <CartDrawer />
            <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/servicios"   element={<Services />} />
                <Route path="/agendar"     element={<Booking />} />
                <Route path="/tienda"      element={<Shop />} />
                <Route path="/checkout"    element={<Checkout />} />
                <Route path="/talleres"    element={<Workshops />} />
                <Route path="/login"       element={<Login />} />
                <Route path="/mis-citas"   element={
                    <ProtectedRoute>
                        <MyBookings />
                    </ProtectedRoute>
                } />
                <Route path="/mis-pedidos" element={
                    <ProtectedRoute>
                        <MyOrders />
                    </ProtectedRoute>
                } />
                <Route path="/admin" element={
                    <ProtectedRoute adminRequired>
                        <Admin />
                    </ProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    )
}

export default App
