import { z } from 'zod';


const createPostValidation = z.object({
    body: z.object({
        description: z.string({ required_error: "Description is required" }).min(1),
        content: z.array(z.string({ required_error: "Content is required" })).min(1),
        type: z.enum(["IMAGE", "VIDEO"], { required_error: "Type is required" }),
        user: z.string({ required_error: "User is required" }),
        likeCount: z.number().optional(),
        commentCount: z.number().optional(),
    })
})
    .refine((data) => {
        return data.body.user.length > 0;
    }, {
        message: "User is required",
    }).refine((data) => {
        return data.body.description.length > 0;
    }, {
        message: "Description is required",
    })

export const PostsValidations = {
    createPostValidation,
};
