import { z } from "zod";
import { CATEGORY } from "../../../enums/categoryEnum";
import { objectId } from "../events/events.validation";

const firstDateIdeaBodySchema = z.object({
  category: z.nativeEnum(CATEGORY, {
    errorMap: (issue, ctx) => {
      if (
        issue.code === z.ZodIssueCode.invalid_type ||
        issue.code === z.ZodIssueCode.invalid_enum_value
      ) {
        return { message: "Invalid category value or type" };
      }
      return { message: ctx.defaultError };
    },
  }),
  description: z
    .string({ required_error: "Description is required" })
    .min(1, "Description must be at least 1 character"),
  dateLocation: z
    .string({ required_error: "Date location is required" })
    .min(1, "Date location must be at least 1 character"),
  media: z
    .array(z.string(), { required_error: "Media is required" })
    .min(1, "Media must contain at least 1 item")
    .max(6, "Media cannot exceed 6 items"),
  user: objectId,
});

const createFirstDateIdeasSchema = z.object({
  body: firstDateIdeaBodySchema,
});

const updateFirstDateIdeasSchema = z.object({
  body: firstDateIdeaBodySchema.partial(),
  params: z.object({
    id: objectId,
  }),
});

export const FirstDateIdeasValidations = {
  createFirstDateIdeasSchema,
  updateFirstDateIdeasSchema,
};
