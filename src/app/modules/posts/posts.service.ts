import { JwtPayload } from 'jsonwebtoken';
import { IPosts } from './posts.interface';
import { Posts } from './posts.model';
import sendPostToQueue from '../../queue/post.queue';
import QueryBuilder from '../../builder/queryBuilder';


const createPostIndoDB = async (post: IPosts, user: JwtPayload) => {
    post.user = user.id;
    return await Posts.create(post);
}



const createPostToDB = async (payload: IPosts, user: JwtPayload) => {
    payload.user = user.id;
    await sendPostToQueue(payload);
    return { data: payload, message: "Post created successfully" };
}




// need to  implement newest posts and popular posts base on query.
const getAllPostsFromDB = async (query: Record<string, unknown>) => {
    const queryBuilder = new QueryBuilder<IPosts>(Posts.find(), query)
        .filter()
        .sort()
        .cursorPaginate();

    const results = await queryBuilder.modelQuery.lean();
    const { data: posts, meta } = queryBuilder.getCursorPaginationMeta(
        results as Record<string, unknown>[]
    );
    return { posts, meta };
};


// get user posts 
const getPostsByUserFromDB = async (query: Record<string, unknown>, user: JwtPayload) => {
    const queryBuilder = new QueryBuilder<IPosts>(Posts.find({ user: user?.id }), query)
        .filter()
        .sort()
        .paginate();
    const [posts, meta] = await Promise.all([
        queryBuilder.modelQuery.lean(),
        queryBuilder.getPaginationInfo()
    ]);
    return { posts, meta };
};


const getSinglePostFromDB = async (id: string) => {
    return await Posts.findById(id).lean();
};


export const PostsServices = { createPostIndoDB, createPostToDB, getAllPostsFromDB, getPostsByUserFromDB, getSinglePostFromDB };
