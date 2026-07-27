import { z } from "zod";
import { Types } from "mongoose";
const createBlockSchema = z.object({
  blockerId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid blocker id",
  }),
  blockedUserId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid blocked user id",
  }),
  isBlocked: z.boolean().default(true),
});
const createHideUserSchema = z.object({
  userId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid user id",
  }),
  hiddenUserId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid hidden user id",
  }),
});
export const BlockValidations = { createBlockSchema };
