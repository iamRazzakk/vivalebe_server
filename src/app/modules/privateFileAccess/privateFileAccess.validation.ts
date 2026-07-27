import { z } from "zod";
import { checkValidID } from "../../../shared/checkValidID";

const createPrivateFileAccessZodSchema = z.object({
  body: z.object({
    providedUserId: checkValidID("Invalid provided user ID"),
    message: z
      .string({
        required_error: "Message is required",
      })
      .min(1, { message: "Message must be at least 1 character" }),
  }),
});

const updatePrivateFileAccessZodSchema = z.object({
  body: z.object({
    isAccessGranted: z.boolean().optional(),
    message: z.string().min(1).optional(),
  }),
});

export const PrivateFileAccessValidations = {
  createPrivateFileAccessZodSchema,
  updatePrivateFileAccessZodSchema,
};
