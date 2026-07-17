import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices, createService, updateService, deleteService } from '../api/services'
import { fetchAllBookings, updateBookingStatus } from '../api/bookings'
import { fetchAllProducts, createProduct, updateProduct, toggleProduct } from '../api/products'
import { fetchAllOrders, updateOrderStatus } from '../api/orders'
import { fetchAllWorkshops, createWorkshop, updateWorkshop, toggleWorkshop } from '../api/workshops'
import { fetchAllEnrollments, updateEnrollmentStatus } from '../api/enrollments'
import ImageInput from '../components/ImageInput'
import '../styles/Admin.css'

// ─── Constantes ──────────────────────────────────────────────────────────────
const SVC_CATS  = ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro']
const PROD_CATS = ['esmaltes', 'cuidado', 'herramientas', 'nail-art', 'accesorios']
const EMPTY_SVC  = { name: '', description: '', price: '', duration: '', category: 'manicure', featured: false, image: '' }
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

// ─── Colores de acciones (botones de estado) ─────────────────────────────────
const ACTION_GREEN  = { '--btn-bg': '#E8F5E9', '--btn-border': '#A5D6A7', '--btn-color': '#2E7D32' }
const ACTION_BLUE   = { '--btn-bg': '#E3F2FD', '--btn-border': '#90CAF9', '--btn-color': '#1565C0' }
const ACTION_PURPLE = { '--btn-bg': '#F3E5F5', '--btn-border': '#CE93D8', '--btn-color': '#6A1B9A' }

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
    const startEditSvc  = (svc) => { setEditing(svc._id); setSvcForm({ name: svc.name, description: svc.description || '', price: svc.price, duration: svc.duration, category: svc.category, featured: svc.featured, image: svc.image || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
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
        <div className="admin__page">

            {/* Toast */}
            {toast && (
                <div className="admin__toast">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="admin__header">
                <div>
                    <h1 className="admin__header-title">
                        Panel de administración
                    </h1>
                    <p className="admin__header-sub">Bienvenida, {user?.name}</p>
                </div>
                <button onClick={logout} className="admin__logout-btn">
                    Cerrar sesión
                </button>
            </div>

            <div className="admin__body">

                {/* Tabs */}
                <div className="admin__tabs">
                    <button onClick={() => setTab('servicios')} className={`admin__tab-btn${tab === 'servicios' ? ' admin__tab-btn--active' : ''}`}>✂️ Servicios</button>
                    <button onClick={() => setTab('citas')}     className={`admin__tab-btn${tab === 'citas' ? ' admin__tab-btn--active' : ''}`}>📅 Citas</button>
                    <button onClick={() => setTab('productos')} className={`admin__tab-btn${tab === 'productos' ? ' admin__tab-btn--active' : ''}`}>🛍️ Productos</button>
                    <button onClick={() => setTab('pedidos')}   className={`admin__tab-btn${tab === 'pedidos' ? ' admin__tab-btn--active' : ''}`}>📦 Pedidos</button>
                    <button onClick={() => setTab('talleres')}  className={`admin__tab-btn${tab === 'talleres' ? ' admin__tab-btn--active' : ''}`}>🎓 Talleres</button>
                </div>

                {/* ════════ SERVICIOS ════════ */}
                {tab === 'servicios' && (
                    <>
                        <div className="admin__stats-grid--3">
                            {[
                                { label: 'Servicios activos', value: services.length },
                                { label: 'Destacados', value: services.filter(s => s.featured).length },
                                { label: 'Categorías', value: new Set(services.map(s => s.category)).size },
                            ].map(st => (
                                <div key={st.label} className="admin__stat-tile admin__stat-tile--padded">
                                    <div className="admin__stat-value">{st.value}</div>
                                    <div className="admin__stat-label">{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="admin__split">
                            {/* Lista */}
                            <div>
                                <h2 className="admin__list-title">
                                    Servicios ({services.length})
                                </h2>
                                {fetching ? (
                                    <p className="admin__list-loading">Cargando...</p>
                                ) : services.length === 0 ? (
                                    <div className="admin__list-empty">
                                        No hay servicios. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div className="admin__list">
                                        {services.map(svc => (
                                            <div key={svc._id} className={`admin__list-item${editing === svc._id ? ' admin__list-item--editing' : ''}`}>
                                                <div>
                                                    <div className="admin__item-header">
                                                        <span className="admin__item-name">{svc.name}</span>
                                                        {svc.featured && <span className="admin__item-badge" style={{ '--badge-bg': '#F8C8DC', '--badge-color': '#88134A' }}>Destacado</span>}
                                                    </div>
                                                    <div className="admin__item-meta">
                                                        <span className="admin__item-meta-price">${svc.price}</span>
                                                        <span>{svc.duration} min</span>
                                                        <span className="admin__item-meta-cap">{svc.category}</span>
                                                    </div>
                                                </div>
                                                <div className="admin__item-actions">
                                                    <button onClick={() => startEditSvc(svc)} className="admin__btn-edit">Editar</button>
                                                    <button onClick={() => handleDeleteSvc(svc._id, svc.name)} className="admin__btn-secondary">Desactivar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form servicio */}
                            <div className="admin__form-panel">
                                <h2 className="admin__form-title">
                                    {editing ? 'Editar servicio' : 'Nuevo servicio'}
                                </h2>
                                <form onSubmit={submitSvc} className="admin__form">
                                    <div><label className="admin__label">Nombre *</label><input name="name" value={svcForm.name} onChange={handleSvc} className="admin__input" placeholder="Manicure Gel" required /></div>
                                    <div><label className="admin__label">Descripción</label><input name="description" value={svcForm.description} onChange={handleSvc} className="admin__input" placeholder="Breve descripción" /></div>
                                    <div className="admin__form-row">
                                        <div><label className="admin__label">Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={svcForm.price} onChange={handleSvc} className="admin__input" placeholder="25" required /></div>
                                        <div><label className="admin__label">Duración (min) *</label><input name="duration" type="number" min="1" value={svcForm.duration} onChange={handleSvc} className="admin__input" placeholder="60" required /></div>
                                    </div>
                                    <div><label className="admin__label">Categoría</label><select name="category" value={svcForm.category} onChange={handleSvc} className="admin__input">{SVC_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                                    <ImageInput label="Imagen" value={svcForm.image} onChange={(url) => setSvcForm(f => ({ ...f, image: url }))} />
                                    <label className="admin__checkbox-label">
                                        <input type="checkbox" name="featured" checked={svcForm.featured} onChange={handleSvc} />
                                        Marcar como destacado
                                    </label>
                                    <div className="admin__form-actions">
                                        <button type="submit" disabled={svcLoad} className="admin__submit-btn">
                                            {svcLoad ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear servicio'}
                                        </button>
                                        {editing && <button type="button" onClick={cancelEditSvc} className="admin__cancel-btn">Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ CITAS ════════ */}
                {tab === 'citas' && (
                    <>
                        <div className="admin__stats-grid--4">
                            {[
                                { label: 'Total citas',  value: bStats.total,     color: '#C2185B' },
                                { label: 'Pendientes',   value: bStats.pending,   color: '#E65100' },
                                { label: 'Confirmadas',  value: bStats.confirmed, color: '#2E7D32' },
                                { label: 'Hoy',          value: bStats.today,     color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} className="admin__stat-tile">
                                    <div className="admin__stat-value" style={{ '--stat-color': st.color }}>{st.value}</div>
                                    <div className="admin__stat-label">{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="admin__filters">
                            {[['all', 'Todas'], ['pending', 'Pendientes'], ['confirmed', 'Confirmadas'], ['completed', 'Completadas'], ['cancelled', 'Canceladas']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setBFilter(key)} className={`admin__tab-btn${bFilter === key ? ' admin__tab-btn--active' : ''}`}>{lbl}</button>
                            ))}
                        </div>

                        {bFetching ? (
                            <p className="admin__list-loading">Cargando citas...</p>
                        ) : filteredBookings.length === 0 ? (
                            <div className="admin__list-empty">
                                No hay citas en esta categoría.
                            </div>
                        ) : (
                            <div className="admin__list">
                                {filteredBookings.map(b => {
                                    const st = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending
                                    const dateStr = new Date(b.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
                                    return (
                                        <div key={b._id} className="admin__record-card">
                                            <div className="admin__record-header">
                                                <div className="admin__record-main">
                                                    <div className="admin__record-title-row">
                                                        <span className="admin__record-name">{b.client?.name}</span>
                                                        <span className="admin__record-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>{st.label}</span>
                                                    </div>
                                                    <div className="admin__record-meta">
                                                        <span>📅 {dateStr} · {b.timeSlot}</span>
                                                        <span>💅 {b.service?.name}</span>
                                                        {b.service?.price && <span className="admin__record-meta-price">${b.service.price}</span>}
                                                    </div>
                                                    <div className="admin__record-contact">
                                                        {b.client?.phone && <span>📱 {b.client.phone}</span>}
                                                        {b.client?.email && <span>✉️ {b.client.email}</span>}
                                                    </div>
                                                    {b.notes && <p className="admin__record-notes">"{b.notes}"</p>}
                                                </div>
                                                <div className="admin__record-actions">
                                                    {b.status === 'pending'   && <button onClick={() => changeBookingStatus(b._id, 'confirmed')} disabled={updatingId === b._id} className="admin__action-btn" style={ACTION_GREEN}>Confirmar</button>}
                                                    {b.status === 'confirmed' && <button onClick={() => changeBookingStatus(b._id, 'completed')} disabled={updatingId === b._id} className="admin__action-btn" style={ACTION_BLUE}>Completar</button>}
                                                    {['pending', 'confirmed'].includes(b.status) && <button onClick={() => changeBookingStatus(b._id, 'cancelled')} disabled={updatingId === b._id} className="admin__action-btn">Cancelar</button>}
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
                        <div className="admin__stats-grid--3">
                            {[
                                { label: 'Total productos', value: products.length },
                                { label: 'Activos',         value: products.filter(p => p.active).length },
                                { label: 'Stock bajo (<5)', value: products.filter(p => p.stock < 5 && p.active).length, warn: true },
                            ].map(st => (
                                <div key={st.label} className="admin__stat-tile admin__stat-tile--padded">
                                    <div className="admin__stat-value" style={{ '--stat-color': st.warn ? '#E65100' : '#C2185B' }}>{st.value}</div>
                                    <div className="admin__stat-label">{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="admin__split">
                            {/* Lista */}
                            <div>
                                <h2 className="admin__list-title">
                                    Productos ({products.length})
                                </h2>
                                {prodFetching ? (
                                    <p className="admin__list-loading">Cargando...</p>
                                ) : products.length === 0 ? (
                                    <div className="admin__list-empty">
                                        No hay productos. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div className="admin__list">
                                        {products.map(p => (
                                            <div key={p._id} className={`admin__list-item${editProd === p._id ? ' admin__list-item--editing' : !p.active ? ' admin__list-item--inactive' : ''}`}>
                                                <div>
                                                    <div className="admin__item-header">
                                                        <span className="admin__item-name">{p.name}</span>
                                                        {!p.active && <span className="admin__item-badge" style={{ '--badge-bg': '#F5F5F5', '--badge-color': '#9E7080' }}>Inactivo</span>}
                                                        {p.stock < 5 && p.active && <span className="admin__item-badge" style={{ '--badge-bg': '#FFF3E0', '--badge-color': '#E65100' }}>Stock: {p.stock}</span>}
                                                    </div>
                                                    <div className="admin__item-meta">
                                                        <span className="admin__item-meta-price">${p.price}</span>
                                                        <span>Stock: {p.stock}</span>
                                                        {p.brand && <span>{p.brand}</span>}
                                                        <span className="admin__item-meta-cap">{p.category}</span>
                                                    </div>
                                                </div>
                                                <div className="admin__item-actions">
                                                    <button onClick={() => startEditProd(p)} className="admin__btn-edit">Editar</button>
                                                    <button onClick={() => handleToggleProd(p._id, p.name, p.active)} className="admin__btn-secondary">
                                                        {p.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form producto */}
                            <div className="admin__form-panel">
                                <h2 className="admin__form-title">
                                    {editProd ? 'Editar producto' : 'Nuevo producto'}
                                </h2>
                                <form onSubmit={submitProd} className="admin__form admin__form--compact">
                                    <div><label className="admin__label">Nombre *</label><input name="name" value={prodForm.name} onChange={handleProd} className="admin__input" placeholder="Esmalte Gel Rojo" required /></div>
                                    <div><label className="admin__label">Descripción</label><input name="description" value={prodForm.description} onChange={handleProd} className="admin__input" placeholder="Breve descripción" /></div>
                                    <div className="admin__form-row">
                                        <div><label className="admin__label">Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={prodForm.price} onChange={handleProd} className="admin__input" placeholder="12.99" required /></div>
                                        <div><label className="admin__label">Stock *</label><input name="stock" type="number" min="0" value={prodForm.stock} onChange={handleProd} className="admin__input" placeholder="20" required /></div>
                                    </div>
                                    <div className="admin__form-row">
                                        <div><label className="admin__label">Marca</label><input name="brand" value={prodForm.brand} onChange={handleProd} className="admin__input" placeholder="OPI" /></div>
                                        <div><label className="admin__label">Categoría</label><select name="category" value={prodForm.category} onChange={handleProd} className="admin__input">{PROD_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}</select></div>
                                    </div>
                                    <ImageInput label="Imagen" value={prodForm.image} onChange={(url) => setProdForm(f => ({ ...f, image: url }))} />
                                    <div className="admin__form-actions">
                                        <button type="submit" disabled={prodLoad} className="admin__submit-btn">
                                            {prodLoad ? 'Guardando...' : editProd ? 'Guardar cambios' : 'Crear producto'}
                                        </button>
                                        {editProd && <button type="button" onClick={cancelEditProd} className="admin__cancel-btn">Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ PEDIDOS ════════ */}
                {tab === 'pedidos' && (
                    <>
                        <div className="admin__stats-grid--4">
                            {[
                                { label: 'Total pedidos', value: oStats.total,   color: '#C2185B' },
                                { label: 'Pendientes',    value: oStats.pending, color: '#E65100' },
                                { label: 'Pagados',       value: oStats.paid,    color: '#2E7D32' },
                                { label: 'En camino',     value: oStats.shipped, color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} className="admin__stat-tile">
                                    <div className="admin__stat-value" style={{ '--stat-color': st.color }}>{st.value}</div>
                                    <div className="admin__stat-label">{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="admin__filters">
                            {[['all', 'Todos'], ['pending', 'Pendientes'], ['paid', 'Pagados'], ['shipped', 'En camino'], ['delivered', 'Entregados'], ['cancelled', 'Cancelados']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setOFilter(key)} className={`admin__tab-btn${oFilter === key ? ' admin__tab-btn--active' : ''}`}>{lbl}</button>
                            ))}
                        </div>

                        {oFetching ? (
                            <p className="admin__list-loading">Cargando pedidos...</p>
                        ) : filteredOrders.length === 0 ? (
                            <div className="admin__list-empty">
                                No hay pedidos en esta categoría.
                            </div>
                        ) : (
                            <div className="admin__list">
                                {filteredOrders.map(o => {
                                    const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending
                                    const dateStr = new Date(o.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                    return (
                                        <div key={o._id} className="admin__record-card">
                                            <div className="admin__record-header">
                                                <div className="admin__record-main">
                                                    <div className="admin__record-title-row">
                                                        <span className="admin__record-name">{o.client?.name}</span>
                                                        <span className="admin__record-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>{st.label}</span>
                                                        <span className="admin__record-date">{dateStr}</span>
                                                    </div>
                                                    <div className="admin__order-items-list">
                                                        {o.items.map((i, idx) => (
                                                            <span key={idx}>{i.name} ×{i.qty}{idx < o.items.length - 1 ? ', ' : ''}</span>
                                                        ))}
                                                    </div>
                                                    <div className="admin__record-contact">
                                                        {o.client?.phone && <span>📱 {o.client.phone}</span>}
                                                        {o.client?.email && <span>✉️ {o.client.email}</span>}
                                                        <span className="admin__record-total">Total: ${o.total.toFixed(2)}</span>
                                                    </div>
                                                    {o.notes && <p className="admin__record-notes">"{o.notes}"</p>}
                                                </div>
                                                <div className="admin__record-actions">
                                                    {o.status === 'pending'  && <button onClick={() => changeOrderStatus(o._id, 'paid')}      disabled={updatingOId === o._id} className="admin__action-btn" style={ACTION_GREEN}>Marcar pagado</button>}
                                                    {o.status === 'paid'    && <button onClick={() => changeOrderStatus(o._id, 'shipped')}   disabled={updatingOId === o._id} className="admin__action-btn" style={ACTION_BLUE}>Marcar enviado</button>}
                                                    {o.status === 'shipped' && <button onClick={() => changeOrderStatus(o._id, 'delivered')} disabled={updatingOId === o._id} className="admin__action-btn" style={ACTION_PURPLE}>Marcar entregado</button>}
                                                    {['pending', 'paid'].includes(o.status) && <button onClick={() => changeOrderStatus(o._id, 'cancelled')} disabled={updatingOId === o._id} className="admin__action-btn">Cancelar</button>}
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
                        <div className="admin__stats-grid--4">
                            {[
                                { label: 'Talleres',              value: wsStats.total,     color: '#C2185B' },
                                { label: 'Activos',               value: wsStats.active,    color: '#2E7D32' },
                                { label: 'Inscripciones pend.',    value: wsStats.pendingEn, color: '#E65100' },
                                { label: 'Inscripciones pagadas',  value: wsStats.paidEn,    color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} className="admin__stat-tile">
                                    <div className="admin__stat-value" style={{ '--stat-color': st.color }}>{st.value}</div>
                                    <div className="admin__stat-label">{st.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="admin__split admin__split--with-margin">
                            {/* Lista de talleres */}
                            <div>
                                <h2 className="admin__list-title">
                                    Talleres ({workshops.length})
                                </h2>
                                {wsFetching ? (
                                    <p className="admin__list-loading">Cargando...</p>
                                ) : workshops.length === 0 ? (
                                    <div className="admin__list-empty">
                                        No hay talleres. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div className="admin__list">
                                        {workshops.map(w => (
                                            <div key={w._id} className={`admin__list-item${editWs === w._id ? ' admin__list-item--editing' : !w.active ? ' admin__list-item--inactive' : ''}`}>
                                                <div>
                                                    <div className="admin__item-header">
                                                        <span className="admin__item-name">{w.title}</span>
                                                        {!w.active && <span className="admin__item-badge" style={{ '--badge-bg': '#F5F5F5', '--badge-color': '#9E7080' }}>Inactivo</span>}
                                                    </div>
                                                    <div className="admin__item-meta">
                                                        <span className="admin__item-meta-price">${w.price}</span>
                                                        <span>{new Date(w.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span className="admin__item-meta-cap">{w.modality}</span>
                                                        <span>{w.spotsLeft}/{w.spots} cupos</span>
                                                    </div>
                                                </div>
                                                <div className="admin__item-actions">
                                                    <button onClick={() => startEditWs(w)} className="admin__btn-edit">Editar</button>
                                                    <button onClick={() => handleToggleWs(w._id, w.title, w.active)} className="admin__btn-secondary">
                                                        {w.active ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Form taller */}
                            <div className="admin__form-panel">
                                <h2 className="admin__form-title">
                                    {editWs ? 'Editar taller' : 'Nuevo taller'}
                                </h2>
                                <form onSubmit={submitWs} className="admin__form admin__form--compact">
                                    <div><label className="admin__label">Título *</label><input name="title" value={wsForm.title} onChange={handleWs} className="admin__input" placeholder="Nail Art para principiantes" required /></div>
                                    <div><label className="admin__label">Descripción</label><input name="description" value={wsForm.description} onChange={handleWs} className="admin__input" placeholder="Breve descripción" /></div>
                                    <div className="admin__form-row">
                                        <div><label className="admin__label">Fecha *</label><input name="date" type="date" value={wsForm.date} onChange={handleWs} className="admin__input" required /></div>
                                        <div><label className="admin__label">Duración (h)</label><input name="duration" type="number" min="1" value={wsForm.duration} onChange={handleWs} className="admin__input" placeholder="3" /></div>
                                    </div>
                                    <div className="admin__form-row">
                                        <div><label className="admin__label">Precio ($) *</label><input name="price" type="number" min="0" step="0.01" value={wsForm.price} onChange={handleWs} className="admin__input" placeholder="35" required /></div>
                                        <div><label className="admin__label">Cupos *</label><input name="spots" type="number" min="1" value={wsForm.spots} onChange={handleWs} className="admin__input" placeholder="10" required /></div>
                                    </div>
                                    <div><label className="admin__label">Modalidad</label><select name="modality" value={wsForm.modality} onChange={handleWs} className="admin__input"><option value="presencial">Presencial</option><option value="virtual">Virtual</option></select></div>
                                    <ImageInput label="Imagen" value={wsForm.image} onChange={(url) => setWsForm(f => ({ ...f, image: url }))} />
                                    <div className="admin__form-actions">
                                        <button type="submit" disabled={wsLoad} className="admin__submit-btn">
                                            {wsLoad ? 'Guardando...' : editWs ? 'Guardar cambios' : 'Crear taller'}
                                        </button>
                                        {editWs && <button type="button" onClick={cancelEditWs} className="admin__cancel-btn">Cancelar</button>}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Inscripciones */}
                        <h2 className="admin__list-title">
                            Inscripciones ({enrollments.length})
                        </h2>
                        <div className="admin__filters">
                            {[['all', 'Todas'], ['pending', 'Pendientes'], ['paid', 'Pagadas'], ['cancelled', 'Canceladas']].map(([key, lbl]) => (
                                <button key={key} onClick={() => setEnFilter(key)} className={`admin__tab-btn${enFilter === key ? ' admin__tab-btn--active' : ''}`}>{lbl}</button>
                            ))}
                        </div>

                        {enFetching ? (
                            <p className="admin__list-loading">Cargando inscripciones...</p>
                        ) : filteredEnrollments.length === 0 ? (
                            <div className="admin__list-empty">
                                No hay inscripciones en esta categoría.
                            </div>
                        ) : (
                            <div className="admin__list">
                                {filteredEnrollments.map(en => {
                                    const st = ENROLLMENT_STATUS[en.status] || ENROLLMENT_STATUS.pending
                                    const dateStr = new Date(en.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                    return (
                                        <div key={en._id} className="admin__record-card">
                                            <div className="admin__record-header">
                                                <div className="admin__record-main">
                                                    <div className="admin__record-title-row">
                                                        <span className="admin__record-name">{en.client?.name}</span>
                                                        <span className="admin__record-badge" style={{ '--status-bg': st.bg, '--status-color': st.color }}>{st.label}</span>
                                                    </div>
                                                    <div className="admin__record-meta">
                                                        <span>🎓 {en.title}</span>
                                                        <span>📅 {dateStr}</span>
                                                        <span className="admin__record-meta-price">${en.price.toFixed(2)}</span>
                                                    </div>
                                                    <div className="admin__record-contact">
                                                        {en.client?.phone && <span>📱 {en.client.phone}</span>}
                                                        {en.client?.email && <span>✉️ {en.client.email}</span>}
                                                    </div>
                                                    {en.notes && <p className="admin__record-notes">"{en.notes}"</p>}
                                                </div>
                                                <div className="admin__record-actions">
                                                    {en.status === 'pending' && <button onClick={() => changeEnrollmentStatus(en._id, 'paid')} disabled={updatingEnId === en._id} className="admin__action-btn" style={ACTION_GREEN}>Marcar pagado</button>}
                                                    {['pending', 'paid'].includes(en.status) && <button onClick={() => changeEnrollmentStatus(en._id, 'cancelled')} disabled={updatingEnId === en._id} className="admin__action-btn">Cancelar</button>}
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
