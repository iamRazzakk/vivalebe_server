import { Types, FilterQuery } from "mongoose";
import { Swipe } from "../app/modules/swipe/swipe.model";
import { Feed } from "../app/modules/feed/feed.model";
import { logger } from "../shared/logger";
import { Posts } from "../app/modules/posts/posts.model";
import { User } from "../app/modules/user/user.model";
import { IUser } from "../app/modules/user/user.interface";
import { DISCOVER_AUTHOR_POOL } from "../app/modules/feed/feed.constants";

const CHUNK_SIZE = 500;
const BACKFILL_LIMIT = 20;

type IFanOutPostToFeedsParams = {
  postId: string | Types.ObjectId;
  authorId: string | Types.ObjectId;
  createdAt?: Date;
};

export const getFeedAudienceIds = async (authorId: string | Types.ObjectId) => {
  const authorObjectId = new Types.ObjectId(String(authorId));
  const likerIds = await Swipe.distinct("fromUser", {
    toUser: authorObjectId,
    action: "like",
  });
  const audience = new Map<string, Types.ObjectId>();
  audience.set(String(authorObjectId), authorObjectId);
  for (const id of likerIds) {
    audience.set(String(id), new Types.ObjectId(String(id)));
  }
  return [...audience.values()];
};

export const fanOutPostToFeeds = async (params: IFanOutPostToFeedsParams) => {
  const postId = new Types.ObjectId(String(params.postId));
  const authorId = new Types.ObjectId(String(params.authorId));
  const createdAt = params.createdAt ? new Date(params.createdAt) : new Date();
  const audienceIds = await getFeedAudienceIds(authorId);
  if (!audienceIds.length) return { inserted: 0 };

  let inserted = 0;
  for (let i = 0; i < audienceIds.length; i += CHUNK_SIZE) {
    const chunk = audienceIds.slice(i, i + CHUNK_SIZE);
    const docs = chunk.map((owner) => ({
      owner,
      post: postId,
      author: authorId,
      createdAt,
      updatedAt: createdAt,
    }));
    try {
      const result = await Feed.insertMany(docs, { ordered: false });
      inserted += result.length;
    } catch (error: any) {
      if (error?.writeErrors?.length) {
        inserted += docs.length - error.writeErrors.length;
      } else if (error?.code !== 11000) {
        logger.error("Fan-out insert failed", error);
        throw error;
      }
    }
  }
  return { inserted };
};

export const backfillAuthorPostsToUser = async (
  likerId: string | Types.ObjectId,
  authorId: string | Types.ObjectId,
  limit = BACKFILL_LIMIT,
) => {
  const owner = new Types.ObjectId(String(likerId));
  const author = new Types.ObjectId(String(authorId));
  const recentPosts = await Posts.find({ user: author })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("_id user createdAt")
    .lean();
  if (!recentPosts.length) return { inserted: 0 };

  const docs = recentPosts.map((p: any) => ({
    owner,
    post: p._id,
    author,
    createdAt: p.createdAt,
    updatedAt: p.createdAt,
  }));

  try {
    const result = await Feed.insertMany(docs, { ordered: false });
    return { inserted: result.length };
  } catch (error: any) {
    if (error?.writeErrors) {
      return { inserted: docs.length - error.writeErrors.length };
    }
    if (error?.code === 11000) return { inserted: 0 };
    throw error;
  }
};

/** Rejected + liked (liked already in engaged bucket) */
export const getExcludedAuthorIdsForDiscover = async (
  userId: string | Types.ObjectId,
) => {
  const me = new Types.ObjectId(String(userId));
  const swiped = await Swipe.find({ fromUser: me })
    .select("toUser action")
    .lean();

  const excluded = new Map<string, Types.ObjectId>();
  excluded.set(String(me), me);

  for (const s of swiped) {
    // reject always exclude; like also exclude from discover (comes via engaged)
    excluded.set(String(s.toUser), new Types.ObjectId(String(s.toUser)));
  }
  return [...excluded.values()];
};

/** Matching users for Discover (same idea as swipe feed) */
export const getDiscoverAuthorIds = async (
  userId: string | Types.ObjectId,
  poolSize = DISCOVER_AUTHOR_POOL,
) => {
  const me = new Types.ObjectId(String(userId));
  const currentUser = await User.findById(me)
    .select("gender lookingFor")
    .lean();
  if (!currentUser) return [] as Types.ObjectId[];

  const excludedIds = await getExcludedAuthorIdsForDiscover(me);

  const filter: FilterQuery<IUser> = {
    _id: { $nin: excludedIds },
    onboardingComplete: true,
    status: "ACTIVE",
    isBanned: false,
  };
  if (currentUser.lookingFor) filter.gender = currentUser.lookingFor;
  if (currentUser.gender) filter.lookingFor = currentUser.gender;

  const authors = await User.find(filter)
    .select("_id")
    .sort({ createdAt: -1 })
    .limit(poolSize)
    .lean();

  return authors.map((u) => u._id as Types.ObjectId);
};
