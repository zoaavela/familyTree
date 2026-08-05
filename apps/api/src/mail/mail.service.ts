import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');
  }

  async sendVerificationEmail(to: string, token: string) {
    const verificationUrl = `http://localhost:5173/verify?token=${token}`;

    try {
      if (!process.env.RESEND_API_KEY) {
        this.logger.warn(`No RESEND_API_KEY found. Verification URL for ${to}: ${verificationUrl}`);
        return;
      }

      const { data, error } = await this.resend.emails.send({
        from: 'FamilyTree <onboarding@resend.dev>', // Use verified domain later
        to: [to],
        subject: 'Vérifiez votre adresse email',
        html: `
          <h1>Bienvenue sur FamilyTree !</h1>
          <p>Merci de vous être inscrit. Veuillez cliquer sur le lien ci-dessous pour vérifier votre adresse email :</p>
          <a href="${verificationUrl}">Vérifier mon compte</a>
          <p>Ou copiez ce lien dans votre navigateur : ${verificationUrl}</p>
        `,
      });

      if (error) {
        this.logger.error('Error sending verification email', error);
      }
    } catch (error) {
      this.logger.error('Failed to send email', error);
    }
  }
}
