import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import {
  getLikeCountDeltas,
  isLikedInRedis,
  isPendingRemove,
} from "../../../redis/redis.store";
import { Feed } from "./feed.model";
import { Posts } from "../posts/posts.model";
import { Like } from "../like/like.model"; // CHANGE: isLiked check-এর জন্য
import {
  DEFAULT_FEED_LIMIT,
  ENGAGED_RATIO,
  MAX_FEED_LIMIT,
} from "./feed.constants";
import { getDiscoverAuthorIds } from "../../../helpers/feedFanoutHelper";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";

type FeedItem = {
  _id?: unknown;
  source: "engaged" | "discover";
  post: Record<string, unknown>;
  author: Record<string, unknown> | Types.ObjectId;
  createdAt?: Date;
};

type PostType = "IMAGE" | "VIDEO";

const normalizePostType = (value: unknown): PostType | undefined => {
  if (typeof value !== "string") return undefined;
  const upper = value.toUpperCase();
  if (upper === "IMAGE" || upper === "VIDEO") return upper;
  return undefined;
};

const withLiveLikeCounts = async (items: FeedItem[]) => {
  const postIds = items
    .map((i) => (i.post?._id ? String(i.post._id) : null))
    .filter(Boolean) as string[];
  if (!postIds.length) return items;

  const deltas = await getLikeCountDeltas(postIds);
  return items.map((item) => ({
    ...item,
    post: {
      ...item.post,
      likeCount:
        ((item.post.likeCount as number) || 0) +
        (deltas[String(item.post._id)] || 0),
    },
  }));
};

/**
 * CHANGE (new function):
 * প্রতিটা feed post-এ current user like দিয়েছে কিনা — isLiked: true/false সেট করে।
 * Redis buffer + DB দুটোই চেক (createLike-এর same logic)।
 */
const withIsLikedStatus = async (items: FeedItem[], userId: string) => {
  const postIds = items
    .map((i) => (i.post?._id ? String(i.post._id) : null))
    .filter(Boolean) as string[];

  if (!postIds.length) return items;

  // Redis: currently liked?
  const redisFlags = await Promise.all(
    postIds.map((postId) => isLikedInRedis(userId, postId)),
  );

  // DB: Like document আছে কিনা
  const dbLikes = await Like.find({
    userId: new Types.ObjectId(userId),
    postId: { $in: postIds.map((id) => new Types.ObjectId(id)) },
  })
    .select("postId")
    .lean();

  const dbLikedSet = new Set(dbLikes.map((l) => String(l.postId)));

  // Pending unlike → DB-তে থাকলেও isLiked = false
  const pendingRemoveFlags = await Promise.all(
    postIds.map((postId) => isPendingRemove(userId, postId)),
  );

  const likedSet = new Set<string>();
  postIds.forEach((postId, i) => {
    const inRedis = redisFlags[i];
    const inDb = dbLikedSet.has(postId) && !pendingRemoveFlags[i];
    if (inRedis || inDb) likedSet.add(postId);
  });

  return items.map((item) => ({
    ...item,
    post: {
      ...item.post,
      isLiked: likedSet.has(String(item.post._id)), // CHANGE: attach isLiked
    },
  }));
};

const getEngagedPosts = async (
  userId: string,
  limit: number,
  skip: number,
  postType?: PostType,
) => {
  if (limit <= 0) return { items: [] as FeedItem[], hasMore: false };

  // +1 to detect next page
  const rows = await Feed.find({ owner: new Types.ObjectId(userId) })
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit + 1)
    .populate({
      path: "post",
      match: postType ? { type: postType } : {},
      select: "description content type likeCount commentCount createdAt user",
    })
    .populate({
      path: "author",
      select: "name profile displayName nationality",
    })
    .lean();

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const items = sliced
    .filter((r) => r.post)
    .map((r) => ({
      _id: r._id,
      source: "engaged" as const,
      post: r.post as unknown as Record<string, unknown>,
      author: r.author as unknown as Record<string, unknown>,
      createdAt: r.createdAt,
    }));

  return { items, hasMore };
};

