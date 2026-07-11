import { z } from 'zod';
import { checkValidID } from '../../../shared/checkValidID';


const createLikeZodSchema = z.object({
    body: z.object({
        postId: checkValidID("Invalid Post ID")
    }),
});

export const LikeValidations = {
    createLikeZodSchema,
};
