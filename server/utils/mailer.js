import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
})

export const mailEnabled = () =>
  Boolean(process.env.MAIL_USER) && !process.env.MAIL_USER.includes('tu_correo')

const wrapper = (title, bodyHtml) => `
  <div style="font-family:Inter,sans-serif;max-width:500px;margin:0 auto;padding:2rem;">
    <h2 style="color:#C2185B;font-family:Georgia,serif;">${title}</h2>
    ${bodyHtml}
    <p style="color:#C2185B;font-weight:600;">¡Gracias por elegir Roxy Nails! 🌸</p>
  </div>
`

export const sendBookingConfirmation = async ({ to, name, serviceName, date, timeSlot }) => {
  const dateStr = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
  await transporter.sendMail({
    from: `"Roxy Nails" <${process.env.MAIL_USER}>`,
    to,
    subject: '✅ Tu cita está confirmada — Roxy Nails',
    html: wrapper('¡Tu cita está confirmada! 💅', `
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
    `),
  })
}

export const sendOrderConfirmation = async ({ to, name, items, total }) => {
  const rows = items.map(i => `
    <tr>
      <td style="padding:6px 0;">${i.name} × ${i.qty}</td>
      <td style="padding:6px 0;text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
    </tr>
  `).join('')
  await transporter.sendMail({
    from: `"Roxy Nails" <${process.env.MAIL_USER}>`,
    to,
    subject: '🛍️ Tu pedido ha sido recibido — Roxy Nails',
    html: wrapper('¡Recibimos tu pedido! 🛍️', `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu pedido en Roxy Nails fue registrado y pronto lo tendremos listo.</p>
        <table style="width:100%;border-collapse:collapse;background:#FDF0F5;border-radius:12px;padding:1.25rem;margin:1.25rem 0;">
          ${rows}
          <tr style="border-top:1px solid #F0D0DC;">
            <td style="padding-top:8px;"><strong>Total</strong></td>
            <td style="padding-top:8px;text-align:right;"><strong>$${total.toFixed(2)}</strong></td>
          </tr>
        </table>
        <p style="color:#9E7080;font-size:13px;">
          Te avisaremos por WhatsApp cuando tu pedido esté en camino o listo para retirar.
        </p>
    `),
  })
}

export const sendEnrollmentConfirmation = async ({ to, name, title, date, price }) => {
  const dateStr = new Date(date).toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
  await transporter.sendMail({
    from: `"Roxy Nails" <${process.env.MAIL_USER}>`,
    to,
    subject: '🎓 Tu inscripción al taller está confirmada — Roxy Nails',
    html: wrapper('¡Estás dentro del taller! 🎓', `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Tu inscripción ha sido registrada exitosamente.</p>
        <div style="background:#FDF0F5;border-radius:12px;padding:1.25rem;margin:1.25rem 0;">
          <p style="margin:0 0 8px"><strong>Taller:</strong> ${title}</p>
          <p style="margin:0 0 8px"><strong>Fecha:</strong> ${dateStr}</p>
          <p style="margin:0"><strong>Precio:</strong> $${price}</p>
        </div>
        <p style="color:#9E7080;font-size:13px;">
          Cualquier duda, contáctanos por WhatsApp antes del taller.
        </p>
    `),
  })
}

export const sendPasswordReset = async ({ to, name, resetUrl }) => {
  await transporter.sendMail({
    from: `"Roxy Nails" <${process.env.MAIL_USER}>`,
    to,
    subject: '🔒 Recupera tu contraseña — Roxy Nails',
    html: wrapper('Recupera tu contraseña 🔒', `
        <p>Hola <strong>${name}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:</p>
        <p style="text-align:center;margin:1.5rem 0;">
          <a href="${resetUrl}" style="background:#C2185B;color:#fff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#9E7080;font-size:13px;">
          Si no solicitaste este cambio, puedes ignorar este correo. El enlace vence en 1 hora.
        </p>
    `),
  })
}
