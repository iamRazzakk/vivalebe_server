export type Locale = "en" | "pt";

export const resolveLocale = (language?: string | null): Locale =>
  language === "pt" ? "pt" : "en";

export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};
