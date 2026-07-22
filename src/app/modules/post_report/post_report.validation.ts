import { z } from "zod";
import { Types } from "mongoose";

const postReportValidation = z
  .object({
    body: z.object({
      postId: z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: "Invalid post ID",
      }),
      reason: z.enum([
        "usingAiGeneratedContent",
        "containsContactInformation",
        "inappropriateOrObsceneContent",
        "photoImperSonatingAnotherIndividual",
        "photoOfAChild",
        "other",
      ]),
      description: z.string().optional(),
      image: z.array(z.string()).optional(),
    }),
  })
  // .strict();

export const PostReportValidations = { postReportValidation };
