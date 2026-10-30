import { useEffect, useState } from 'react'
import { fetchAllSlides, createSlide, updateSlide, toggleSlide, deleteSlide, reorderSlides } from '../api/slides'
import HeroSlider from './HeroSlider'
import ImageInput from './ImageInput'

const EMPTY = {
    tag: '', title: '', highlight: '', subtitle: '', image: '',
    primaryLabel: '', primaryLink: '', secondaryLabel: '', secondaryLink: '', active: true,
}

// Páginas del sitio sugeridas para los botones (también se puede escribir otra ruta o una URL https://)
const PAGES = ['/agendar', '/servicios', '/galeria', '/tienda', '/talleres']

export default function AdminSlides({ showToast }) {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchAllSlides()
            .then(({ data }) => setSlides(data))
            .catch(() => showToast('Error al cargar las diapositivas'))
            .finally(() => setLoading(false))
    }, [])

    const handle = (e) => {
        const { name, value, type, checked } = e.target
        setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    }

    const startEdit = (s) => {
        setEditing(s._id)
        setForm(Object.fromEntries(Object.keys(EMPTY).map(k => [k, s[k] ?? EMPTY[k]])))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    const cancelEdit = () => { setEditing(null); setForm(EMPTY) }

    const submit = async (e) => {
        e.preventDefault()
        if (!form.image) return showToast('Sube o pega una imagen')
        setSaving(true)
        try {
            if (editing) {
                const { data } = await updateSlide(editing, form)
                setSlides(list => list.map(s => s._id === editing ? data : s))
                showToast('Diapositiva actualizada ✓')
            } else {
                const { data } = await createSlide(form)
                setSlides(list => [...list, data])
                showToast('Diapositiva creada ✓')
            }
            cancelEdit()
        } catch (err) { showToast(err.response?.data?.message || 'Error al guardar') }
        finally { setSaving(false) }
    }

    const handleToggle = async (s) => {
        if (!window.confirm(`¿${s.active ? 'Desactivar' : 'Activar'} "${s.title}"?`)) return
        try {
            const { data } = await toggleSlide(s._id)
            setSlides(list => list.map(x => x._id === s._id ? data : x))
            showToast(data.active ? 'Diapositiva activada ✓' : 'Diapositiva desactivada')
        } catch (err) { showToast(err.response?.data?.message || 'Error') }
    }

    const handleDelete = async (s) => {
        if (!window.confirm(`¿Eliminar "${s.title}" definitivamente? Esta acción no se puede deshacer.`)) return
        try {
            await deleteSlide(s._id)
            setSlides(list => list.filter(x => x._id !== s._id))
            if (editing === s._id) cancelEdit()
            showToast('Diapositiva eliminada')
        } catch (err) { showToast(err.response?.data?.message || 'Error al eliminar') }
    }

    const move = async (index, delta) => {
        const next = [...slides]
        const [item] = next.splice(index, 1)
        next.splice(index + delta, 0, item)
        setSlides(next)
        try {
            const { data } = await reorderSlides(next.map(s => s._id))
            setSlides(data)
        } catch (err) {
            showToast(err.response?.data?.message || 'Error al cambiar el orden')
            setSlides(slides)
        }
    }

    const activeCount = slides.filter(s => s.active).length
    const hasPreview = form.title || form.image

    return (
        <>
            <h2 className="admin__list-title">Portada del inicio</h2>
            <p className="admin__hint" style={{ marginBottom: 8 }}>
                Vista previa {editing ? 'de la diapositiva que editas' : 'de la nueva diapositiva'} (con los cambios sin guardar):
            </p>
            <div className="admin__banner-preview" style={{ marginBottom: 24 }}>
                {hasPreview
                    ? <HeroSlider slides={[form]} preview />
                    : <div className="admin__list-empty">Escribe un título o sube una imagen para ver la vista previa.</div>}
            </div>

            <div className="admin__split">
                {/* Lista */}
                <div>
                    <h2 className="admin__list-title">Diapositivas ({activeCount} activas de {slides.length})</h2>
                    <p className="admin__hint" style={{ marginBottom: 12 }}>
                        Se muestran en este orden y cambian solas cada pocos segundos. Las desactivadas no aparecen en la página.
                    </p>
                    {loading ? (
                        <p className="admin__list-loading">Cargando...</p>
                    ) : slides.length === 0 ? (
                        <div className="admin__list-empty">
                            No hay diapositivas: la portada no se muestra. Crea la primera con el formulario.
                        </div>
                    ) : (
                        <div className="admin__list">
                            {slides.map((s, i) => (
                                <div key={s._id} className={`admin__list-item${editing === s._id ? ' admin__list-item--editing' : !s.active ? ' admin__list-item--inactive' : ''}`}>
                                    <div className="admin__slide-row">
                                        <img src={s.image} alt="" className="admin__slide-thumb" />
                                        <div>
                                            <div className="admin__item-header">
                                                <span className="admin__item-name">{i + 1}. {s.title}</span>
                                                {!s.active && <span className="admin__item-badge" style={{ '--badge-bg': 'var(--color-neutral-bg)', '--badge-color': 'var(--color-neutral)' }}>Desactivada</span>}
                                            </div>
                                            {s.tag && <div className="admin__item-meta"><span>{s.tag}</span></div>}
                                        </div>
                                    </div>
                                    <div className="admin__item-actions">
                                        <button onClick={() => move(i, -1)} disabled={i === 0} className="admin__btn-secondary" aria-label="Subir" title="Subir">↑</button>
                                        <button onClick={() => move(i, 1)} disabled={i === slides.length - 1} className="admin__btn-secondary" aria-label="Bajar" title="Bajar">↓</button>
                                        <button onClick={() => startEdit(s)} className="admin__btn-edit">Editar</button>
                                        <button onClick={() => handleToggle(s)} className="admin__btn-secondary">{s.active ? 'Desactivar' : 'Activar'}</button>
                                        <button onClick={() => handleDelete(s)} className="admin__btn-danger">Eliminar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Formulario */}
                <div className="admin__form-panel">
                    <h2 className="admin__form-title">{editing ? 'Editar diapositiva' : 'Nueva diapositiva'}</h2>
                    <form onSubmit={submit} className="admin__form">
                        <ImageInput label="Imagen *" value={form.image} onChange={(url) => setForm(f => ({ ...f, image: url }))} />
                        <p className="admin__hint">Mejor una foto cuadrada con lo importante en el centro: en computadora se ve cuadrada y en celular se recorta en horizontal, arriba del texto.</p>
                        <div><label className="admin__label">Etiqueta</label><input name="tag" value={form.tag} onChange={handle} className="admin__input" placeholder="✨ Más solicitado" maxLength={40} /></div>
                        <div><label className="admin__label">Título *</label><input name="title" value={form.title} onChange={handle} className="admin__input" placeholder="Corte clásico con estilo" maxLength={80} required /></div>
                        <div>
                            <label className="admin__label">Parte del título en dorado</label>
                            <input name="highlight" value={form.highlight} onChange={handle} className="admin__input" placeholder="clásico" maxLength={40} />
                            <p className="admin__hint">Copia una palabra o frase del título tal cual. Déjalo vacío si no quieres destacar nada.</p>
                        </div>
                        <div><label className="admin__label">Texto</label><textarea name="subtitle" value={form.subtitle} onChange={handle} className="admin__input" rows={2} placeholder="Una frase corta que invite a reservar" maxLength={200} style={{ resize: 'vertical' }} /></div>
                        <div className="admin__form-row">
                            <div><label className="admin__label">Botón principal</label><input name="primaryLabel" value={form.primaryLabel} onChange={handle} className="admin__input" placeholder="Agendar ahora" maxLength={30} /></div>
                            <div><label className="admin__label">Lleva a</label><input name="primaryLink" value={form.primaryLink} onChange={handle} className="admin__input" placeholder="/agendar" list="slide-pages" maxLength={300} /></div>
                        </div>
                        <div className="admin__form-row">
                            <div><label className="admin__label">Segundo botón</label><input name="secondaryLabel" value={form.secondaryLabel} onChange={handle} className="admin__input" placeholder="Ver precios" maxLength={30} /></div>
                            <div><label className="admin__label">Lleva a</label><input name="secondaryLink" value={form.secondaryLink} onChange={handle} className="admin__input" placeholder="/servicios" list="slide-pages" maxLength={300} /></div>
                        </div>
                        <datalist id="slide-pages">{PAGES.map(p => <option key={p} value={p} />)}</datalist>
                        <p className="admin__hint">Botones opcionales. Destino: una página del sitio ({PAGES.join(', ')}) o una URL que empiece por https://</p>
                        <label className="admin__checkbox-label">
                            <input type="checkbox" name="active" checked={form.active} onChange={handle} />
                            Mostrar en la portada
                        </label>
                        <div className="admin__form-actions">
                            <button type="submit" disabled={saving} className="admin__submit-btn">
                                {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear diapositiva'}
                            </button>
                            {editing && <button type="button" onClick={cancelEdit} className="admin__cancel-btn">Cancelar</button>}
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