const getDiscoverPosts = async (
  userId: string,
  limit: number,
  skip: number,
  excludePostIds: Set<string>,
  postType?: PostType,
) => {
  if (limit <= 0) return { items: [] as FeedItem[], hasMore: false };

  const authorIds = await getDiscoverAuthorIds(userId);
  if (!authorIds.length) return { items: [], hasMore: false };

  // fetch extra for exclude/dedupe, then page
  const fetchLimit = skip + limit + 1 + excludePostIds.size;
  const postFilter: Record<string, unknown> = { user: { $in: authorIds } };
  if (postType) {
    postFilter.type = postType;
  }

  const posts = await Posts.find(postFilter)
    .sort({ createdAt: -1, _id: -1 })
    .limit(fetchLimit)
    .select("description content type likeCount commentCount createdAt user")
    .lean();

  const filtered = posts.filter((p) => !excludePostIds.has(String(p._id)));
  const pageSlice = filtered.slice(skip, skip + limit + 1);
  const hasMore = pageSlice.length > limit;
  const sliced = hasMore ? pageSlice.slice(0, limit) : pageSlice;

  if (!sliced.length) return { items: [], hasMore: false };

  const authorMap = new Map(
    (
      await User.find({ _id: { $in: sliced.map((p) => p.user) } })
        .select("name profile displayName nationality")
        .lean()
    ).map((u) => [String(u._id), u]),
  );

  const items = sliced.map((p: any) => ({
    source: "discover" as const,
    post: p as unknown as Record<string, unknown>,
    author: (authorMap.get(String(p.user)) || p.user) as unknown as Record<
      string,
      unknown
    >,
    createdAt: p.createdAt as Date | undefined,
  }));

  return { items, hasMore };
};

/** Soft 70/30 merge; engaged short hole discover fill */
const mergeHybridFeed = (
  engaged: FeedItem[],
  discover: FeedItem[],
  limit: number,
) => {
  const result: FeedItem[] = [];
  const seen = new Set<string>();

  let e = 0;
  let d = 0;

  while (result.length < limit && (e < engaged.length || d < discover.length)) {
    for (
      let i = 0;
      i < 2 && result.length < limit && d < discover.length;
      i++
    ) {
      const item = discover[d++];
      const id = String(item.post._id);
      if (seen.has(id)) continue;
      seen.add(id);
      result.push(item);
    }
    if (result.length < limit && e < engaged.length) {
      const item = engaged[e++];
      const id = String(item.post._id);
      if (!seen.has(id)) {
        seen.add(id);
        result.push(item);
      }
    }
  }

  while (result.length < limit && d < discover.length) {
    const item = discover[d++];
    const id = String(item.post._id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }
  while (result.length < limit && e < engaged.length) {
    const item = engaged[e++];
    const id = String(item.post._id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push(item);
  }

  return result;
};

const getMyFeedFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const me = await User.findById(user.id).select("_id").lean();
  if (!me) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

  const postType = normalizePostType(query.type);

  const rawLimit = Number(query.limit) || DEFAULT_FEED_LIMIT;
  const limit = Math.min(Math.max(1, rawLimit), MAX_FEED_LIMIT);
  const page = Math.max(1, Number(query.page) || 1);

  const engagedLimit = Math.ceil(limit * ENGAGED_RATIO);
  const discoverLimit = Math.max(limit - engagedLimit, 0);

  const engagedSkip = (page - 1) * engagedLimit;
  const discoverSkip = (page - 1) * discoverLimit;

  // engaged first (for exclude set)
  const engagedResult = await getEngagedPosts(
    user.id,
    engagedLimit,
    engagedSkip,
    postType,
  );

  const excludePostIds = new Set(
    engagedResult.items.map((i) => String(i.post._id)),
  );

  // fetch a bit extra discover for merge fill
  const discoverResult = await getDiscoverPosts(
    user.id,
    Math.max(discoverLimit, limit), // allow fill if engaged short
    discoverSkip,
    excludePostIds,
    postType,
  );

  let feed = mergeHybridFeed(engagedResult.items, discoverResult.items, limit);
  feed = await withLiveLikeCounts(feed);

  // CHANGE: likeCount-এর পর current user-এর isLiked attach
  feed = await withIsLikedStatus(feed, user.id);

  return {
    feed,
    meta: {
      page,
      limit,
      type: postType || "ALL",
      engagedCount: feed.filter((f) => f.source === "engaged").length,
      discoverCount: feed.filter((f) => f.source === "discover").length,
      hasNextPage: engagedResult.hasMore || discoverResult.hasMore,
    },
  };
};

export const FeedServices = {
  getMyFeedFromDB,
};
