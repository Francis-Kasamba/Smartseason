import nodemailer from 'nodemailer'

function isSmtpEnabled() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_FROM
  )
}

let transporter = null

function getTransporter() {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  return transporter
}

export async function sendAgentWelcomeEmail({ name, email, password }) {
  if (!isSmtpEnabled()) {
    return { sent: false, reason: 'SMTP is not fully configured' }
  }

  const transport = getTransporter()
  await transport.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'SmartSeason agent invite',
    text:
      `Hello ${name},\n\n` +
      `Your SmartSeason agent account has been created.\n\n` +
      `Email: ${email}\n` +
      `Temporary password: ${password}\n\n` +
      `When you sign in, you must reset this temporary password before accessing anything else in SmartSeason.\n\n` +
      `- SmartSeason`,
  })

  return { sent: true }
}
