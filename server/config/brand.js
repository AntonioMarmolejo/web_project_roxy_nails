// Datos de la marca usados por la API (correos, health check).
// Mantener en sintonía con client/src/config/brand.js.
export const brand = {
  name: "Captain's",
  fullName: "Captain's Barbería Studio Unisex",
  address: 'Puerto Ayora, Galápagos',
  // Paleta de los correos (los clientes de correo no soportan variables CSS)
  email: {
    primary: '#8C6A2B',      // dorado oscuro: legible sobre blanco (5.0:1)
    onPrimary: '#FFFFFF',
    surface: '#F7F1E3',      // crema claro (los fondos negros fallan en muchos clientes de correo)
    border: '#E3D4AE',
    muted: '#6F6553',
    fontBody: "Montserrat,Arial,sans-serif",
    fontHeading: "Cinzel,Georgia,serif",
  },
}
