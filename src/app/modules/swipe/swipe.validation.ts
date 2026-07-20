import { isValidObjectId } from "mongoose";
import { z } from "zod";

const swipeSchema = z.object({
  fromUser: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid fromUser",
  }),
  toUser: z.string().refine((val) => isValidObjectId(val), {
    message: "Invalid toUser",
  }),
  action: z.enum(["like", "reject"]),
});

export const SwipeValidations = { swipeSchema };
