import { useEffect, useState } from 'react'
import { canPromptInstall, promptInstall, onInstallChange, isStandalone, isIOS, SHOW_INSTALL_EVENT } from '../utils/installApp'
import { brand } from '../config/brand'
import '../styles/InstallAppBanner.css'

const DISMISS_KEY = 'captains-install-dismissed'
const DISMISS_DAYS = 14
const DELAY_MS = 4000

const recentlyDismissed = () => {
    try {
        const t = Number(localStorage.getItem(DISMISS_KEY))
        return t && Date.now() - t < DISMISS_DAYS * 864e5
    } catch { return false }
}

// Aviso para instalar la página como app en el celular.
// Android/Chrome: botón que abre el diálogo de instalación. iPhone: instrucciones (Compartir → Agregar a inicio).
export default function InstallAppBanner() {
    const [open, setOpen] = useState(false)
    const [, refresh] = useState(0)
    const ios = isIOS()

    useEffect(() => {
        const off = onInstallChange(() => refresh(n => n + 1))
        const showOnRequest = () => setOpen(true)
        window.addEventListener(SHOW_INSTALL_EVENT, showOnRequest)

        // Aparece solo, una vez, en celulares que aún no la tienen instalada
        const mobile = window.matchMedia?.('(pointer: coarse)').matches
        const timer = setTimeout(() => {
            if (mobile && !isStandalone() && !recentlyDismissed() && (canPromptInstall() || ios)) setOpen(true)
        }, DELAY_MS)

        return () => { off(); clearTimeout(timer); window.removeEventListener(SHOW_INSTALL_EVENT, showOnRequest) }
    }, [ios])

    if (!open || isStandalone()) return null

    const dismiss = () => {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())) } catch { /* sin almacenamiento: solo se cierra */ }
        setOpen(false)
    }
    const install = async () => {
        const outcome = await promptInstall()
        if (outcome !== 'unavailable') setOpen(false)
    }

    return (
        <div className="install-banner" role="dialog" aria-label="Instalar la app">
            <img src="/icon-192.png" alt="" className="install-banner__icon" />
            <div className="install-banner__text">
                <strong>Instala la app de {brand.name}</strong>
                {canPromptInstall() ? (
                    <span>Agenda tus citas más rápido desde tu pantalla de inicio.</span>
                ) : ios ? (
                    <span>Toca <b>Compartir</b> <span aria-hidden="true">⬆️</span> y luego <b>“Agregar a inicio”</b>.</span>
                ) : (
                    <span>Abre el menú del navegador (⋮) y elige <b>“Instalar app”</b> o <b>“Agregar a la pantalla principal”</b>.</span>
                )}
            </div>
            {canPromptInstall() && (
                <button type="button" onClick={install} className="install-banner__btn">Instalar</button>
            )}
            <button type="button" onClick={dismiss} className="install-banner__close" aria-label="Cerrar">×</button>
        </div>
    )
}
