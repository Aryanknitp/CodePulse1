import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;
if (env.smtp.host && env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
}

async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.warn(
      `[mailer] SMTP not configured. Would send "${subject}" to ${to}.`,
    );
    return { delivered: false, mode: "development" };
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, text, html });
  return { delivered: true, mode: "smtp" };
}

// export async function sendEmailOtp(email, otp) {
//   return sendMail({
//     to: email,
//     subject: "Your CodePulse verification code",
//     text: `Your CodePulse verification code is ${otp}. It expires in ${env.emailOtpTtlMinutes} minutes.`,
//     html: `<p>Your CodePulse verification code is <strong>${otp}</strong>.</p><p>It expires in ${env.emailOtpTtlMinutes} minutes.</p>`,
//   });
// }
// Beautiful Email Verification Message.
export async function sendEmailOtp(email, otp) {
  return sendMail({
    to: email,
    subject: "Your CodePulse verification code",
    text: `Your CodePulse verification code is ${otp}. It expires in ${env.emailOtpTtlMinutes} minutes.`,
    html: `
      <div style="margin:0;padding:40px 20px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
        <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.08);">
          
          <div style="padding:28px 32px;background:linear-gradient(135deg,#2563eb,#4f46e5);text-align:center;color:#ffffff;">
            <h1 style="margin:0;font-size:24px;font-weight:700;">
              CodePulse
            </h1>
            <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">
              Email Verification
            </p>
          </div>

          <div style="padding:32px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">
              Hello,
            </p>

            <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#4b5563;">
              Use the verification code below to verify your email address
              and continue with CodePulse.
            </p>

            <div style="margin:0 0 24px;padding:20px;background:#f3f6ff;border:1px solid #dbe4ff;border-radius:12px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#6b7280;">
                Verification Code
              </p>
              <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;">
                ${otp}
              </div>
            </div>

            <div style="padding:14px 16px;background:#fff8e6;border-radius:10px;color:#92400e;font-size:14px;line-height:1.5;">
              ⏱️ This code expires in
              <strong>${env.emailOtpTtlMinutes} minutes</strong>.
            </div>

            <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
              If you didn't request this verification code, you can safely
              ignore this email.
            </p>
          </div>

          <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #eef0f3;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              © CodePulse
            </p>
          </div>

        </div>
      </div>
    `,
  });
}
// sendResetPassword Service
// export async function sendPasswordReset(email, token) {
//   const url = `${env.passwordResetUrl}?token=${encodeURIComponent(token)}`;
//   return sendMail({
//     to: email,
//     subject: "Reset your CodePulse password",
//     text: `Reset your password: ${url}`,
//     html: `<p>Reset your password: <a href="${url}">${url}</a></p>`,
//   });
// }

// more beautiful message
export async function sendPasswordReset(email, token) {
  const url = `${env.passwordResetUrl}?token=${encodeURIComponent(token)}`;

  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <!-- Email Container -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e8e8e8; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
              <!-- Header / Brand -->
              <tr>
                <td align="center" style="padding: 32px 40px 20px 40px; border-bottom: 1px solid #f4f4f7;">
                  <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Code<span style="color: #6366f1;">Pulse</span></h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.4;">Password Reset Request</h2>
                  <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your CodePulse account. Click the button below to choose a new one:</p>
                  
                  <!-- Button Action -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td align="center" style="padding: 10px 0 30px 0;">
                        <a href="${url}" target="_blank" style="display: inline-block; background-color: #6366f1; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 6px; box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 12px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                  <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Thanks,<br>The CodePulse Team</p>
                </td>
              </tr>
              <!-- Footer / Trouble Link -->
              <tr>
                <td style="padding: 0 40px 40px 40px;">
                  <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
                    <p style="margin: 8px 0 0 0; color: #6366f1; font-size: 12px; line-height: 1.5; word-break: break-all;"><a href="${url}" style="color: #6366f1; text-decoration: underline;">${url}</a></p>
                  </div>
                </td>
              </tr>
            </table>
            <!-- Sub-footer -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px;">
              <tr>
                <td align="center" style="padding: 24px 0 0 0;">
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CodePulse. All rights reserved.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendMail({
    to: email,
    subject: "Reset your CodePulse password",
    text: `Reset your password by visiting this link: ${url}`, // Clean fallback text for old clients
    html: htmlTemplate,
  });
}
