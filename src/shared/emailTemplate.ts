import { IContact } from "../app/modules/contact/contact.interface";
import {
  ICreateAccount,
  IResetPassword,
  Locale,
  resolveLocale,
} from "../types/emailTemplate";

const LOGO_URL =
  "https://res.cloudinary.com/dnsktebcu/image/upload/v1789462289/image_uiidjd.png";
const BRAND = "Sigaleve";

const ACCENT = "#B8922A";
const ACCENT_LIGHT = "#D0A933";
const ACCENT_SOFT = "#F5EDD4";
const BG = "#E8ECF1";
const CARD = "#F7F8FA";
const HEADER = "#0F172A";
const SURFACE = "#EEF1F5";
const TEXT = "#0F172A";
const MUTED = "#64748B";
const BORDER = "#D8DEE6";

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const COPY = {
  en: {
    reserved: "All rights reserved.",
    regards: "Best regards,",
    team: `The ${BRAND} Team`,
    createAccount: {
      subject: `Verify your ${BRAND} account`,
      preheader: (otp: number | string) =>
        `Your ${BRAND} verification code is ${otp}. It expires in 3 minutes.`,
      eyebrow: "Account verification",
      title: (name: string) => `Welcome, ${name}`,
      body: `Thanks for joining ${BRAND}. Enter the verification code below to confirm your email and activate your account.`,
      otpLabel: "Verification code",
      expiry: `This code expires in <strong style="color:${ACCENT};font-weight:600;">3 minutes</strong>. For your security, do not share it with anyone.`,
      disclaimer: `If you did not create a ${BRAND} account, you can ignore this email. No action is required.`,
    },
    resetPassword: {
      subject: `Reset your ${BRAND} password`,
      preheader: (otp: number | string) =>
        `Your ${BRAND} password reset code is ${otp}. It expires in 3 minutes.`,
      eyebrow: "Password reset",
      title: "Reset your password",
      body: "We received a request to reset the password for your account. Use the code below to continue in the app.",
      otpLabel: "Reset code",
      expiry: `This code expires in <strong style="color:${ACCENT};font-weight:600;">3 minutes</strong>. For your security, do not share it with anyone.`,
      disclaimer:
        "If you did not request a password reset, ignore this email. Your password will stay the same.",
    },
    contact: {
      subject: `We received your message — ${BRAND}`,
      preheader: (subject: string) =>
        `We received your message about "${subject}".`,
      eyebrow: "Contact",
      title: (name: string) => `Thanks for reaching out, ${name}`,
      body: "We have received your message and a member of our team will respond as soon as possible.",
      subjectLabel: "Subject",
      messageLabel: "Your message",
    },
    feedback: {
      subject: `Thank you for your message — ${BRAND}`,
      preheader: `Thanks for contacting ${BRAND}. We will get back to you soon.`,
      eyebrow: "Thank you",
      title: (name: string) => `Hello, ${name}`,
      body: "Thank you for contacting us. We appreciate you taking the time to write — we have received your message and will follow up shortly.",
    },
  },
  pt: {
    reserved: "Todos os direitos reservados.",
    regards: "Com os melhores cumprimentos,",
    team: `A Equipa ${BRAND}`,
    createAccount: {
      subject: `Verifique a sua conta ${BRAND}`,
      preheader: (otp: number | string) =>
        `O seu código de verificação ${BRAND} é ${otp}. Expira em 3 minutos.`,
      eyebrow: "Verificação da conta",
      title: (name: string) => `Olá, ${name}`,
      body: `Obrigado por se juntar à ${BRAND}. Introduza o código de verificação abaixo para confirmar o seu email e ativar a sua conta.`,
      otpLabel: "Código de verificação",
      expiry: `Este código expira em <strong style="color:${ACCENT};font-weight:600;">3 minutos</strong>. Por segurança, não o partilhe com ninguém.`,
      disclaimer: `Se não criou uma conta ${BRAND}, pode ignorar este email. Não é necessária qualquer ação.`,
    },
    resetPassword: {
      subject: `Redefina a sua palavra-passe ${BRAND}`,
      preheader: (otp: number | string) =>
        `O seu código de redefinição de palavra-passe ${BRAND} é ${otp}. Expira em 3 minutos.`,
      eyebrow: "Redefinição de palavra-passe",
      title: "Redefina a sua palavra-passe",
      body: "Recebemos um pedido para redefinir a palavra-passe da sua conta. Utilize o código abaixo para continuar na aplicação.",
      otpLabel: "Código de redefinição",
      expiry: `Este código expira em <strong style="color:${ACCENT};font-weight:600;">3 minutos</strong>. Por segurança, não o partilhe com ninguém.`,
      disclaimer:
        "Se não pediu a redefinição da palavra-passe, ignore este email. A sua palavra-passe permanecerá igual.",
    },
    contact: {
      subject: `Recebemos a sua mensagem — ${BRAND}`,
      preheader: (subject: string) =>
        `Recebemos a sua mensagem sobre "${subject}".`,
      eyebrow: "Contacto",
      title: (name: string) => `Obrigado por nos contactar, ${name}`,
      body: "Recebemos a sua mensagem e um membro da nossa equipa responderá o mais breve possível.",
      subjectLabel: "Assunto",
      messageLabel: "A sua mensagem",
    },
    feedback: {
      subject: `Obrigado pela sua mensagem — ${BRAND}`,
      preheader: `Obrigado por contactar a ${BRAND}. Entraremos em contacto em breve.`,
      eyebrow: "Obrigado",
      title: (name: string) => `Olá, ${name}`,
      body: "Obrigado por nos contactar. Agradecemos o tempo que dedicou a escrever — recebemos a sua mensagem e responderemos em breve.",
    },
  },
} as const;

