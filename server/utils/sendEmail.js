// src/lib/superpaasEmail.js
import SibApiV3Sdk from "sib-api-v3-sdk";

/**
 * Configure Brevo (Sendinblue)
 */
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transEmailApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Common sender + support
const SENDER = {
  email: process.env.BREVO_SENDER_EMAIL,
  name: "SuperPaas",
};
const SUPPORT_EMAIL =
  process.env.SUPERPAAS_SUPPORT_EMAIL || "support@superpaas.app";

// Optional: your app URLs
const APP_URL = process.env.APP_URL || "https://your-app-domain.com";
const DASHBOARD_URL = `${APP_URL}/dashboard`;
const LOGIN_URL = `${APP_URL}/login`;
const FORGOT_URL = `${APP_URL}/forgot`;

/**
 * Shared send helper
 */
export const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transEmailApi.sendTransacEmail({
      sender: SENDER,
      to: [{ email: to }],
      replyTo: { email: SUPPORT_EMAIL, name: "SuperPaas Support" },
      subject,
      htmlContent,
      // Optional fallback text:
      textContent: subject,
    });
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.log(`✅ Email sent to ${to} | ${subject}`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "❌ Email send error:",
      error?.response?.text || error?.message || error
    );
    throw error;
  }
};

/* =============================================================================
   1) Verification OTP (Registration – Step 2)
============================================================================= */
export const sendVerificationEmail = async (to, otp) => {
  const subject = "Verify your email • SuperPaas";
  const year = new Date().getFullYear();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Verify your email</title>
<style>
  @media (max-width: 620px){ .container{width:100% !important} .px{padding-left:16px !important;padding-right:16px !important} }
</style>
</head>
<body style="margin:0;padding:0;background:#0a0f1f;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Use this code to verify your email on SuperPaas</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0f1f;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="620" class="container" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;background:#0f1426;border:1px solid #1e2a4a;border-radius:14px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px;background:linear-gradient(135deg,#0b1122,#0d1a33 65%);">
              <div style="display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,.12);border-radius:10px;">
                <span style="display:inline-block;width:8px;height:8px;background:#4f8bff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#7c5cff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#19cfbc;border-radius:2px;"></span>
              </div>
              <h1 style="margin:12px 0 0;font:700 24px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6f3ff;">
                <span style="color:#19cfbc;font-weight:700;">SuperPaas</span> • Verify Email
              </h1>
              <p style="margin:6px 0 0;font:500 13px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#9fb3d9;">
                Secure your account in one quick step
              </p>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:26px 28px;background:
              radial-gradient(800px 400px at 85% -10%,rgba(56,126,255,0.12),transparent 60%),
              radial-gradient(700px 350px at -20% 10%,rgba(25,207,188,0.10),transparent 60%);">
              <p style="margin:0 0 12px;font:400 15px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#c7d6f1;">
                Thanks for signing up for <strong style="color:#e6f3ff;">SuperPaas</strong>. Use the code below to verify your email:
              </p>
              <div style="margin:18px 0 6px;text-align:center;">
                <div style="display:inline-block;padding:14px 28px;border:1px dashed rgba(79,139,255,.5);border-radius:12px;background:#0b1224;">
                  <span style="font:700 26px/1.2 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:6px;color:#e6f3ff;">${otp}</span>
                </div>
              </div>
              <p style="margin:8px 0 0;font:400 13px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#9fb3d9;">
                This code expires in <strong>10 minutes</strong>. Don’t share it with anyone.
              </p>
              <div style="text-align:center;margin:22px 0 6px;">
                <a href="${LOGIN_URL}" style="display:inline-block;text-decoration:none;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;font:600 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Open SuperPaas</a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 12px;background:#0b1224;border-top:1px solid #1e2a4a;">
              <p style="margin:0;font:400 12px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8aa0c7;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#19cfbc;text-decoration:none;">${SUPPORT_EMAIL}</a><br/>
                © ${year} SuperPaas. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(to, subject, htmlContent);
};

