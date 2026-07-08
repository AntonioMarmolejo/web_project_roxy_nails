import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import HeroSlider  from '../components/HeroSlider'
import ServiceCard from '../components/ServiceCard'
import { fetchServices } from '../api/services'

const FALLBACK_SERVICES = [
  { _id: '1', name: 'Manicure Gel',  category: 'manicure',    price: 25, duration: 60,  featured: true  },
  { _id: '2', name: 'Pedicure Spa',  category: 'pedicure',    price: 30, duration: 75,  featured: true  },
  { _id: '3', name: 'Nail Art',      category: 'nail-art',    price: 15, duration: 45,  featured: false },
  { _id: '4', name: 'Extensiones',   category: 'extensiones', price: 45, duration: 90,  featured: false },
  { _id: '5', name: 'Retiro Gel',    category: 'retiro',      price: 10, duration: 30,  featured: false },
]

const GALLERY = [
  { bg: '#FDF0F5', emoji: '💅', tall: true  },
  { bg: '#FCE4EC', emoji: '🌸'              },
  { bg: '#F8C8DC', emoji: '✨'              },
  { bg: '#EDE7F6', emoji: '💎'              },
  { bg: '#FFF3E0', emoji: '🌺'              },
  { bg: '#FCE4EC', emoji: '🎀'              },
  { bg: '#F3E5F5', emoji: '💜', tall: true  },
  { bg: '#FFEEF4', emoji: '🌷'              },
  { bg: '#F8C8DC', emoji: '🦋'              },
]

const SectionLabel = ({ children }) => (
  <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 500, marginBottom: 6 }}>
    {children}
  </p>
)

export default function Home() {
  const [services, setServices] = useState(FALLBACK_SERVICES)

  useEffect(() => {
    fetchServices()
      .then(({ data }) => { if (data?.length) setServices(data) })
      .catch(() => {})
  }, [])

  const featured = services.filter(s => s.featured).slice(0, 5)
  const display  = featured.length ? featured : services.slice(0, 5)

  return (
    <>
      <Helmet>
        <title>Roxy Nails — Manicure y Pedicure Profesional</title>
        <meta name="description" content="Estudio de manicure y pedicure profesional. Gel, nail art, extensiones y más. Agenda tu cita online." />
      </Helmet>

      {/* Promo bar */}
      <div style={{
        background: '#C2185B', color: '#fff',
        textAlign: 'center', padding: '10px 1rem',
        fontSize: 13, letterSpacing: '0.02em',
      }}>
        🎉 <strong>Julio: 20% OFF</strong> en manicure gel + pedicure spa —{' '}
        <Link to="/agendar" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 500 }}>
          Agenda tu cita hoy
        </Link>
      </div>

      {/* Hero slider */}
      <HeroSlider />

      {/* Servicios destacados */}
      <section style={{ padding: '3rem 2rem', maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>Lo que hacemos</SectionLabel>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Nuestros servicios</h2>
        <p style={{ fontSize: 14, color: '#9E7080', marginBottom: '2rem', maxWidth: 480 }}>
          Cada servicio incluye limpieza, hidratación y el acabado que elijas.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
          {display.map(svc => <ServiceCard key={svc._id} service={svc} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link to="/servicios">
            <button className="btn-ghost">Ver todos los servicios</button>
          </Link>
        </div>
      </section>

      {/* Galería */}
      <section style={{ padding: '0 2rem 3rem', maxWidth: 1100, margin: '0 auto' }}>
        <SectionLabel>Nuestro trabajo</SectionLabel>
        <h2 style={{ fontSize: 26, marginBottom: '1.5rem' }}>Galería</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridAutoRows: 110,
          gap: 8,
        }}>
          {GALLERY.map((item, i) => (
            <div key={i} style={{
              background: item.bg,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: item.tall ? 36 : 28,
              gridRow: item.tall ? 'span 2' : 'span 1',
              border: '1px solid #F0D0DC',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#C2185B'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#F0D0DC'}
            >{item.emoji}</div>
          ))}
        </div>
      </section>

      {/* CTA Agenda */}
      <section style={{
        background: '#FDF0F5', padding: '3rem 2rem', textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 26, marginBottom: 8 }}>¿Lista para tu próxima cita?</h2>
        <p style={{ fontSize: 14, color: '#9E7080', marginBottom: '1.5rem' }}>
          Reserva en minutos. Recibirás confirmación por WhatsApp.
        </p>
        <Link to="/agendar">
          <button className="btn-primary" style={{ padding: '12px 32px', fontSize: 15 }}>
            Agendar cita
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1A0D12', color: '#907070',
        padding: '2rem 2rem 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
          gap: '2rem', marginBottom: '1.5rem',
        }}>
          <div>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#F8C8DC', marginBottom: 8 }}>
              Roxy Nails
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7 }}>
              Tu estudio de manicure y pedicure de confianza. Cuidamos cada detalle para que brilles.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 12, color: '#F8C8DC', marginBottom: 10, fontWeight: 500, letterSpacing: '0.05em' }}>Servicios</h4>
            {['Manicure Gel','Pedicure Spa','Nail Art','Extensiones'].map(s => (
              <Link key={s} to="/servicios" style={{ display: 'block', fontSize: 12, color: '#907070', marginBottom: 6 }}>{s}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ fontSize: 12, color: '#F8C8DC', marginBottom: 10, fontWeight: 500, letterSpacing: '0.05em' }}>Contacto</h4>
            {['📍 Tu dirección aquí','📱 WhatsApp','📸 Instagram','🕐 Lun–Sáb 8–19h'].map(c => (
              <p key={c} style={{ fontSize: 12, marginBottom: 6 }}>{c}</p>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem', fontSize: 11, textAlign: 'center', color: '#604040' }}>
          © 2026 Roxy Nails — Todos los derechos reservados
        </div>
      </footer>
    </>
  )
}