const emailShell = (content: string, preheader = "", locale: Locale = "en") => `
<!DOCTYPE html>
<html lang="${locale}">
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
            <td style="padding:28px 32px 24px;background-color:${HEADER};text-align:center;border-bottom:1px solid ${ACCENT};">
              <img src="${LOGO_URL}" alt="${BRAND}" width="160" style="display:block;margin:0 auto;width:160px;max-width:100%;height:auto;border:0;" />
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
                &copy; ${new Date().getFullYear()} ${BRAND}. ${COPY[locale].reserved}
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

const expiryNote = (text: string) => `
  <p style="margin:0 0 20px;color:${MUTED};font-size:14px;line-height:1.55;">
    ${text}
  </p>
`;

const disclaimer = (text: string) => `
  <p style="margin:0;padding:16px 18px;background-color:${SURFACE};border-radius:12px;border:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.6;">
    ${text}
  </p>
`;

const infoCard = (
  rows: { label: string; value: string; preWrap?: boolean }[],
) => `
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

const signature = (locale: Locale) => `
  <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:28px;">
    <tr>
      <td style="width:3px;background-color:${ACCENT};border-radius:2px;">&nbsp;</td>
      <td style="padding-left:14px;">
        <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.6;">
          ${COPY[locale].regards}<br />
          <span style="color:${TEXT};font-weight:600;">${COPY[locale].team}</span>
        </p>
      </td>
    </tr>
  </table>
`;

const createAccount = (values: ICreateAccount, language?: string) => {
  const locale = resolveLocale(language);
  const t = COPY[locale].createAccount;

  return {
    to: values.email,
    subject: t.subject,
    html: emailShell(
      `
    ${eyebrow(t.eyebrow)}
    ${title(t.title(values.name))}
    ${bodyText(t.body)}
    ${otpBlock(values.otp, t.otpLabel)}
    ${expiryNote(t.expiry)}
    ${disclaimer(t.disclaimer)}
  `,
      t.preheader(values.otp),
      locale,
    ),
  };
};

const resetPassword = (values: IResetPassword, language?: string) => {
  const locale = resolveLocale(language);
  const t = COPY[locale].resetPassword;

  return {
    to: values.email,
    subject: t.subject,
    html: emailShell(
      `
    ${eyebrow(t.eyebrow)}
    ${title(t.title)}
    ${bodyText(t.body)}
    ${otpBlock(values.otp, t.otpLabel)}
    ${expiryNote(t.expiry)}
    ${disclaimer(t.disclaimer)}
  `,
      t.preheader(values.otp),
      locale,
    ),
  };
};

const contactEmailTemp = (values: IContact, language?: string) => {
  const locale = resolveLocale(language);
  const t = COPY[locale].contact;

  return {
    to: values.email,
    subject: t.subject,
    html: emailShell(
      `
    ${eyebrow(t.eyebrow)}
    ${title(t.title(values.name))}
    ${bodyText(t.body, "24px")}
    ${infoCard([
      { label: t.subjectLabel, value: values.subject },
      { label: t.messageLabel, value: values.message, preWrap: true },
    ])}
    ${signature(locale)}
  `,
      t.preheader(values.subject),
      locale,
    ),
  };
};

const feedbackEmailTemp = (values: IContact, language?: string) => {
  const locale = resolveLocale(language);
  const t = COPY[locale].feedback;

  return {
    to: values.email,
    subject: t.subject,
    html: emailShell(
      `
    ${eyebrow(t.eyebrow)}
    ${title(t.title(values.name))}
    ${bodyText(t.body, "0")}
    ${signature(locale)}
  `,
      t.preheader,
      locale,
    ),
  };
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  contactEmailTemp,
  feedbackEmailTemp,
};
