import { z } from "zod";
import { objectId } from "../events/events.validation";

const successStoryBodySchema = z.object({
  relationshipStatus: z.enum(["dating", "engaged", "other"], {
    required_error: "Relationship status is required",
  }),
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title must be at least 1 character"),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description must be at least 1 character"),
  media: z
    .array(z.string(), { required_error: "Media is required" })
    .min(1, "Media must contain at least 1 item"),
  userId: objectId.optional(),
});

const createSuccessStorySchema = z.object({
  body: successStoryBodySchema,
});

const updateSuccessStorySchema = z.object({
  body: successStoryBodySchema.partial(),
  params: z.object({
    id: objectId,
  }),
});

export const SuccessStoryValidations = {
  createSuccessStorySchema,
  updateSuccessStorySchema,
};
