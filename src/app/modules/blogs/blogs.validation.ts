import { z } from "zod";

const createBlogZodSchema = z.object({
  // userId: Types.ObjectId;
  // title: string;
  // description: string;
  // youtubeUrl?: string;
  // imageUrl?: string;
  // tags: string[];
  // totalLikes: number;
  // totalComments: number;
  body: z.object({
    title: z.string({ required_error: "Title is required" }).min(1).max(100),
    description: z.string({ required_error: "Description is required" }).min(1).max(1000),
    youtubeUrl: z.string().optional(),
    imageUrl: z.string().optional(),
    tags: z.array(z.string()).min(1),
    totalLikes: z.number().min(0),
    totalComments: z.number().min(0),
    image: z.string().min(1).max(100),
    userId: z.string().min(1).max(100),
  }),
});

export const BlogsValidations = {};
