import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices, createService, updateService, deleteService } from '../api/services'
import { fetchAllBookings, updateBookingStatus } from '../api/bookings'
import { fetchAllProducts, createProduct, updateProduct, toggleProduct } from '../api/products'
import { fetchAllOrders, updateOrderStatus } from '../api/orders'
import { fetchAllWorkshops, createWorkshop, updateWorkshop, toggleWorkshop } from '../api/workshops'
import { fetchAllEnrollments, updateEnrollmentStatus } from '../api/enrollments'

// ─── Constantes ──────────────────────────────────────────────────────────────
const SVC_CATS  = ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro']
const PROD_CATS = ['esmaltes', 'cuidado', 'herramientas', 'nail-art', 'accesorios']
const EMPTY_SVC  = { name: '', description: '', price: '', duration: '', category: 'manicure', featured: false }
const EMPTY_PROD = { name: '', description: '', price: '', stock: '', brand: '', category: 'esmaltes', image: '' }
const EMPTY_WS   = { title: '', description: '', date: '', duration: '', modality: 'presencial', price: '', spots: '', image: '' }

const BOOKING_STATUS = {
    pending:   { label: 'Pendiente',  bg: '#FFF8E1', color: '#E65100' },
    confirmed: { label: 'Confirmada', bg: '#E8F5E9', color: '#2E7D32' },
    completed: { label: 'Completada', bg: '#E3F2FD', color: '#1565C0' },
    cancelled: { label: 'Cancelada',  bg: '#F5F5F5', color: '#757575' },
}
const ORDER_STATUS = {
    pending:   { label: 'Pendiente',  bg: '#FFF8E1', color: '#E65100' },
    paid:      { label: 'Pagado',     bg: '#E8F5E9', color: '#2E7D32' },
    shipped:   { label: 'En camino',  bg: '#E3F2FD', color: '#1565C0' },
    delivered: { label: 'Entregado',  bg: '#F3E5F5', color: '#6A1B9A' },
    cancelled: { label: 'Cancelado',  bg: '#F5F5F5', color: '#757575' },
}
const ENROLLMENT_STATUS = {
    pending:   { label: 'Pendiente',  bg: '#FFF8E1', color: '#E65100' },
    paid:      { label: 'Pagado',     bg: '#E8F5E9', color: '#2E7D32' },
    cancelled: { label: 'Cancelado',  bg: '#F5F5F5', color: '#757575' },
}

// ─── Estilos reutilizables ───────────────────────────────────────────────────
const inputSt = {
    width: '100%', padding: '9px 12px', border: '1px solid #F0D0DC',
    borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif',
    outline: 'none', background: '#fff', color: '#2D1520', boxSizing: 'border-box',
}
const labelSt = { fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }
const tabBtn  = (active) => ({
    padding: '8px 20px', borderRadius: 20, fontSize: 13, border: '1px solid',
    borderColor: active ? '#C2185B' : '#F0D0DC',
    background:  active ? '#C2185B' : '#fff',
    color:       active ? '#fff'    : '#6B4050',
    cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
})

