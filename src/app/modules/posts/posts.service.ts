import { JwtPayload } from "jsonwebtoken";
import { IPosts } from "./posts.interface";
import { Posts } from "./posts.model";
import sendPostToQueue from "../../queue/post.queue";
import QueryBuilder from "../../builder/queryBuilder";
import {
  getLikeCountDelta,
  getLikeCountDeltas,
} from "../../../redis/redis.store";

const createPostIndoDB = async (post: IPosts, user: JwtPayload) => {
  post.user = user.id;
  return await Posts.create(post);
};

const createPostToDB = async (payload: IPosts, user: JwtPayload) => {
  payload.user = user.id;
  await sendPostToQueue(payload);
  return { data: payload, message: "Post created successfully" };
};

const withLiveLikeCounts = async <
  T extends { _id: unknown; likeCount?: number },
>(
  posts: T[],
) => {
  if (!posts.length) return posts;

  const postIds = posts.map((p) => String(p._id));
  const deltas = await getLikeCountDeltas(postIds);

  return posts.map((p) => ({
    ...p,
    likeCount: (p.likeCount || 0) + (deltas[String(p._id)] || 0),
  }));
};

const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const queryBuilder = new QueryBuilder<IPosts>(Posts.find(), query)
    .filter()
    .sort()
    .cursorPaginate();

  const results = await queryBuilder.modelQuery.lean();
  const { data: posts, meta } = queryBuilder.getCursorPaginationMeta(
    results as Record<string, unknown>[],
  );

  const postsWithLiveCount = await withLiveLikeCounts(
    posts as { _id: unknown; likeCount?: number }[],
  );

  return { posts: postsWithLiveCount, meta };
};

const getPostsByUserFromDB = async (
  query: Record<string, unknown>,
  user: JwtPayload,
) => {
  const queryBuilder = new QueryBuilder<IPosts>(
    Posts.find({ user: user?.id }),
    query,
  )
    .filter()
    .sort()
    .paginate();

  const [posts, meta] = await Promise.all([
    queryBuilder.modelQuery.lean(),
    queryBuilder.getPaginationInfo(),
  ]);

  const postsWithLiveCount = await withLiveLikeCounts(
    posts as { _id: unknown; likeCount?: number }[],
  );

  return { posts: postsWithLiveCount, meta };
};

const getSinglePostFromDB = async (id: string) => {
  const post = await Posts.findById(id).lean();
  if (!post) return null;

  const delta = await getLikeCountDelta(String(post._id));
  return {
    ...post,
    likeCount: (post.likeCount || 0) + delta,
  };
};

// 



export const PostsServices = {
  createPostIndoDB,
  createPostToDB,
  getAllPostsFromDB,
  getPostsByUserFromDB,
  getSinglePostFromDB,
};
