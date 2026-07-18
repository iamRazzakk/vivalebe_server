import { isValidObjectId } from "mongoose";
import { z } from "zod";

const objectId = z.string().trim().refine(isValidObjectId, {
  message: "Invalid ObjectId",
});

const guestSchema = z.object({
  userId: objectId,
});

const eventBodySchema = z
  .object({
    eventName: z.string().trim().min(1).max(100),

    type: z.string().trim().min(1).max(100),
    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    startTime: z.coerce.date(),

    details: z.string().trim().min(1).max(1000),

    guests: z.array(guestSchema).default([]),

    visibility: z.enum(["private", "public"]),

    status: z.enum(["upcoming", "completed", "cancelled"]),

    isDeleted: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date cannot be before start date",
      });
    }
  });

export const createEventSchemaZodValidation = z.object({
  body: eventBodySchema,
});

export const updateEventSchemaZodValidation = z.object({
  params: z.object({
    id: objectId,
  }),
  body: eventBodySchema.optional(),
});

export const EventsValidations = {
  createEventSchemaZodValidation,
  updateEventSchemaZodValidation,
};