// ─────────────────────────────────────────────────────────────────────────────
export default function Admin() {
    const { user, logout } = useAuthStore()
    const [tab, setTab] = useState('servicios') // servicios | citas | productos | pedidos | talleres

    // ── Servicios ────────────────────────────────────────────────────────────
    const [services, setServices] = useState([])
    const [svcForm, setSvcForm]   = useState(EMPTY_SVC)
    const [editing, setEditing]   = useState(null)
    const [svcLoad, setSvcLoad]   = useState(false)
    const [fetching, setFetching] = useState(true)

    // ── Citas ────────────────────────────────────────────────────────────────
    const [bookings, setBookings]   = useState([])
    const [bFilter, setBFilter]     = useState('all')
    const [bFetching, setBFetching] = useState(false)
    const [updatingId, setUpdatingId] = useState(null)

    // ── Productos ────────────────────────────────────────────────────────────
    const [products, setProducts]   = useState([])
    const [prodForm, setProdForm]   = useState(EMPTY_PROD)
    const [editProd, setEditProd]   = useState(null)
    const [prodLoad, setProdLoad]   = useState(false)
    const [prodFetching, setProdFetching] = useState(false)

    // ── Pedidos ──────────────────────────────────────────────────────────────
    const [orders, setOrders]     = useState([])
    const [oFilter, setOFilter]   = useState('all')
    const [oFetching, setOFetching] = useState(false)
    const [updatingOId, setUpdatingOId] = useState(null)

    // ── Talleres ─────────────────────────────────────────────────────────────
    const [workshops, setWorkshops] = useState([])
    const [wsForm, setWsForm]       = useState(EMPTY_WS)
    const [editWs, setEditWs]       = useState(null)
    const [wsLoad, setWsLoad]       = useState(false)
    const [wsFetching, setWsFetching] = useState(false)

    // ── Inscripciones ────────────────────────────────────────────────────────
    const [enrollments, setEnrollments]   = useState([])
    const [enFilter, setEnFilter]         = useState('all')
    const [enFetching, setEnFetching]     = useState(false)
    const [updatingEnId, setUpdatingEnId] = useState(null)

    // ── Toast ────────────────────────────────────────────────────────────────
    const [toast, setToast] = useState('')
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    // ── Carga inicial ────────────────────────────────────────────────────────
    useEffect(() => {
        setFetching(true)
        fetchServices()
            .then(({ data }) => setServices(data))
            .catch(() => showToast('Error al cargar servicios'))
            .finally(() => setFetching(false))
    }, [])

    useEffect(() => {
        if (tab === 'citas' && bookings.length === 0) {
            setBFetching(true)
            fetchAllBookings()
                .then(({ data }) => setBookings(data))
                .catch(() => showToast('Error al cargar citas'))
                .finally(() => setBFetching(false))
        }
        if (tab === 'productos' && products.length === 0) {
            setProdFetching(true)
            fetchAllProducts()
                .then(({ data }) => setProducts(data))
                .catch(() => showToast('Error al cargar productos'))
                .finally(() => setProdFetching(false))
        }
        if (tab === 'pedidos' && orders.length === 0) {
            setOFetching(true)
            fetchAllOrders()
                .then(({ data }) => setOrders(data))
                .catch(() => showToast('Error al cargar pedidos'))
                .finally(() => setOFetching(false))
        }
        if (tab === 'talleres' && workshops.length === 0) {
            setWsFetching(true)
            fetchAllWorkshops()
                .then(({ data }) => setWorkshops(data))
                .catch(() => showToast('Error al cargar talleres'))
                .finally(() => setWsFetching(false))
        }
        if (tab === 'talleres' && enrollments.length === 0) {
            setEnFetching(true)
            fetchAllEnrollments()
                .then(({ data }) => setEnrollments(data))
                .catch(() => showToast('Error al cargar inscripciones'))
                .finally(() => setEnFetching(false))
        }
    }, [tab])

    // ── CRUD Servicios ───────────────────────────────────────────────────────
    const handleSvc = (e) => {
        const { name, value, type, checked } = e.target
        setSvcForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }
    const startEditSvc  = (svc) => { setEditing(svc._id); setSvcForm({ name: svc.name, description: svc.description || '', price: svc.price, duration: svc.duration, category: svc.category, featured: svc.featured }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    const cancelEditSvc = () => { setEditing(null); setSvcForm(EMPTY_SVC) }
    const submitSvc = async (e) => {
        e.preventDefault(); setSvcLoad(true)
        const payload = { ...svcForm, price: Number(svcForm.price), duration: Number(svcForm.duration) }
        try {
            if (editing) {
                const { data } = await updateService(editing, payload)
                setServices(s => s.map(x => x._id === editing ? data : x))
                showToast('Servicio actualizado ✓')
            } else {
                const { data } = await createService(payload)
                setServices(s => [...s, data])
                showToast('Servicio creado ✓')
            }
            cancelEditSvc()
        } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
        finally { setSvcLoad(false) }
    }
    const handleDeleteSvc = async (id, name) => {
        if (!window.confirm(`¿Desactivar "${name}"?`)) return
        try { await deleteService(id); setServices(s => s.filter(x => x._id !== id)); showToast('Servicio desactivado ✓') }
        catch { showToast('Error al eliminar') }
    }

    // ── Acciones Citas ───────────────────────────────────────────────────────
    const changeBookingStatus = async (id, status) => {
        setUpdatingId(id)
        try {
            const { data } = await updateBookingStatus(id, status)
            setBookings(b => b.map(x => x._id === id ? data : x))
            showToast(`Cita ${BOOKING_STATUS[status]?.label.toLowerCase()} ✓`)
        } catch { showToast('Error al actualizar cita') }
        finally { setUpdatingId(null) }
    }

    // ── CRUD Productos ───────────────────────────────────────────────────────
    const handleProd = (e) => setProdForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const startEditProd  = (p) => { setEditProd(p._id); setProdForm({ name: p.name, description: p.description || '', price: p.price, stock: p.stock, brand: p.brand || '', category: p.category || 'esmaltes', image: p.image || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    const cancelEditProd = () => { setEditProd(null); setProdForm(EMPTY_PROD) }
    const submitProd = async (e) => {
        e.preventDefault(); setProdLoad(true)
        const payload = { ...prodForm, price: Number(prodForm.price), stock: Number(prodForm.stock) }
        try {
            if (editProd) {
                const { data } = await updateProduct(editProd, payload)
                setProducts(p => p.map(x => x._id === editProd ? data : x))
                showToast('Producto actualizado ✓')
            } else {
                const { data } = await createProduct(payload)
                setProducts(p => [...p, data])
                showToast('Producto creado ✓')
            }
            cancelEditProd()
        } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
        finally { setProdLoad(false) }
    }
    const handleToggleProd = async (id, name, active) => {
        if (!window.confirm(`¿${active ? 'Desactivar' : 'Activar'} "${name}"?`)) return
        try {
            const { data } = await toggleProduct(id)
            setProducts(p => p.map(x => x._id === id ? data : x))
            showToast(`Producto ${data.active ? 'activado' : 'desactivado'} ✓`)
        } catch { showToast('Error al cambiar estado') }
    }

    // ── Acciones Pedidos ─────────────────────────────────────────────────────
    const changeOrderStatus = async (id, status) => {
        setUpdatingOId(id)
        try {
            const { data } = await updateOrderStatus(id, status)
            setOrders(o => o.map(x => x._id === id ? data : x))
            showToast(`Pedido ${ORDER_STATUS[status]?.label.toLowerCase()} ✓`)
        } catch { showToast('Error al actualizar pedido') }
        finally { setUpdatingOId(null) }
    }

    // ── CRUD Talleres ────────────────────────────────────────────────────────
    const handleWs = (e) => setWsForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const startEditWs  = (w) => { setEditWs(w._id); setWsForm({ title: w.title, description: w.description || '', date: w.date.slice(0, 10), duration: w.duration || '', modality: w.modality || 'presencial', price: w.price, spots: w.spots, image: w.image || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    const cancelEditWs = () => { setEditWs(null); setWsForm(EMPTY_WS) }
    const submitWs = async (e) => {
        e.preventDefault(); setWsLoad(true)
        const payload = { ...wsForm, price: Number(wsForm.price), spots: Number(wsForm.spots), duration: Number(wsForm.duration) }
        try {
            if (editWs) {
                const { data } = await updateWorkshop(editWs, payload)
                setWorkshops(w => w.map(x => x._id === editWs ? { ...data, spotsLeft: x.spotsLeft } : x))
                showToast('Taller actualizado ✓')
            } else {
                const { data } = await createWorkshop(payload)
                setWorkshops(w => [...w, { ...data, spotsLeft: data.spots }])
                showToast('Taller creado ✓')
            }
            cancelEditWs()
        } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
        finally { setWsLoad(false) }
    }
    const handleToggleWs = async (id, title, active) => {
        if (!window.confirm(`¿${active ? 'Desactivar' : 'Activar'} "${title}"?`)) return
        try {
            const { data } = await toggleWorkshop(id)
            setWorkshops(w => w.map(x => x._id === id ? { ...x, active: data.active } : x))
            showToast(`Taller ${data.active ? 'activado' : 'desactivado'} ✓`)
        } catch { showToast('Error al cambiar estado') }
    }

    // ── Acciones Inscripciones ───────────────────────────────────────────────
    const changeEnrollmentStatus = async (id, status) => {
        setUpdatingEnId(id)
        try {
            const { data } = await updateEnrollmentStatus(id, status)
            setEnrollments(e => e.map(x => x._id === id ? data : x))
            showToast(`Inscripción ${ENROLLMENT_STATUS[status]?.label.toLowerCase()} ✓`)
        } catch { showToast('Error al actualizar inscripción') }
        finally { setUpdatingEnId(null) }
    }

    // ── Filtros ──────────────────────────────────────────────────────────────
    const filteredBookings = bFilter === 'all' ? bookings : bookings.filter(b => b.status === bFilter)
    const filteredOrders   = oFilter === 'all' ? orders   : orders.filter(o => o.status === oFilter)
    const filteredEnrollments = enFilter === 'all' ? enrollments : enrollments.filter(e => e.status === enFilter)

    const bStats = {
        total:     bookings.length,
        pending:   bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        today:     bookings.filter(b => {
            const d = new Date(b.date); const t = new Date()
            return d.getUTCDate() === t.getDate() && d.getUTCMonth() === t.getMonth() && d.getUTCFullYear() === t.getFullYear()
        }).length,
    }
    const oStats = {
        total:   orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        paid:    orders.filter(o => o.status === 'paid').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
    }
    const wsStats = {
        total:    workshops.length,
        active:   workshops.filter(w => w.active).length,
        pendingEn: enrollments.filter(e => e.status === 'pending').length,
        paidEn:    enrollments.filter(e => e.status === 'paid').length,
    }

    return (
        <div style={{ minHeight: '100vh', background: '#FDF0F5' }}>

            {/* Toast */}
            {toast && (
                <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 1000, background: '#1D9E75', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                    {toast}
                </div>
            )}

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #F0D0DC', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                    <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#C2185B', fontWeight: 600 }}>
                        Panel de administración
                    </h1>
                    <p style={{ fontSize: 12, color: '#6B4050', marginTop: 2 }}>Bienvenida, {user?.name}</p>
                </div>
                <button onClick={logout} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#C2185B', borderRadius: 20, padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    Cerrar sesión
                </button>
            </div>

            <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setTab('servicios')} style={tabBtn(tab === 'servicios')}>✂️ Servicios</button>
                    <button onClick={() => setTab('citas')}     style={tabBtn(tab === 'citas')}>📅 Citas</button>
                    <button onClick={() => setTab('productos')} style={tabBtn(tab === 'productos')}>🛍️ Productos</button>
                    <button onClick={() => setTab('pedidos')}   style={tabBtn(tab === 'pedidos')}>📦 Pedidos</button>
                    <button onClick={() => setTab('talleres')}  style={tabBtn(tab === 'talleres')}>🎓 Talleres</button>
                </div>

                {/* ════════ SERVICIOS ════════ */}
                {tab === 'servicios' && (
                    <>
                        <div className="rn-admin-stats-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
                            {[
                                { label: 'Servicios activos', value: services.length },
                                { label: 'Destacados', value: services.filter(s => s.featured).length },
                                { label: 'Categorías', value: new Set(services.map(s => s.category)).size },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#C2185B' }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="rn-admin-split" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                            {/* Lista */}
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
                                    Servicios ({services.length})
                                </h2>
                                {fetching ? (
                                    <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando...</p>
                                ) : services.length === 0 ? (
                                    <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                        No hay servicios. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {services.map(svc => (
                                            <div key={svc._id} style={{ background: editing === svc._id ? '#FFF0F5' : '#fff', border: `1px solid ${editing === svc._id ? '#C2185B' : '#F0D0DC'}`, borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 14, fontWeight: 500, color: '#2D1520' }}>{svc.name}</span>
                                                        {svc.featured && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#F8C8DC', color: '#88134A' }}>Destacado</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B4050' }}>
                                                        <span style={{ color: '#C2185B', fontWeight: 500 }}>${svc.price}</span>
                                                        <span>{svc.duration} min</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{svc.category}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => startEditSvc(svc)} style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', color: '#C2185B', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Editar</button>
                                                    <button onClick={() => handleDeleteSvc(svc._id, svc.name)} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Desactivar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form servicio */}
                            <div className="rn-admin-form-panel" style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                                    {editing ? 'Editar servicio' : 'Nuevo servicio'}
                                </h2>
                                <form onSubmit={submitSvc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div><label style={labelSt}>Nombre *</label><input name="name" value={svcForm.name} onChange={handleSvc} style={inputSt} placeholder="Manicure Gel" required /></div>
                                    <div><label style={labelSt}>Descripción</label><input name="description" value={svcForm.description} onChange={handleSvc} style={inputSt} placeholder="Breve descripción" /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div><label style={labelSt}>Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={svcForm.price} onChange={handleSvc} style={inputSt} placeholder="25" required /></div>
                                        <div><label style={labelSt}>Duración (min) *</label><input name="duration" type="number" min="1" value={svcForm.duration} onChange={handleSvc} style={inputSt} placeholder="60" required /></div>
                                    </div>
                                    <div><label style={labelSt}>Categoría</label><select name="category" value={svcForm.category} onChange={handleSvc} style={inputSt}>{SVC_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B4050', cursor: 'pointer' }}>
                                        <input type="checkbox" name="featured" checked={svcForm.featured} onChange={handleSvc} style={{ accentColor: '#C2185B', width: 16, height: 16 }} />
                                        Marcar como destacado
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button type="submit" disabled={svcLoad} style={{ flex: 1, background: svcLoad ? '#e88aaa' : '#C2185B', color: '#fff', border: 'none', borderRadius: 24, padding: '11px', fontSize: 13, fontWeight: 500, cursor: svcLoad ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                            {svcLoad ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear servicio'}
                                        </button>
                                        {editing && <button type="button" onClick={cancelEditSvc} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#6B4050', borderRadius: 24, padding: '11px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ CITAS ════════ */}
                {tab === 'citas' && (
                    <>
                        <div className="rn-admin-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '2rem' }}>
                            {[
                                { label: 'Total citas',  value: bStats.total,     color: '#C2185B' },
                                { label: 'Pendientes',   value: bStats.pending,   color: '#E65100' },
                                { label: 'Confirmadas',  value: bStats.confirmed, color: '#2E7D32' },
                                { label: 'Hoy',          value: bStats.today,     color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 26, fontWeight: 700, color: st.color }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {[['all', 'Todas'], ['pending', 'Pendientes'], ['confirmed', 'Confirmadas'], ['completed', 'Completadas'], ['cancelled', 'Canceladas']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setBFilter(key)} style={tabBtn(bFilter === key)}>{lbl}</button>
                            ))}
                        </div>

                        {bFetching ? (
                            <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando citas...</p>
                        ) : filteredBookings.length === 0 ? (
                            <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                No hay citas en esta categoría.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {filteredBookings.map(b => {
                                    const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending
                                    const dateStr = new Date(b.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
                                    return (
                                        <div key={b._id} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 14, padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>{b.client?.name}</span>
                                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 4 }}>
                                                        <span>📅 {dateStr} · {b.timeSlot}</span>
                                                        <span>💅 {b.service?.name}</span>
                                                        {b.service?.price && <span style={{ color: '#C2185B' }}>${b.service.price}</span>}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                                        {b.client?.phone && <span>📱 {b.client.phone}</span>}
                                                        {b.client?.email && <span>✉️ {b.client.email}</span>}
                                                    </div>
                                                    {b.notes && <p style={{ fontSize: 12, color: '#9E7080', marginTop: 6, fontStyle: 'italic' }}>"{b.notes}"</p>}
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                                                    {b.status === 'pending'   && <button onClick={() => changeBookingStatus(b._id, 'confirmed')} disabled={updatingId === b._id} style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Confirmar</button>}
                                                    {b.status === 'confirmed' && <button onClick={() => changeBookingStatus(b._id, 'completed')} disabled={updatingId === b._id} style={{ background: '#E3F2FD', border: '1px solid #90CAF9', color: '#1565C0', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Completar</button>}
                                                    {['pending', 'confirmed'].includes(b.status) && <button onClick={() => changeBookingStatus(b._id, 'cancelled')} disabled={updatingId === b._id} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ════════ PRODUCTOS ════════ */}
                {tab === 'productos' && (
                    <>
                        <div className="rn-admin-stats-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
                            {[
                                { label: 'Total productos', value: products.length },
                                { label: 'Activos',         value: products.filter(p => p.active).length },
                                { label: 'Stock bajo (<5)', value: products.filter(p => p.stock < 5 && p.active).length, warn: true },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.25rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: st.warn ? '#E65100' : '#C2185B' }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="rn-admin-split" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                            {/* Lista */}
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
                                    Productos ({products.length})
                                </h2>
                                {prodFetching ? (
                                    <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando...</p>
                                ) : products.length === 0 ? (
                                    <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                        No hay productos. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {products.map(p => (
                                            <div key={p._id} style={{
                                                background: editProd === p._id ? '#FFF0F5' : p.active ? '#fff' : '#fafafa',
                                                border: `1px solid ${editProd === p._id ? '#C2185B' : '#F0D0DC'}`,
                                                borderRadius: 12, padding: '1rem 1.25rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                flexWrap: 'wrap', gap: 10,
                                                opacity: p.active ? 1 : 0.6,
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                        <span style={{ fontSize: 14, fontWeight: 500, color: '#2D1520' }}>{p.name}</span>
                                                        {!p.active && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#F5F5F5', color: '#9E7080' }}>Inactivo</span>}
                                                        {p.stock < 5 && p.active && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#FFF3E0', color: '#E65100' }}>Stock: {p.stock}</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B4050' }}>
                                                        <span style={{ color: '#C2185B', fontWeight: 500 }}>${p.price}</span>
                                                        <span>Stock: {p.stock}</span>
                                                        {p.brand && <span>{p.brand}</span>}
                                                        <span style={{ textTransform: 'capitalize' }}>{p.category}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => startEditProd(p)} style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', color: '#C2185B', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Editar</button>
                                                    <button onClick={() => handleToggleProd(p._id, p.name, p.active)} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                        {p.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form producto */}
                            <div className="rn-admin-form-panel" style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                                    {editProd ? 'Editar producto' : 'Nuevo producto'}
                                </h2>
                                <form onSubmit={submitProd} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    <div><label style={labelSt}>Nombre *</label><input name="name" value={prodForm.name} onChange={handleProd} style={inputSt} placeholder="Esmalte Gel Rojo" required /></div>
                                    <div><label style={labelSt}>Descripción</label><input name="description" value={prodForm.description} onChange={handleProd} style={inputSt} placeholder="Breve descripción" /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div><label style={labelSt}>Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={prodForm.price} onChange={handleProd} style={inputSt} placeholder="12.99" required /></div>
                                        <div><label style={labelSt}>Stock *</label><input name="stock" type="number" min="0" value={prodForm.stock} onChange={handleProd} style={inputSt} placeholder="20" required /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div><label style={labelSt}>Marca</label><input name="brand" value={prodForm.brand} onChange={handleProd} style={inputSt} placeholder="OPI" /></div>
                                        <div><label style={labelSt}>Categoría</label><select name="category" value={prodForm.category} onChange={handleProd} style={inputSt}>{PROD_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                                    </div>
                                    <div><label style={labelSt}>URL de imagen</label><input name="image" value={prodForm.image} onChange={handleProd} style={inputSt} placeholder="https://..." /></div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button type="submit" disabled={prodLoad} style={{ flex: 1, background: prodLoad ? '#e88aaa' : '#C2185B', color: '#fff', border: 'none', borderRadius: 24, padding: '11px', fontSize: 13, fontWeight: 500, cursor: prodLoad ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                            {prodLoad ? 'Guardando...' : editProd ? 'Guardar cambios' : 'Crear producto'}
                                        </button>
                                        {editProd && <button type="button" onClick={cancelEditProd} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#6B4050', borderRadius: 24, padding: '11px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ PEDIDOS ════════ */}
                {tab === 'pedidos' && (
                    <>
                        <div className="rn-admin-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '2rem' }}>
                            {[
                                { label: 'Total pedidos', value: oStats.total,   color: '#C2185B' },
                                { label: 'Pendientes',    value: oStats.pending, color: '#E65100' },
                                { label: 'Pagados',       value: oStats.paid,    color: '#2E7D32' },
                                { label: 'En camino',     value: oStats.shipped, color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 26, fontWeight: 700, color: st.color }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {[['all', 'Todos'], ['pending', 'Pendientes'], ['paid', 'Pagados'], ['shipped', 'En camino'], ['delivered', 'Entregados'], ['cancelled', 'Cancelados']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setOFilter(key)} style={tabBtn(oFilter === key)}>{lbl}</button>
                            ))}
                        </div>

                        {oFetching ? (
                            <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando pedidos...</p>
                        ) : filteredOrders.length === 0 ? (
                            <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                No hay pedidos en esta categoría.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {filteredOrders.map(o => {
                                    const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending
                                    const dateStr = new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                    return (
                                        <div key={o._id} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 14, padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>{o.client?.name}</span>
                                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                                                        <span style={{ fontSize: 12, color: '#9E7080' }}>{dateStr}</span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#6B4050', marginBottom: 6 }}>
                                                        {o.items.map((i, idx) => (
                                                            <span key={idx}>{i.name} ×{i.qty}{idx < o.items.length - 1 ? ', ' : ''}</span>
                                                        ))}
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                                        {o.client?.phone && <span>📱 {o.client.phone}</span>}
                                                        {o.client?.email && <span>✉️ {o.client.email}</span>}
                                                        <span style={{ color: '#C2185B', fontWeight: 600 }}>Total: ${o.total.toFixed(2)}</span>
                                                    </div>
                                                    {o.notes && <p style={{ fontSize: 12, color: '#9E7080', marginTop: 4, fontStyle: 'italic' }}>"{o.notes}"</p>}
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                                                    {o.status === 'pending'  && <button onClick={() => changeOrderStatus(o._id, 'paid')}      disabled={updatingOId === o._id} style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Marcar pagado</button>}
                                                    {o.status === 'paid'    && <button onClick={() => changeOrderStatus(o._id, 'shipped')}   disabled={updatingOId === o._id} style={{ background: '#E3F2FD', border: '1px solid #90CAF9', color: '#1565C0', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Marcar enviado</button>}
                                                    {o.status === 'shipped' && <button onClick={() => changeOrderStatus(o._id, 'delivered')} disabled={updatingOId === o._id} style={{ background: '#F3E5F5', border: '1px solid #CE93D8', color: '#6A1B9A', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Marcar entregado</button>}
                                                    {['pending', 'paid'].includes(o.status) && <button onClick={() => changeOrderStatus(o._id, 'cancelled')} disabled={updatingOId === o._id} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ════════ TALLERES ════════ */}
                {tab === 'talleres' && (
                    <>
                        <div className="rn-admin-stats-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '2rem' }}>
                            {[
                                { label: 'Talleres',              value: wsStats.total,     color: '#C2185B' },
                                { label: 'Activos',               value: wsStats.active,    color: '#2E7D32' },
                                { label: 'Inscripciones pend.',    value: wsStats.pendingEn, color: '#E65100' },
                                { label: 'Inscripciones pagadas',  value: wsStats.paidEn,    color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 26, fontWeight: 700, color: st.color }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="rn-admin-split" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start', marginBottom: '2.5rem' }}>
                            {/* Lista de talleres */}
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
                                    Talleres ({workshops.length})
                                </h2>
                                {wsFetching ? (
                                    <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando...</p>
                                ) : workshops.length === 0 ? (
                                    <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                        No hay talleres. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {workshops.map(w => (
                                            <div key={w._id} style={{
                                                background: editWs === w._id ? '#FFF0F5' : w.active ? '#fff' : '#fafafa',
                                                border: `1px solid ${editWs === w._id ? '#C2185B' : '#F0D0DC'}`,
                                                borderRadius: 12, padding: '1rem 1.25rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                opacity: w.active ? 1 : 0.6, flexWrap: 'wrap', gap: 10,
                                            }}>
                                                <div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 500, color: '#2D1520' }}>{w.title}</span>
                                                        {!w.active && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#F5F5F5', color: '#9E7080' }}>Inactivo</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B4050', flexWrap: 'wrap' }}>
                                                        <span style={{ color: '#C2185B', fontWeight: 500 }}>${w.price}</span>
                                                        <span>{new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span style={{ textTransform: 'capitalize' }}>{w.modality}</span>
                                                        <span>{w.spotsLeft}/{w.spots} cupos</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <button onClick={() => startEditWs(w)} style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', color: '#C2185B', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Editar</button>
                                                    <button onClick={() => handleToggleWs(w._id, w.title, w.active)} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                        {w.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form taller */}
                            <div className="rn-admin-form-panel" style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                                    {editWs ? 'Editar taller' : 'Nuevo taller'}
                                </h2>
                                <form onSubmit={submitWs} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    <div><label style={labelSt}>Título *</label><input name="title" value={wsForm.title} onChange={handleWs} style={inputSt} placeholder="Nail Art para principiantes" required /></div>
                                    <div><label style={labelSt}>Descripción</label><input name="description" value={wsForm.description} onChange={handleWs} style={inputSt} placeholder="Breve descripción" /></div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div><label style={labelSt}>Fecha *</label><input name="date" type="date" value={wsForm.date} onChange={handleWs} style={inputSt} required /></div>
                                        <div><label style={labelSt}>Duración (h)</label><input name="duration" type="number" min="1" value={wsForm.duration} onChange={handleWs} style={inputSt} placeholder="3" /></div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div><label style={labelSt}>Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={wsForm.price} onChange={handleWs} style={inputSt} placeholder="35" required /></div>
                                        <div><label style={labelSt}>Cupos *</label><input name="spots" type="number" min="1" value={wsForm.spots} onChange={handleWs} style={inputSt} placeholder="10" required /></div>
                                    </div>
                                    <div><label style={labelSt}>Modalidad</label><select name="modality" value={wsForm.modality} onChange={handleWs} style={inputSt}><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select></div>
                                    <div><label style={labelSt}>URL de imagen</label><input name="image" value={wsForm.image} onChange={handleWs} style={inputSt} placeholder="https://..." /></div>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button type="submit" disabled={wsLoad} style={{ flex: 1, background: wsLoad ? '#e88aaa' : '#C2185B', color: '#fff', border: 'none', borderRadius: 24, padding: '11px', fontSize: 13, fontWeight: 500, cursor: wsLoad ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                            {wsLoad ? 'Guardando...' : editWs ? 'Guardar cambios' : 'Crear taller'}
                                        </button>
                                        {editWs && <button type="button" onClick={cancelEditWs} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#6B4050', borderRadius: 24, padding: '11px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Inscripciones */}
                        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
                            Inscripciones ({enrollments.length})
                        </h2>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            {[['all', 'Todas'], ['pending', 'Pendientes'], ['paid', 'Pagadas'], ['cancelled', 'Canceladas']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setEnFilter(key)} style={tabBtn(enFilter === key)}>{lbl}</button>
                            ))}
                        </div>

                        {enFetching ? (
                            <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando inscripciones...</p>
                        ) : filteredEnrollments.length === 0 ? (
                            <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                No hay inscripciones en esta categoría.
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {filteredEnrollments.map(en => {
                                    const st = ENROLLMENT_STATUS[en.status] || ENROLLMENT_STATUS.pending
                                    const dateStr = new Date(en.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                    return (
                                        <div key={en._id} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 14, padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>{en.client?.name}</span>
                                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 4 }}>
                                                        <span>🎓 {en.title}</span>
                                                        <span>📅 {dateStr}</span>
                                                        <span style={{ color: '#C2185B' }}>${en.price.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                                                        {en.client?.phone && <span>📱 {en.client.phone}</span>}
                                                        {en.client?.email && <span>✉️ {en.client.email}</span>}
                                                    </div>
                                                    {en.notes && <p style={{ fontSize: 12, color: '#9E7080', marginTop: 6, fontStyle: 'italic' }}>"{en.notes}"</p>}
                                                </div>
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                                                    {en.status === 'pending' && <button onClick={() => changeEnrollmentStatus(en._id, 'paid')} disabled={updatingEnId === en._id} style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Marcar pagado</button>}
                                                    {['pending', 'paid'].includes(en.status) && <button onClick={() => changeEnrollmentStatus(en._id, 'cancelled')} disabled={updatingEnId === en._id} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Cancelar</button>}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
