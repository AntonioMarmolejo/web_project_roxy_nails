import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'
import '../styles/GoogleButton.css'

// Botón oficial "Continuar con Google" (Google Identity Services).
// En el celular muestra las cuentas de Google del teléfono. El ID de cliente lo da la API;
// si no está configurado, el botón no aparece.
let configPromise = null
const getClientId = () => {
    configPromise ||= api.get('/auth/google/config').then(({ data }) => data.clientId).catch(() => null)
    return configPromise
}

let scriptPromise = null
const loadGoogleScript = () => {
    scriptPromise ||= new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) return resolve()
        const s = document.createElement('script')
        s.src = 'https://accounts.google.com/gsi/client'
        s.async = true
        s.onload = resolve
        s.onerror = () => { scriptPromise = null; reject(new Error('No se pudo cargar Google')) }
        document.head.appendChild(s)
    })
    return scriptPromise
}

// El mismo botón sirve para entrar y para crear la cuenta ("Continuar con Google")
export default function GoogleButton({ onCredential, onError }) {
    const ref = useRef(null)
    const [state, setState] = useState('loading')   // loading | ready | off

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            const clientId = await getClientId()
            if (!clientId) { if (!cancelled) setState('off'); return }
            try {
                await loadGoogleScript()
            } catch (err) {
                if (!cancelled) { setState('off'); onError?.(err.message) }
                return
            }
            if (cancelled || !ref.current) return
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (res) => onCredential(res.credential),
                ux_mode: 'popup',
                cancel_on_tap_outside: true,
            })
            window.google.accounts.id.renderButton(ref.current, {
                type: 'standard',
                theme: 'filled_black',
                size: 'large',
                shape: 'pill',
                text: 'continue_with',
                logo_alignment: 'center',
                locale: 'es',
                width: Math.min(400, ref.current.offsetWidth || 320),
            })
            setState('ready')
        })()
        return () => { cancelled = true }
    }, [])

    if (state === 'off') return null
    return (
        <div className="google-btn">
            <div ref={ref} className="google-btn__slot" />
            {state === 'loading' && <div className="google-btn__placeholder" aria-hidden="true" />}
            <div className="google-btn__divider"><span>o con tu correo</span></div>
        </div>
    )
}