/* =============================================================================
   2) Registration Success / Welcome
============================================================================= */
export const sendRegistrationSuccessEmail = async (to, userName) => {
  const subject = "Welcome to SuperPaas 🎉";
  const year = new Date().getFullYear();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Welcome</title>
<style>@media (max-width:620px){.container{width:100% !important}.px{padding-left:16px !important;padding-right:16px !important}}</style>
</head>
<body style="margin:0;padding:0;background:#0a0f1f;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your SuperPaas account is ready — start creating events.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0f1f;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="620" class="container" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;background:#0f1426;border:1px solid #1e2a4a;border-radius:14px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px;background:linear-gradient(135deg,#0b1122,#0d1a33 65%);">
              <div style="display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,.12);border-radius:10px;">
                <span style="display:inline-block;width:8px;height:8px;background:#4f8bff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#7c5cff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#19cfbc;border-radius:2px;"></span>
              </div>
              <h1 style="margin:12px 0 0;font:700 24px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6f3ff;">
                <span style="color:#19cfbc;">SuperPaas</span> • Welcome
              </h1>
              <p style="margin:6px 0 0;font:500 13px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#9fb3d9;">
                Great to have you, ${userName || "there"}!
              </p>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:26px 28px;background:
              radial-gradient(800px 400px at 85% -10%,rgba(56,126,255,0.12),transparent 60%),
              radial-gradient(700px 350px at -20% 10%,rgba(25,207,188,0.10),transparent 60%);">
              <p style="margin:0 0 14px;font:400 15px/1.8 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#c7d6f1;">
                You’re all set. Create events, accept payments, issue QR tickets, and manage check-ins — all from one modern dashboard.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:16px 0;">
                <tr>
                  <td style="padding:12px;border:1px solid #1e2a4a;border-radius:12px;background:#0b1224;color:#c7d6f1;font:400 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
                    <strong style="color:#e6f3ff;">Quick start</strong><br/>
                    • Create your first event in minutes<br/>
                    • Share the public page & sell tickets<br/>
                    • Scan QR codes at the gate for instant check-ins
                  </td>
                </tr>
              </table>
              <div style="text-align:center;margin:22px 0 6px;">
                <a href="${DASHBOARD_URL}" style="display:inline-block;text-decoration:none;background:#2563eb;color:#fff;padding:12px 22px;border-radius:10px;font:600 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Go to Dashboard</a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 12px;background:#0b1224;border-top:1px solid #1e2a4a;">
              <p style="margin:0;font:400 12px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8aa0c7;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#19cfbc;text-decoration:none;">${SUPPORT_EMAIL}</a><br/>
                © ${year} SuperPaas. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(to, subject, htmlContent);
};

/* =============================================================================
   3) Forgot Password – OTP
============================================================================= */
export const sendPasswordResetEmail = async (to, otp) => {
  const subject = "Reset your password • SuperPaas";
  const year = new Date().getFullYear();

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>Password reset</title>
<style>@media (max-width:620px){.container{width:100% !important}.px{padding-left:16px !important;padding-right:16px !important}}</style>
</head>
<body style="margin:0;padding:0;background:#0a0f1f;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Use this code to reset your SuperPaas password</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0a0f1f;">
    <tr>
      <td align="center" style="padding:28px 16px;">
        <table role="presentation" width="620" class="container" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;background:#0f1426;border:1px solid #1e2a4a;border-radius:14px;overflow:hidden;">
          <tr>
            <td align="center" style="padding:28px;background:linear-gradient(135deg,#1b0f1c,#26102c 65%);">
              <div style="display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,.12);border-radius:10px;">
                <span style="display:inline-block;width:8px;height:8px;background:#4f8bff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#7c5cff;border-radius:2px;margin-right:6px;"></span>
                <span style="display:inline-block;width:8px;height:8px;background:#19cfbc;border-radius:2px;"></span>
              </div>
              <h1 style="margin:12px 0 0;font:700 24px/1.3 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#e6f3ff;">
                <span style="color:#19cfbc;">SuperPaas</span> • Reset Password
              </h1>
              <p style="margin:6px 0 0;font:500 13px/1.6 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#c5a3c7;">
                We received a password reset request
              </p>
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:26px 28px;background:
              radial-gradient(800px 400px at 85% -10%,rgba(124,92,255,0.12),transparent 60%),
              radial-gradient(700px 350px at -20% 10%,rgba(25,207,188,0.10),transparent 60%);">
              <p style="margin:0 0 12px;font:400 15px/1.8 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#c7d6f1;">
                Use this OTP to continue. If you didn’t request this, you can safely ignore this email.
              </p>
              <div style="margin:18px 0 6px;text-align:center;">
                <div style="display:inline-block;padding:14px 28px;border:1px dashed rgba(221,36,118,.45);border-radius:12px;background:#120e15;">
                  <span style="font:700 26px/1.2 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;letter-spacing:6px;color:#e6f3ff;">${otp}</span>
                </div>
              </div>
              <p style="margin:8px 0 0;font:400 13px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#9fb3d9;">
                The code expires in <strong>10 minutes</strong>.
              </p>
              <div style="text-align:center;margin:22px 0 6px;">
                <a href="${FORGOT_URL}" style="display:inline-block;text-decoration:none;background:#2563eb;color:#fff;padding:12px 20px;border-radius:10px;font:600 13px -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">Continue</a>
              </div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:18px 12px;background:#0b1224;border-top:1px solid #1e2a4a;">
              <p style="margin:0;font:400 12px/1.7 -apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#8aa0c7;">
                Need help? <a href="mailto:${SUPPORT_EMAIL}" style="color:#19cfbc;text-decoration:none;">${SUPPORT_EMAIL}</a><br/>
                © ${year} SuperPaas. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await sendEmail(to, subject, htmlContent);
};
