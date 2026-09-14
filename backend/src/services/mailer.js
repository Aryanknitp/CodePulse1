import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

let transporter = null;
if (env.smtp.host && env.smtp.user && env.smtp.pass) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
    dnsTimeout: 10000,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}
async function sendMail({ to, subject, text, html }) {
  let resendFailure = null;
  if (env.resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.resendFrom,
          to: [to],
          subject,
          text,
          html,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) return { delivered: true, mode: "resend" };
      const providerMessage = (await response.text()).slice(0, 300);
      resendFailure = `Resend returned HTTP ${response.status}: ${providerMessage}`;
      console.warn(`[mailer] ${resendFailure}; trying SMTP fallback.`);
    } catch (error) {
      resendFailure = error.code || error.message;
      console.warn(
        `[mailer] Resend request failed (${resendFailure}); trying SMTP fallback.`,
      );
    }
  }

  if (!transporter) {
    if (env.nodeEnv === "production") {
      throw new AppError(
        503,
        resendFailure
          ? "Email delivery is unavailable. Configure a valid RESEND_API_KEY or SMTP account."
          : "Email delivery is not configured.",
        "EMAIL_DELIVERY_FAILED",
        { provider: resendFailure || "none" },
      );
    }
    console.warn(
      `[mailer] SMTP not configured. Would send "${subject}" to ${to}.`,
    );
    return { delivered: false, mode: "development" };
  }
  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    const isGmailAuthError =
      error.code === "EAUTH" || error.responseCode === 535;
    throw new AppError(
      503,
      isGmailAuthError
        ? "Email credentials are invalid. Set a Gmail App Password or configure RESEND_API_KEY."
        : "Email delivery failed. Check the SMTP configuration.",
      "EMAIL_DELIVERY_FAILED",
      { providerCode: error.code, responseCode: error.responseCode },
    );
  }
  return { delivered: true, mode: "smtp" };
}
export async function sendEmailOtp(email, otp) {
  return sendMail({
    to: email,
    subject: "Your CodePulse verification code",
    text: `Your CodePulse verification code is ${otp}. It expires in ${env.emailOtpTtlMinutes} minutes.`,
    html: `<p>Your CodePulse verification code is <strong>${otp}</strong>.</p><p>It expires in ${env.emailOtpTtlMinutes} minutes.</p>`,
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
