import { IContact } from "../app/modules/contact/contact.interface";
import { ICreateAccount, IResetPassword } from "../types/emailTemplate";

const LOGO_URL =
  "https://res.cloudinary.com/dnsktebcu/image/upload/v1783499738/logo_mxjv2b.webp";
const BRAND = "Vivalebe";
const ACCENT = "#D0A933";
const TEXT = "#3A3A3A";
const MUTED = "#8A8A8A";
const BG = "#F4F4F5";

const emailShell = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:Georgia,'Times New Roman',serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BG};padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:6px;background:${ACCENT};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:36px 32px 24px;text-align:center;">
              <img src="${LOGO_URL}" alt="${BRAND}" width="140" style="display:block;margin:0 auto 28px;width:140px;height:auto;border:0;" />
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 36px;text-align:center;">
              <p style="margin:0 0 8px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
                &copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp: number | string) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px auto;">
    <tr>
      <td style="background:${ACCENT};border-radius:12px;padding:14px 28px;">
        <span style="display:inline-block;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:28px;font-weight:700;letter-spacing:6px;line-height:1;">
          ${otp}
        </span>
      </td>
    </tr>
  </table>
`;

const createAccount = (values: ICreateAccount) => ({
  to: values.email,
  subject: `Verify your ${BRAND} account`,
  html: emailShell(`
    <h1 style="margin:0 0 12px;color:${TEXT};font-size:26px;font-weight:400;line-height:1.3;">
      Hey, ${values.name}
    </h1>
    <p style="margin:0 0 8px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">
      Welcome to ${BRAND}. Use this code to verify your email and activate your account.
    </p>
    <p style="margin:24px 0 0;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.4px;text-transform:uppercase;">
      Your verification code
    </p>
    ${otpBlock(values.otp)}
    <p style="margin:0 0 24px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">
      This code expires in <strong style="color:${ACCENT};">3 minutes</strong>.
    </p>
    <p style="margin:0;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
      If you didn’t create a ${BRAND} account, you can safely ignore this email.
    </p>
  `),
});

const resetPassword = (values: IResetPassword) => ({
  to: values.email,
  subject: `Reset your ${BRAND} password`,
  html: emailShell(`
    <h1 style="margin:0 0 12px;color:${TEXT};font-size:26px;font-weight:400;line-height:1.3;">
      Reset your password
    </h1>
    <p style="margin:0 0 8px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">
      We received a request to reset your password. Enter this code to continue.
    </p>
    <p style="margin:24px 0 0;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:0.4px;text-transform:uppercase;">
      Your reset code
    </p>
    ${otpBlock(values.otp)}
    <p style="margin:0 0 24px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;">
      This code expires in <strong style="color:${ACCENT};">3 minutes</strong>.
    </p>
    <p style="margin:0;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;">
      If you didn’t request this, ignore this email — your password won’t change.
    </p>
  `),
});

const contactEmailTemp = (values: IContact) => ({
  to: values.email,
  subject: `We received your message — ${BRAND}`,
  html: emailShell(`
    <h1 style="margin:0 0 12px;color:${TEXT};font-size:26px;font-weight:400;line-height:1.3;">
      Thanks, ${values.name}
    </h1>
    <p style="margin:0 0 20px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">
      We’ve received your message and will get back to you soon.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAF8;border-radius:12px;text-align:left;">
      <tr>
        <td style="padding:20px 22px;">
          <p style="margin:0 0 6px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;">Subject</p>
          <p style="margin:0 0 16px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">${values.subject}</p>
          <p style="margin:0 0 6px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;font-size:12px;text-transform:uppercase;letter-spacing:0.4px;">Message</p>
          <p style="margin:0;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap;">${values.message}</p>
        </td>
      </tr>
    </table>
  `),
});

const feedbackEmailTemp = (values: IContact) => ({
  to: values.email,
  subject: `Thank you for your message — ${BRAND}`,
  html: emailShell(`
    <h1 style="margin:0 0 12px;color:${TEXT};font-size:26px;font-weight:400;line-height:1.3;">
      Thank you, ${values.name}
    </h1>
    <p style="margin:0 0 20px;color:${TEXT};font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">
      Thank you for your message. We’ve received your message and will get back to you soon.
      <br>
      <br>
      Best regards,
      <br>
      ${BRAND} Team
    </p>
  `),
});

export const emailTemplate = {
  createAccount,
  resetPassword,
  contactEmailTemp,
  feedbackEmailTemp,
};
