import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { fetchServices, createService, updateService, deleteService } from '../api/services'

const CATEGORIES = ['manicure', 'pedicure', 'nail-art', 'extensiones', 'retiro']

const EMPTY_FORM = { name: '', description: '', price: '', duration: '', category: 'manicure', featured: false }

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid #F0D0DC', borderRadius: 8,
  fontSize: 13, fontFamily: 'Inter, sans-serif',
  outline: 'none', background: '#fff', color: '#2D1520',
  boxSizing: 'border-box',
}

const labelStyle = { fontSize: 12, color: '#6B4050', marginBottom: 4, display: 'block' }

export default function Admin() {
  const { user, logout } = useAuthStore()
  const [services, setServices] = useState([])
  const [form, setForm]         = useState(EMPTY_FORM)
  const [editing, setEditing]   = useState(null)   // id del servicio en edición
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [toast, setToast]       = useState('')

  useEffect(() => { loadServices() }, [])

  const loadServices = async () => {
    setFetching(true)
    try {
      const { data } = await fetchServices()
      setServices(data)
    } catch {
      showToast('Error al cargar servicios')
    } finally {
      setFetching(false)
    }
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handle = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const startEdit = (svc) => {
    setEditing(svc._id)
    setForm({
      name:        svc.name,
      description: svc.description || '',
      price:       svc.price,
      duration:    svc.duration,
      category:    svc.category,
      featured:    svc.featured,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, price: Number(form.price), duration: Number(form.duration) }
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
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Desactivar el servicio "${name}"?`)) return
    try {
      await deleteService(id)
      setServices(s => s.filter(x => x._id !== id))
      showToast('Servicio desactivado ✓')
    } catch {
      showToast('Error al eliminar')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FDF0F5' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: '#1D9E75', color: '#fff',
          padding: '10px 20px', borderRadius: 10,
          fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>{toast}</div>
      )}

      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #F0D0DC',
        padding: '1rem 2rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: 22, color: '#C2185B', fontWeight: 600,
          }}>Panel de administración</h1>
          <p style={{ fontSize: 12, color: '#6B4050', marginTop: 2 }}>
            Bienvenida, {user?.name}
          </p>
        </div>
        <button onClick={logout} style={{
          background: 'transparent', border: '1px solid #F0D0DC',
          color: '#C2185B', borderRadius: 20, padding: '8px 18px',
          fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
        }}>Cerrar sesión</button>
      </div>

      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: '2rem' }}>
          {[
            { label: 'Servicios activos', value: services.length },
            { label: 'Destacados',        value: services.filter(s => s.featured).length },
            { label: 'Categorías',        value: new Set(services.map(s => s.category)).size },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#fff', border: '1px solid #F0D0DC',
              borderRadius: 12, padding: '1.25rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: '#C2185B' }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#6B4050', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>

          {/* Lista de servicios */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1rem' }}>
              Servicios ({services.length})
            </h2>

            {fetching ? (
              <p style={{ color: '#6B4050', fontSize: 13 }}>Cargando servicios...</p>
            ) : services.length === 0 ? (
              <div style={{
                background: '#fff', border: '1px dashed #F0D0DC',
                borderRadius: 12, padding: '2rem', textAlign: 'center',
                color: '#6B4050', fontSize: 13,
              }}>
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
                        {svc.featured && (
                          <span style={{
                            fontSize: 10, padding: '2px 8px', borderRadius: 10,
                            background: '#F8C8DC', color: '#88134A',
                          }}>Destacado</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#6B4050' }}>
                        <span style={{ color: '#C2185B', fontWeight: 500 }}>${svc.price}</span>
                        <span>{svc.duration} min</span>
                        <span style={{ textTransform: 'capitalize' }}>{svc.category}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => startEdit(svc)} style={{
                        background: '#FDF0F5', border: '1px solid #F0D0DC',
                        color: '#C2185B', borderRadius: 8, padding: '6px 14px',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}>Editar</button>
                      <button onClick={() => handleDelete(svc._id, svc.name)} style={{
                        background: 'transparent', border: '1px solid #F0D0DC',
                        color: '#999', borderRadius: 8, padding: '6px 14px',
                        fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                      }}>Desactivar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div style={{
            background: '#fff', border: '1px solid #F0D0DC',
            borderRadius: 16, padding: '1.5rem', position: 'sticky', top: 80,
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#2D1520', marginBottom: '1.25rem' }}>
              {editing ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Nombre *</label>
                <input name="name" value={form.name} onChange={handle}
                  style={inputStyle} placeholder="Manicure Gel" required />
              </div>

              <div>
                <label style={labelStyle}>Descripción</label>
                <input name="description" value={form.description} onChange={handle}
                  style={inputStyle} placeholder="Breve descripción del servicio" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={labelStyle}>Precio ($) *</label>
                  <input name="price" type="number" min="0" step="0.01" value={form.price}
                    onChange={handle} style={inputStyle} placeholder="25" required />
                </div>
                <div>
                  <label style={labelStyle}>Duración (min) *</label>
                  <input name="duration" type="number" min="1" value={form.duration}
                    onChange={handle} style={inputStyle} placeholder="60" required />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Categoría</label>
                <select name="category" value={form.category} onChange={handle} style={inputStyle}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c} style={{ textTransform: 'capitalize' }}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B4050', cursor: 'pointer' }}>
                <input type="checkbox" name="featured" checked={form.featured} onChange={handle}
                  style={{ accentColor: '#C2185B', width: 16, height: 16 }} />
                Marcar como destacado
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button type="submit" disabled={loading} style={{
                  flex: 1, background: loading ? '#e88aaa' : '#C2185B',
                  color: '#fff', border: 'none', borderRadius: 24,
                  padding: '11px', fontSize: 13, fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Inter, sans-serif',
                }}>
                  {loading ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear servicio'}
                </button>
                {editing && (
                  <button type="button" onClick={cancelEdit} style={{
                    background: 'transparent', border: '1px solid #F0D0DC',
                    color: '#6B4050', borderRadius: 24, padding: '11px 16px',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}>Cancelar</button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
