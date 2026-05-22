import { Injectable } from '@nestjs/common';

let sgMail: any = null;

@Injectable()
export class EmailService {
  constructor() {
    // don't eagerly require/import here; load on first send to support ESM/CJS variants
  }

  private async ensureClient() {
    if (sgMail) return sgMail;
    try {
      // try dynamic import (works for ESM packages)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('@sendgrid/mail');
      sgMail = (mod && (mod.default ?? mod));
    } catch (e) {
      try {
        // fallback to require for CJS
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod2 = require('@sendgrid/mail');
        sgMail = mod2;
      } catch (err) {
        sgMail = null;
      }
    }
    if (sgMail) {
      const key = process.env.SENDGRID_API_KEY;
      if (key && sgMail.setApiKey) sgMail.setApiKey(key);
    }
    return sgMail;
  }

  async sendOtp(to: string, otp: string) {
    const client = await this.ensureClient();
    if (!client) throw new Error('@sendgrid/mail not installed or configured');
    const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';
    const subject = 'Tu código de verificación';
    const text = `Tu código OTP es: ${otp}. Expira en ${process.env.OTP_TTL_MINUTES ?? 5} minutos.`;
    const html = `<p>Tu código OTP es: <strong>${otp}</strong></p><p>Expira en ${process.env.OTP_TTL_MINUTES ?? 5} minutos.</p>`;
    await client.send({ to, from, subject, text, html });
  }

  async sendPasswordReset(to: string, link: string) {
    const client = await this.ensureClient();
    if (!client) throw new Error('@sendgrid/mail not installed or configured');
    const from = process.env.EMAIL_FROM ?? 'no-reply@example.com';
    const subject = 'Restablecer contraseña';
    const text = `Solicitaste restablecer tu contraseña. Usa este enlace: ${link} (expira pronto).`;
    const html = `<p>Solicitaste restablecer tu contraseña. Haz click en el siguiente enlace para establecer una nueva contraseña:</p><p><a href="${link}">${link}</a></p><p>Si no solicitaste esto, ignora este correo.</p>`;
    await client.send({ to, from, subject, text, html });
  }
}
