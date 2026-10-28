# Captain's Barbería Studio Unisex ✂️

Aplicación web MERN para un local de belleza unisex: catálogo de servicios (capilar, uñas, cejas y pestañas), reservas de citas, tienda, talleres y panel de administración.

## Stack
- **Frontend**: React 18 + Vite + Zustand + React Router
- **Backend**: Node.js + Express
- **Base de datos**: MongoDB Atlas + Mongoose
- **Imágenes**: Cloudinary
- **Despliegue**: Vercel (cliente y API)

## Marca y diseño
- Nombre, eslogan, teléfono y WhatsApp: `client/src/config/brand.js` (y `server/config/brand.js` para los correos).
- Colores y fuentes: `client/src/styles/theme.css` (único lugar donde se definen; el resto usa `var(--color-*)` / `var(--font-*)`).
- Categorías de servicios, iconos y formato de precios: `client/src/config/services.js` (deben coincidir con `server/models/Service.js`).

---

## Instalación local

### 1. Clonar y entrar al proyecto
```bash
git clone <tu-repo>
cd web_project_roxy_nails
```

### 2. Configurar el servidor
```bash
cd server
npm install
cp .env.example .env
# Edita .env con tus credenciales reales
npm run dev
```

### 3. Configurar el cliente
```bash
cd client
npm install
cp .env.example .env
# Edita VITE_API_URL si tu backend corre en otro puerto
npm run dev
```

El cliente corre en http://localhost:5173
El servidor corre en http://localhost:5000

### 4. Cargar el catálogo de servicios
```bash
cd server
node scripts/seed-captains.js            # simulación: muestra qué haría
node scripts/seed-captains.js --apply    # aplica en la base de MONGO_URI
```
El script es idempotente: solo inserta los servicios que faltan, no sobrescribe precios editados desde el admin y oculta (sin borrar) los servicios del catálogo anterior. Contra una base que no sea `localhost` exige además `--confirm-prod`.

---

## Endpoints principales

| Método | Ruta                        | Acceso    |
|--------|-----------------------------|-----------|
| POST   | /api/v1/auth/register       | Público   |
| POST   | /api/v1/auth/login          | Público   |
| GET    | /api/v1/services            | Público (solo activos) |
| GET    | /api/v1/services/all        | Admin (incluye ocultos) |
| POST   | /api/v1/services            | Admin     |
| PUT    | /api/v1/services/:id        | Admin     |
| GET    | /api/v1/bookings/slots      | Público   |
| POST   | /api/v1/bookings            | Público   |
| GET    | /api/v1/products            | Público   |
| GET    | /api/v1/bookings            | Admin     |
| PATCH  | /api/v1/bookings/:id        | Admin     |

---

## Despliegue

### Frontend → Vercel
1. Proyecto con Root Directory `client`.
2. Variable `VITE_API_URL` (tipo Config) con la URL pública de la API + `/api/v1`.
3. Cada `git push` a `main` despliega automáticamente.

### API → Vercel
1. Proyecto con Root Directory `server` y preset **Other** (entrada: `server/api/index.js`).
2. Variables del `.env.example`; `CLIENT_URL` admite varios orígenes separados por comas.

### Base de datos → MongoDB Atlas
1. Crea un cluster y un usuario de base de datos.
2. Copia el connection string a `MONGO_URI` (con el nombre de la base antes del `?`).
3. Permite acceso desde cualquier IP (0.0.0.0/0), porque Vercel no tiene IPs fijas.
