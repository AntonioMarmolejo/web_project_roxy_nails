// Service worker de la app instalable (PWA).
//
// Estrategia, pensada para que nunca se quede una versión vieja de la página:
//   - Páginas (navegación): siempre se piden a la red. Solo si no hay conexión se
//     muestra la última versión guardada o, si no hay ninguna, /offline.html.
//   - Archivos de /assets/: llevan un hash en el nombre (cambian en cada versión),
//     así que se guardan y se sirven desde la caché.
//   - La API y todo lo de otros dominios (Cloudinary, fuentes, WhatsApp): no se toca.
//
// Al publicar cambios que afecten a este archivo, subir VERSION para limpiar las cachés viejas.

const VERSION = 'v1'
const PAGES = `captains-pages-${VERSION}`
const ASSETS = `captains-assets-${VERSION}`
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(PAGES)
            .then((cache) => cache.addAll([OFFLINE_URL, '/icon-192.png']))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k.startsWith('captains-') && ![PAGES, ASSETS].includes(k))
                    .map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return
    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return

    // Páginas: red primero; sin conexión, la copia guardada o la página "sin conexión"
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (response.ok) {
                        const copy = response.clone()
                        caches.open(PAGES).then((cache) => cache.put('/', copy))
                    }
                    return response
                })
                .catch(async () => (await caches.match('/')) || caches.match(OFFLINE_URL))
        )
        return
    }

    // Archivos con hash: caché primero
    if (url.pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.open(ASSETS).then(async (cache) => {
                const cached = await cache.match(request)
                if (cached) return cached
                const response = await fetch(request)
                if (response.ok) {
                    await cache.put(request, response.clone())
                    // Cada versión publicada trae archivos nuevos: conservar solo los 60 más recientes
                    const keys = await cache.keys()
                    await Promise.all(keys.slice(0, Math.max(0, keys.length - 60)).map((k) => cache.delete(k)))
                }
                return response
            })
        )
    }
})
