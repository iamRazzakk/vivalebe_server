import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const runningInDocker = fs.existsSync("/.dockerenv");

const dockerServiceHost = (url: string | undefined, service: string) => {
  if (!url || !runningInDocker) return url;
  return url.replace(/localhost|127\.0\.0\.1/g, service);
};

export default {
  ip_address: process.env.IP || "0.0.0.0",
  port: process.env.PORT,
  database_url: dockerServiceHost(process.env.DATABASE_URL, "mongodb"),
  node_env: process.env.NODE_ENV,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    secret: process.env.JWT_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN!,
    issuer: process.env.JWT_ISSUER!,
    audience: process.env.JWT_AUDIENCE!,
    tokenVersion: process.env.tokenVersion!,
  },
  stripe: {
    stripeSecretKey: process.env.stripe_secret_key,
    webhookSecret: process.env.stripe_webhook_secret,
    paymentSuccess: process.env.payment_success_url,
  },
  email: {
    from: process.env.EMAIL_FROM,
    user: process.env.EMAIL_USER,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    pass: process.env.EMAIL_PASS,
  },
  social: {
    google_client_id: process.env.GOOGLE_CLIENT_ID,
    facebook_client_id: process.env.FACEBOOK_CLIENT_ID,
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET,
    facebook_client_secret: process.env.FACEBOOK_CLIENT_SECRET,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  bullMQ: {
    host: process.env.BULLMQIP!,
    port: process.env.BULLMQPORT!,
  },
  // meiliSearch
  meiliSearch: {
    host: process.env.MEILI_HOST!,
    apiKey: process.env.MEILI_API_KEY!,
    INDEX: process.env.INDEX!,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    twilioNumber: process.env.TWILIO_NUMBER,
  },

  // rabbitmq
  rabbitmq: {
    url: dockerServiceHost(process.env.RABBITMQ_URL, "rabbitmq")!,
    emailQueue: process.env.EMAIL_QUEUE!,
    emailRetryQueue: process.env.EMAIL_RETRY_QUEUE!,
    emailFailedQueue: process.env.EMAIL_FAILED_QUEUE!,
  },
  // stripe
  cloudflare: {
    CLOUDFLARE_SECRET_KEY: process.env.R2_SECRET_ACCESS_KEY!,
    CLOUDFLARE_BUCKET_NAME: process.env.R2_BUCKET_NAME!,
    CLOUDFLARE_API_KEY: process.env.R2_ACCESS_KEY_ID!,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
    CLOUDFLARE_API_URL: process.env.CLOUDFLARE_R2_ENDPOINT!,
    CLOUDFLARE_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL!,
  },
};
