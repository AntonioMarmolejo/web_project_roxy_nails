import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

export const sendBookingConfirmation = async ({ to, name, serviceName, date, timeSlot }) => {
  const dateStr = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
  await transporter.sendMail({
    from: `"Roxy Nails" <${process.env.MAIL_USER}>`,
    to,
    subject: '✅ Tu cita está confirmada — Roxy Nails',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
        <h2 style="color:#C2185B;font-family:Georgia,serif;">¡Tu cita está confirmada! 💅</h2>
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu reserva en Roxy Nails ha sido registrada exitosamente.</p>
        <div style="background:#FDF0F5;border-radius:12px;padding:1.25rem;margin:1.25rem 0;">
          <p style="margin:0 0 8px"><strong>Servicio:</strong> ${serviceName}</p>
          <p style="margin:0 0 8px"><strong>Fecha:</strong> ${dateStr}</p>
          <p style="margin:0"><strong>Hora:</strong> ${timeSlot}</p>
        </div>
        <p style="color:#9E7080;font-size:13px;">
          Si necesitas cancelar o cambiar tu cita, contáctanos por WhatsApp con anticipación.
        </p>
        <p style="color:#C2185B;font-weight:600;">¡Te esperamos con mucho cariño! 🌸</p>
      </div>
    `,
  })
}
