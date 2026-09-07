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
export async function sendPasswordReset(email, token) {
  const url = `${env.passwordResetUrl}?token=${encodeURIComponent(token)}`;
  return sendMail({
    to: email,
    subject: "Reset your CodePulse password",
    text: `Reset your password: ${url}`,
    html: `<p>Reset your password: <a href="${url}">${url}</a></p>`,
  });
}
