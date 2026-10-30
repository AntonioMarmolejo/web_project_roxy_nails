// Instalación de la página como app (PWA).
// Chrome/Android avisan con "beforeinstallprompt" una sola vez y al principio: se guarda aquí
// para mostrar el diálogo de instalación cuando el cliente pulse nuestro botón.
// iPhone (Safari) no tiene ese aviso: se instala desde Compartir → "Agregar a inicio".

let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach(fn => fn())

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()            // en su lugar se muestra nuestro aviso
        deferred = e
        notify()
    })
    window.addEventListener('appinstalled', () => {
        deferred = null
        notify()
    })
}

export const canPromptInstall = () => Boolean(deferred)

// Abre el diálogo de instalación del navegador. Devuelve 'accepted', 'dismissed' o 'unavailable'.
export async function promptInstall() {
    if (!deferred) return 'unavailable'
    const prompt = deferred
    deferred = null
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    notify()
    return outcome
}

export const onInstallChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }

// ¿Ya se está usando como app instalada?
export const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export const isIOS = () =>
    /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

// El aviso se puede volver a abrir desde cualquier parte (p. ej. el pie de página)
export const SHOW_INSTALL_EVENT = 'captains:show-install'
export const showInstallHelp = () => window.dispatchEvent(new Event(SHOW_INSTALL_EVENT))

// Registra el service worker (solo en producción, para no interferir con el desarrollo)
export function registerServiceWorker() {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => console.warn('Service worker no registrado:', err.message))
    })
}
