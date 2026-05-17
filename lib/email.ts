import { Resend } from "resend";
import nodemailer from "nodemailer";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Styled text logo for emails — purple "Get" + black "Materials"
// Uses @media (prefers-color-scheme: dark) for dark mode: purple "Get" + white "Materials"
const emailLogo = `
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
      <span style="color: #7c3aed;">Get</span><span style="color: #1e293b;">Materials</span>
    </h1>
  </div>
`;

export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  const from = process.env.EMAIL_FROM || "GetMaterials <noreply@getmaterials.in>";

  // Try Resend first
  if (resend) {
    try {
      await resend.emails.send({ from, to, subject, html });
      return true;
    } catch (error) {
      console.error("Resend failed, falling back to nodemailer:", error);
    }
  }

  // Fallback to Nodemailer
  try {
    await transporter.sendMail({ from, to, subject, html });
    return true;
  } catch (error) {
    console.error("Nodemailer also failed:", error);
    return false;
  }
}

export function getWelcomeEmailHtml(name: string): string {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
      ${emailLogo}
      <h2 style="color: #1e293b; font-size: 20px;">Welcome, ${name}! 🎉</h2>
      <p style="color: #475569; line-height: 1.6;">
        Thank you for joining GetMaterials. You now have access to thousands of
        study materials uploaded by verified teachers.
      </p>
      <p style="color: #475569; line-height: 1.6;">
        Start browsing subjects, bookmark your favorites, and ace your exams!
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/subjects"
         style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        Start Learning
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        — The GetMaterials Team
      </p>
    </div>
  `;
}

export function getTeacherApprovedEmailHtml(name: string): string {
  return `
    <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
      ${emailLogo}
      <h2 style="color: #1e293b; font-size: 20px;">You&apos;re approved, ${name}! ✅</h2>
      <p style="color: #475569; line-height: 1.6;">
        Great news! Your teacher account has been approved. You can now start
        uploading study materials for students.
      </p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/teacher/upload"
         style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
        Upload Your First Material
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        — The GetMaterials Team
      </p>
    </div>
  `;
}
