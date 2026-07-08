# Roxy Nails 💅

Aplicación web MERN para gestión de servicios, citas, tienda y talleres.

## Stack
- **Frontend**: React 18 + Vite + Zustand + React Router
- **Backend**: Node.js + Express
- **Base de datos**: MongoDB Atlas + Mongoose
- **Despliegue**: Vercel (cliente) + Railway (servidor)

---

## Instalación local

### 1. Clonar y entrar al proyecto
```bash
git clone <tu-repo>
cd roxy-nails
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

---

## Endpoints principales

| Método | Ruta                        | Acceso    |
|--------|-----------------------------|-----------|
| POST   | /api/v1/auth/register       | Público   |
| POST   | /api/v1/auth/login          | Público   |
| GET    | /api/v1/services            | Público   |
| GET    | /api/v1/bookings/slots      | Público   |
| POST   | /api/v1/bookings            | Público   |
| GET    | /api/v1/products            | Público   |
| POST   | /api/v1/services            | Admin     |
| GET    | /api/v1/bookings            | Admin     |
| PATCH  | /api/v1/bookings/:id        | Admin     |

---

## Despliegue

### Frontend → Vercel
1. Conecta tu repositorio en vercel.com
2. Configura `VITE_API_URL` en las variables de entorno de Vercel
3. Cada `git push` despliega automáticamente

### Backend → Railway
1. Crea un nuevo proyecto en railway.app
2. Conecta el repositorio, selecciona la carpeta `server`
3. Agrega las variables de entorno del `.env.example`
4. Railway detecta automáticamente Node.js y despliega

### Base de datos → MongoDB Atlas
1. Crea un cluster gratuito en mongodb.com/atlas
2. Crea un usuario de base de datos
3. Copia el connection string a `MONGO_URI`
4. Permite acceso desde cualquier IP (0.0.0.0/0) para Railway
