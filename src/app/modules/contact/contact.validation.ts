import { z } from "zod";

const createContactZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Name is required" }),
    subject: z.string({ required_error: "Subject is required" }),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email" }),
    phone: z.string({ required_error: "Phone is required" }),
    message: z.string({ required_error: "Message is required" }),
  }),
});

export const ContactValidations = {
  createContactZodSchema,
};
