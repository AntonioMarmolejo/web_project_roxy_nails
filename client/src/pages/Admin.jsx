import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices, createService, updateService, deleteService } from '../api/services'
import { fetchAllBookings, updateBookingStatus } from '../api/bookings'

// ─── Shared ──────────────────────────────────────────────────────
const CATEGORIES = ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro']
const EMPTY_SVC = { name: '', description: '', price: '', duration: '', category: 'manicure', featured: false }

const BOOKING_STATUS = {
    pending: { label: 'Pendiente', bg: '#FFF8E1', color: '#E65100' },
    confirmed: { label: 'Confirmada', bg: '#E8F5E9', color: '#2E7D32' },
    completed: { label: 'Completada', bg: '#E3F2FD', color: '#1565C0' },
    cancelled: { label: 'Cancelada', bg: '#F5F5F5', color: '#757575' },
}

const inputSt = { width: '100%', padding: '9px 12px', border: '1px solid #F0D0DC', borderRadius: 8, fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none', background: '#fff', color: '#2D1520', boxSizing: 'border-box' }
const labelSt = { fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }
const tabBtn = (active) => ({ padding: '8px 20px', borderRadius: 20, fontSize: 13, border: '1px solid', borderColor: active ? '#C2185B' : '#F0D0DC', background: active ? '#C2185B' : '#fff', color: active ? '#fff' : '#6B4050', cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' })

export default function Admin() {
    const { user, logout } = useAuthStore()
    const [tab, setTab] = useState('servicios')  // 'servicios' | 'citas'

    // ── Servicios state ──────────────────────────────────────────
    const [services, setServices] = useState([])
    const [svcForm, setSvcForm] = useState(EMPTY_SVC)
    const [editing, setEditing] = useState(null)
    const [svcLoad, setSvcLoad] = useState(false)
    const [fetching, setFetching] = useState(true)

    // ── Citas state ──────────────────────────────────────────────
    const [bookings, setBookings] = useState([])
    const [bFilter, setBFilter] = useState('all')
    const [bFetching, setBFetching] = useState(false)
    const [updatingId, setUpdatingId] = useState(null)

    // ── Toast ────────────────────────────────────────────────────
    const [toast, setToast] = useState('')
    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

    // ── Load services ────────────────────────────────────────────
    useEffect(() => {
        setFetching(true)
        fetchServices()
            .then(({ data }) => setServices(data))
            .catch(() => showToast('Error al cargar servicios'))
            .finally(() => setFetching(false))
    }, [])

    // ── Load bookings when tab changes ───────────────────────────
    useEffect(() => {
        if (tab !== 'citas') return
        setBFetching(true)
        fetchAllBookings()
            .then(({ data }) => setBookings(data))
            .catch(() => showToast('Error al cargar citas'))
            .finally(() => setBFetching(false))
    }, [tab])

    // ── Services CRUD ────────────────────────────────────────────
    const handleSvc = (e) => {
        const { name, value, type, checked } = e.target
        setSvcForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }

    const startEdit = (svc) => {
        setEditing(svc._id)
        setSvcForm({ name: svc.name, description: svc.description || '', price: svc.price, duration: svc.duration, category: svc.category, featured: svc.featured })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const cancelEdit = () => { setEditing(null); setSvcForm(EMPTY_SVC) }

    const submitSvc = async (e) => {
        e.preventDefault()
        setSvcLoad(true)
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
            cancelEdit()
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al guardar')
        } finally {
            setSvcLoad(false)
        }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`¿Desactivar el servicio "${name}"?`)) return
        try {
            await deleteService(id)
            setServices(s => s.filter(x => x._id !== id))
            showToast('Servicio desactivado ✓')
        } catch { showToast('Error al eliminar') }
    }

    // ── Bookings actions ─────────────────────────────────────────
    const changeStatus = async (id, status) => {
        setUpdatingId(id)
        try {
            const { data } = await updateBookingStatus(id, status)
            setBookings(b => b.map(x => x._id === id ? data : x))
            showToast(`Cita ${BOOKING_STATUS[status]?.label.toLowerCase()} ✓`)
        } catch { showToast('Error al actualizar cita') }
        finally { setUpdatingId(null) }
    }

    const filteredBookings = bFilter === 'all'
        ? bookings
        : bookings.filter(b => b.status === bFilter)

    const bStats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        today: bookings.filter(b => {
            const d = new Date(b.date); const t = new Date()
            return d.getUTCDate() === t.getDate() && d.getUTCMonth() === t.getMonth() && d.getUTCFullYear() === t.getFullYear()
        }).length,
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
            <div style={{ background: '#fff', borderBottom: '1px solid #F0D0DC', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <div style={{ display: 'flex', gap: 8, marginBottom: '2rem' }}>
                    <button onClick={() => setTab('servicios')} style={tabBtn(tab === 'servicios')}>✂️ Servicios</button>
                    <button onClick={() => setTab('citas')} style={tabBtn(tab === 'citas')}>📅 Citas</button>
                </div>

                {/* ════════ SERVICIOS ════════ */}
                {tab === 'servicios' && (
                    <>
                        {/* Stats */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
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

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
                            {/* Lista */}
                            <div>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
                                    Servicios ({services.length})
                                </h2>
                                {fetching ? (
                                    <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando servicios...</p>
                                ) : services.length === 0 ? (
                                    <div style={{ background: '#fff', border: '1px dashed #F0D0DC', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6B4050', fontSize: 13 }}>
                                        No hay servicios aún. Crea el primero con el formulario.
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {services.map(svc => (
                                            <div key={svc._id} style={{
                                                background: editing === svc._id ? '#FFF0F5' : '#fff',
                                                border: `1px solid ${editing === svc._id ? '#C2185B' : '#F0D0DC'}`,
                                                borderRadius: 12, padding: '1rem 1.25rem',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
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
                                                    <button onClick={() => startEdit(svc)} style={{ background: '#FDF0F5', border: '1px solid #F0D0DC', color: '#C2185B', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Editar</button>
                                                    <button onClick={() => handleDelete(svc._id, svc.name)} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Desactivar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Formulario */}
                            <div style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80 }}>
                                <h2 style={{ fontSize: 15, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
                                    {editing ? 'Editar servicio' : 'Nuevo servicio'}
                                </h2>
                                <form onSubmit={submitSvc} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={labelSt}>Nombre *</label>
                                        <input name="name" value={svcForm.name} onChange={handleSvc} style={inputSt} placeholder="Manicure Gel" required />
                                    </div>
                                    <div>
                                        <label style={labelSt}>Descripción</label>
                                        <input name="description" value={svcForm.description} onChange={handleSvc} style={inputSt} placeholder="Breve descripción" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                        <div>
                                            <label style={labelSt}>Precio ($) *</label>
                                            <input name="price" type="number" min="0" step="0.01" value={svcForm.price} onChange={handleSvc} style={inputSt} placeholder="25" required />
                                        </div>
                                        <div>
                                            <label style={labelSt}>Duración (min) *</label>
                                            <input name="duration" type="number" min="1" value={svcForm.duration} onChange={handleSvc} style={inputSt} placeholder="60" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={labelSt}>Categoría</label>
                                        <select name="category" value={svcForm.category} onChange={handleSvc} style={inputSt}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B4050', cursor: 'pointer' }}>
                                        <input type="checkbox" name="featured" checked={svcForm.featured} onChange={handleSvc} style={{ accentColor: '#C2185B', width: 16, height: 16 }} />
                                        Marcar como destacado
                                    </label>
                                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                                        <button type="submit" disabled={svcLoad} style={{ flex: 1, background: svcLoad ? '#e88aaa' : '#C2185B', color: '#fff', border: 'none', borderRadius: 24, padding: '11px', fontSize: 13, fontWeight: 500, cursor: svcLoad ? 'not-allowed' : 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                            {svcLoad ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear servicio'}
                                        </button>
                                        {editing && (
                                            <button type="button" onClick={cancelEdit} style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#6B4050', borderRadius: 24, padding: '11px 16px', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </>
                )}

                {/* ════════ CITAS ════════ */}
                {tab === 'citas' && (
                    <>
                        {/* Stats citas */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: '2rem' }}>
                            {[
                                { label: 'Total citas', value: bStats.total, color: '#C2185B' },
                                { label: 'Pendientes', value: bStats.pending, color: '#E65100' },
                                { label: 'Confirmadas', value: bStats.confirmed, color: '#2E7D32' },
                                { label: 'Hoy', value: bStats.today, color: '#1565C0' },
                            ].map(st => (
                                <div key={st.label} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 12, padding: '1.1rem', textAlign: 'center' }}>
                                    <div style={{ fontSize: 26, fontWeight: 700, color: st.color }}>{st.value}</div>
                                    <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{st.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Filtro status */}
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
                                    const dateStr = new Date(b.date).toLocaleDateString('es-ES', {
                                        weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC',
                                    })
                                    return (
                                        <div key={b._id} style={{ background: '#fff', border: '1px solid #F0D0DC', borderRadius: 14, padding: '1rem 1.25rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                                                {/* Info */}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 14, fontWeight: 600, color: '#2D1520' }}>{b.client?.name}</span>
                                                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: st.bg, color: st.color, fontWeight: 600 }}>
                                                            {st.label}
                                                        </span>
                                                    </div>
                                                    <div style={{ fontSize: 13, color: '#9E7080', display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 6 }}>
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
                                                {/* Acciones */}
                                                <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                                                    {b.status === 'pending' && (
                                                        <button onClick={() => changeStatus(b._id, 'confirmed')} disabled={updatingId === b._id}
                                                            style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', color: '#2E7D32', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    {b.status === 'confirmed' && (
                                                        <button onClick={() => changeStatus(b._id, 'completed')} disabled={updatingId === b._id}
                                                            style={{ background: '#E3F2FD', border: '1px solid #90CAF9', color: '#1565C0', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                            Completar
                                                        </button>
                                                    )}
                                                    {['pending', 'confirmed'].includes(b.status) && (
                                                        <button onClick={() => changeStatus(b._id, 'cancelled')} disabled={updatingId === b._id}
                                                            style={{ background: 'transparent', border: '1px solid #F0D0DC', color: '#999', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                            Cancelar
                                                        </button>
                                                    )}
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
