import { JwtPayload } from 'jsonwebtoken';
import { IPosts } from './posts.interface';
import { Posts } from './posts.model';
import sendPostToQueue from '../../queue/post.queue';


const createPostIndoDB = async (post: IPosts, user: JwtPayload) => {
    post.user = user.id;
    return await Posts.create(post);
}



const createPostToDB = async (payload: IPosts, user: JwtPayload) => {
    payload.user = user.id;
    await sendPostToQueue(payload);
    return { data: payload, message: "Post created successfully" };
}
export const PostsServices = { createPostIndoDB, createPostToDB };
