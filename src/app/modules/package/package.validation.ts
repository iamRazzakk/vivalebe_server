import { z } from "zod";

const createPackageZodSchema = z.object({
  body: z.object({
    title: z.string({ required_error: "Title is required" }),
    price: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine((val) => !isNaN(val), {
        message: "Price must be a valid number.",
      }),
    duration: z.enum(["1 month", "3 months", "6 months"], {
      required_error: "Duration is required",
    }),
  }),
});

export const PackageValidation = {
  createPackageZodSchema,
};
