import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import '../styles/NotFound.css'

export default function NotFound() {
    return (
        <>
            <Helmet>
                <title>Página no encontrada — Roxy Nails</title>
                <meta name="description" content="La página que buscas no existe." />
            </Helmet>

            <div className="not-found">
                <div className="not-found__icon">💅</div>
                <h1 className="not-found__title">404</h1>
                <p className="not-found__sub">
                    Uy, esta página no existe o fue movida.
                </p>
                <Link to="/">
                    <button className="btn btn--primary" style={{ width: 'auto' }}>
                        Volver al inicio
                    </button>
                </Link>
            </div>
        </>
    )
}
