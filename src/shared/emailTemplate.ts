import { IContact } from "../app/modules/contact/contact.interface";
import { ICreateAccount, IResetPassword } from "../types/emailTemplate";

const LOGO_URL =
  "https://res.cloudinary.com/dnsktebcu/image/upload/v1789462289/image_uiidjd.png";
const BRAND = "Sigaleve";

const ACCENT = "#B8922A";
const ACCENT_LIGHT = "#D0A933";
const ACCENT_SOFT = "#F5EDD4";
const BG = "#E8ECF1";
const CARD = "#F7F8FA";
const HEADER = "#FBF7EF";
const SURFACE = "#EEF1F5";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const BORDER = "#D8DEE6";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const emailShell = (content: string, preheader = "") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${BRAND}</title>
</head>
<body style="margin:0;padding:0;background-color:${BG};font-family:${FONT};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BG};">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BG};padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background-color:${CARD};border-radius:16px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 4px 24px rgba(15, 23, 42, 0.06);">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg, ${ACCENT} 0%, ${ACCENT_LIGHT} 50%, ${ACCENT} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 32px 24px;background-color:${HEADER};text-align:center;border-bottom:1px solid ${BORDER};">
              <img src="${LOGO_URL}" alt="${BRAND}" width="140" style="display:block;margin:0 auto;width:140px;max-width:100%;height:auto;border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 28px;background-color:${CARD};text-align:left;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:${SURFACE};text-align:center;border-top:1px solid ${BORDER};">
              <p style="margin:0 0 4px;color:${TEXT};font-size:13px;font-weight:600;">
                ${BRAND}
              </p>
              <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
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

const eyebrow = (label: string) => `
  <p style="margin:0 0 10px;color:${ACCENT};font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">
    ${label}
  </p>
`;

const title = (text: string) => `
  <h1 style="margin:0 0 16px;color:${TEXT};font-size:24px;font-weight:600;line-height:1.35;letter-spacing:-0.02em;">
    ${text}
  </h1>
`;

const bodyText = (text: string, marginBottom = "20px") => `
  <p style="margin:0 0 ${marginBottom};color:${MUTED};font-size:15px;line-height:1.65;">
    ${text}
  </p>
`;

const otpBlock = (otp: number | string, label: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
    <tr>
      <td style="background-color:${SURFACE};border:1px solid ${BORDER};border-radius:12px;padding:20px 24px;text-align:center;">
        <p style="margin:0 0 14px;color:${MUTED};font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
          ${label}
        </p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto;">
          <tr>
            <td style="background-color:${ACCENT_SOFT};border:1px dashed ${ACCENT_LIGHT};border-radius:10px;padding:16px 36px;">
              <span style="display:inline-block;color:${ACCENT};font-size:30px;font-weight:700;letter-spacing:7px;line-height:1;font-family:ui-monospace, 'SF Mono', Consolas, monospace;">
                ${otp}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

const expiryNote = () => `
  <p style="margin:0 0 20px;color:${MUTED};font-size:14px;line-height:1.55;">
    This code expires in <strong style="color:${ACCENT};font-weight:600;">3 minutes</strong>. For your security, do not share it with anyone.
  </p>
`;

const disclaimer = (text: string) => `
  <p style="margin:0;padding:16px 18px;background-color:${SURFACE};border-radius:12px;border:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.6;">
    ${text}
  </p>
`;

const infoCard = (rows: { label: string; value: string; preWrap?: boolean }[]) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 0;background-color:${SURFACE};border-radius:14px;border:1px solid ${BORDER};">
    <tr>
      <td style="padding:22px 24px;">
        ${rows
          .map(
            (row, i) => `
          <div style="margin-bottom:${i < rows.length - 1 ? "18px" : "0"};">
            <p style="margin:0 0 6px;color:${ACCENT};font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">
              ${row.label}
            </p>
            <p style="margin:0;color:${TEXT};font-size:15px;line-height:1.55;${row.preWrap ? "white-space:pre-wrap;" : ""}">
              ${row.value}
            </p>
          </div>
        `,
          )
          .join("")}
      </td>
    </tr>
  </table>
`;

const signature = () => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
    <tr>
      <td style="width:3px;background-color:${ACCENT};border-radius:2px;">&nbsp;</td>
      <td style="padding-left:14px;">
        <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6;">
          Best regards,<br />
          <span style="color:${TEXT};font-weight:600;">The ${BRAND} Team</span>
        </p>
      </td>
    </tr>
  </table>
`;

const createAccount = (values: ICreateAccount) => ({
  to: values.email,
  subject: `Verify your ${BRAND} account`,
  html: emailShell(
    `
    ${eyebrow("Account verification")}
    ${title(`Welcome, ${values.name}`)}
    ${bodyText(
      `Thanks for joining ${BRAND}. Enter the verification code below to confirm your email and activate your account.`,
    )}
    ${otpBlock(values.otp, "Verification code")}
    ${expiryNote()}
    ${disclaimer(
      `If you did not create a ${BRAND} account, you can ignore this email. No action is required.`,
    )}
  `,
    `Your ${BRAND} verification code is ${values.otp}. It expires in 3 minutes.`,
  ),
});

const resetPassword = (values: IResetPassword) => ({
  to: values.email,
  subject: `Reset your ${BRAND} password`,
  html: emailShell(
    `
    ${eyebrow("Password reset")}
    ${title("Reset your password")}
    ${bodyText(
      "We received a request to reset the password for your account. Use the code below to continue in the app.",
    )}
    ${otpBlock(values.otp, "Reset code")}
    ${expiryNote()}
    ${disclaimer(
      "If you did not request a password reset, ignore this email. Your password will stay the same.",
    )}
  `,
    `Your ${BRAND} password reset code is ${values.otp}. It expires in 3 minutes.`,
  ),
});

const contactEmailTemp = (values: IContact) => ({
  to: values.email,
  subject: `We received your message — ${BRAND}`,
  html: emailShell(
    `
    ${eyebrow("Contact")}
    ${title(`Thanks for reaching out, ${values.name}`)}
    ${bodyText(
      "We have received your message and a member of our team will respond as soon as possible.",
      "24px",
    )}
    ${infoCard([
      { label: "Subject", value: values.subject },
      { label: "Your message", value: values.message, preWrap: true },
    ])}
    ${signature()}
  `,
    `We received your message about "${values.subject}".`,
  ),
});

const feedbackEmailTemp = (values: IContact) => ({
  to: values.email,
  subject: `Thank you for your message — ${BRAND}`,
  html: emailShell(
    `
    ${eyebrow("Thank you")}
    ${title(`Hello, ${values.name}`)}
    ${bodyText(
      "Thank you for contacting us. We appreciate you taking the time to write — we have received your message and will follow up shortly.",
      "0",
    )}
    ${signature()}
  `,
    `Thanks for contacting ${BRAND}. We will get back to you soon.`,
  ),
});

export const emailTemplate = {
  createAccount,
  resetPassword,
  contactEmailTemp,
  feedbackEmailTemp,
};
