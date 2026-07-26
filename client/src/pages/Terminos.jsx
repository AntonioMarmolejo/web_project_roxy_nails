import { Helmet } from 'react-helmet-async'
import PageHeader from '../components/PageHeader'
import '../styles/LegalPage.css'

export default function Terminos() {
    return (
        <>
            <Helmet>
                <title>Términos y Condiciones — Roxy Nails</title>
                <meta name="description" content="Términos y condiciones de uso de los servicios de Roxy Nails." />
            </Helmet>

            <PageHeader label="Legal" title="Términos y Condiciones" />

            <div className="legal-page">
                <p className="legal-page__updated">Última actualización: julio de 2026</p>

                <h2>1. Citas y cancelaciones</h2>
                <p>
                    Al agendar una cita te comprometes a asistir en el horario reservado. Si necesitas cancelar o
                    reprogramar, contáctanos por WhatsApp con la mayor anticipación posible.
                </p>

                <h2>2. Compras en la tienda</h2>
                <p>
                    Los pedidos se pagan contra entrega o en el local, salvo que se indique lo contrario. Los precios
                    y el stock mostrados pueden cambiar sin previo aviso.
                </p>

                <h2>3. Inscripción a talleres</h2>
                <p>
                    Los cupos de cada taller son limitados y se asignan por orden de inscripción. El pago confirma tu
                    lugar en el taller.
                </p>

                <h2>4. Cuentas de usuario</h2>
                <p>
                    Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada
                    desde tu cuenta.
                </p>

                <h2>5. Propiedad del contenido</h2>
                <p>
                    Las imágenes y diseños publicados en la galería son propiedad de Roxy Nails y no pueden
                    reproducirse sin autorización.
                </p>

                <p className="legal-page__note">
                    Este documento es un modelo general y debe ser revisado por un profesional legal antes de su uso
                    definitivo en producción.
                </p>
            </div>
        </>
    )
}
