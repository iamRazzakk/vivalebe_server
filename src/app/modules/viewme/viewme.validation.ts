import { z } from 'zod';
const createViewmeZodSchema = z.object({
    user: z.string({ required_error: "User id is required" }),
}).strict();

export const ViewmeValidations = {
    createViewmeZodSchema,
};
