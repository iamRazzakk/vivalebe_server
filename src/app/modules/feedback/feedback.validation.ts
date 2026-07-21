import { z } from "zod";
import { SupportCategory } from "../../../enums/SupportCategory";
const createFeedbackSchema = z.object({
  body: z.object({
    topic: z.enum(Object.values(SupportCategory) as [string, ...string[]]),
    description: z
      .string({
        required_error: "Description is required",
      })
      .min(1, {
        message: "Description must be at least 1 character",
      }),
    phone: z
      .string({
        required_error: "Phone is required",
      })
      .min(1, {
        message: "Phone must be at least 1 character",
      }),
    voiceMessage: z
      .string({
        required_error: "Voice message is required",
      })
      .optional(),
    media: z
      .array(
        z.string({
          required_error: "Media is required",
        }),
      )
      .optional(),
  }),
});
const updateFeedbackZodSchema = z.object({
  status: z.enum(["pending", "resolved"]),
});
export const FeedbackValidations = {
  createFeedbackSchema,
  updateFeedbackZodSchema,
};
