import { z } from 'zod';
import { checkValidID } from '../../../shared/checkValidID';


const createCommentZodSchema = z.object({
    body: z.object({
        comment: z.string({
            required_error: 'Comment is required',
        }).min(1),
        postId: checkValidID("Invalid Post ID"),
    }),
});

const updateCommentsZodSchema = z.object({
    body: z.object({
        comment: z.string({
            required_error: 'Comment is required',
        }).min(1),
    }),
});

export const CommentsValidations = {
    createCommentZodSchema,
    updateCommentsZodSchema,
};
