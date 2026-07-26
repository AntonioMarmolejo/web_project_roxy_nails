import { Helmet } from 'react-helmet-async'
import PageHeader from '../components/PageHeader'
import '../styles/LegalPage.css'

export default function Privacidad() {
    return (
        <>
            <Helmet>
                <title>Política de Privacidad — Roxy Nails</title>
                <meta name="description" content="Cómo Roxy Nails recopila, usa y protege tus datos personales." />
            </Helmet>

            <PageHeader label="Legal" title="Política de Privacidad" />

            <div className="legal-page">
                <p className="legal-page__updated">Última actualización: julio de 2026</p>

                <h2>1. Qué datos recopilamos</h2>
                <p>
                    Cuando agendas una cita, compras un producto o te inscribes a un taller, recopilamos tu nombre,
                    teléfono, correo electrónico y, si creas una cuenta, una contraseña cifrada. No almacenamos
                    datos de tarjetas de pago.
                </p>

                <h2>2. Para qué usamos tus datos</h2>
                <p>
                    Usamos tu información únicamente para gestionar tus citas, pedidos e inscripciones, enviarte
                    confirmaciones por correo o WhatsApp, y mejorar nuestros servicios. No vendemos ni compartimos
                    tus datos con terceros con fines publicitarios.
                </p>

                <h2>3. Cómo protegemos tu información</h2>
                <p>
                    Tu contraseña se almacena cifrada y nunca en texto plano. El acceso a los datos de clientes está
                    restringido al personal administrativo de Roxy Nails.
                </p>

                <h2>4. Tus derechos</h2>
                <p>
                    Puedes solicitar en cualquier momento que te mostremos, corrijamos o eliminemos tus datos
                    personales escribiéndonos por WhatsApp o correo electrónico.
                </p>

                <h2>5. Cambios a esta política</h2>
                <p>
                    Podemos actualizar esta política ocasionalmente. Publicaremos cualquier cambio en esta misma página.
                </p>

                <p className="legal-page__note">
                    Este documento es un modelo general y debe ser revisado por un profesional legal antes de su uso
                    definitivo en producción.
                </p>
            </div>
        </>
    )
}
