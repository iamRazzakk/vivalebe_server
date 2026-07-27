import { JwtPayload } from "jsonwebtoken";
import { ISwipe, SwipeModel } from "./swipe.interface";
import { Swipe } from "./swipe.model";
import { FilterQuery, Types } from "mongoose";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";
import QueryBuilder from "../../builder/queryBuilder";
import { IUser } from "../user/user.interface";
import { backfillAuthorPostsToUser } from "../../../helpers/feedFanoutHelper";
import { Feed } from "../feed/feed.model";

const createSwipeUserIntoDB = async (payload: ISwipe, user: JwtPayload) => {
  const fromUser = new Types.ObjectId(user.id);
  const toUser = new Types.ObjectId(String(payload.toUser));
  const swipe = await Swipe.create({
    fromUser,
    toUser,
    action: payload.action,
  });
  if (!swipe) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "FAILED_TO_CREATE_SWIPES");
  }
  if (payload.action === "like") {
    await backfillAuthorPostsToUser(user.id, payload.toUser);
  }
  if (payload.action === "reject") {
    await Feed.deleteMany({ owner: fromUser, author: toUser });
  }
  return swipe;
};

// const getFeedUsersFromDB = async (
//   user: JwtPayload,
//   query: Record<string, unknown>,
// ) => {
//   const currentUser = await User.findById(user.id).select("gender lookingFor");
//   if (!currentUser) {
//     throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//   }
//   const swipes = await Swipe.find({
//     fromUser: new Types.ObjectId(user.id),
//   })
//     .select("toUser")
//     .lean();
//   const excludedIds = [
//     new Types.ObjectId(user.id),
//     ...swipes.map((item) => new Types.ObjectId(String(item.toUser))),
//   ];
//   const matchFilter: Record<string, unknown> = {
//     _id: { $nin: excludedIds },
//     onboardingComplete: true,
//     status: "ACTIVE",
//     isBanned: false,
//   };
//   if (currentUser.lookingFor) {
//     matchFilter.gender = currentUser.lookingFor;
//   }
//   if (currentUser.gender) {
//     matchFilter.lookingFor = currentUser.gender;
//   }
//   const safeQuery = { ...query };
//   delete safeQuery._id;
//   const qb = new QueryBuilder(
//     User.find(matchFilter).select(
//       "name nationality profile height weight education relationStatus bio",
//     ),
//     safeQuery,
//   )
//     .filter()
//     .sort()
//     .fields()
//     .paginate();
//   const [users, meta] = await Promise.all([
//     qb.modelQuery.lean(),
//     qb.getPaginationInfo(),
//   ]);
//   return { users, meta };
// };

const getFeedUsersFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const currentUser = await User.findById(user.id)
    .select("gender lookingFor")
    .lean();
  if (!currentUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  const userObjectId = new Types.ObjectId(user.id);
  // distinct use
  const swipedUserIds = await Swipe.distinct("toUser", {
    fromUser: userObjectId,
  });
  const excludedIds: Types.ObjectId[] = [
    userObjectId,
    ...swipedUserIds.map((id) => new Types.ObjectId(String(id))),
  ];
  const filter: FilterQuery<IUser> = {
    _id: { $nin: excludedIds },
    onboardingComplete: true,
    status: "ACTIVE",
    isBanned: false,
  };
  if (currentUser.lookingFor) {
    filter.gender = currentUser.lookingFor;
  }
  if (currentUser.gender) {
    filter.lookingFor = currentUser.gender;
  }
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select(
        "name nationality profile height weight education relationStatus bio",
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return {
    users,
    meta: {
      total,
      limit,
      page,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const undoSwipeUserIntoDB = async (
  action: "like" | "reject",
  user: JwtPayload,
  id: string,
) => {
  const swipe = await Swipe.findByIdAndUpdate(
    id,
    { action, fromUser: user.id, toUser: new Types.ObjectId(id) },
    { new: true },
  );
  if (!swipe) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Swipe not found");
  }
  return swipe;
};

// likes you user
const likesYouUsersFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const qb = new QueryBuilder(
    Swipe.find({
      toUser: new Types.ObjectId(user.id),
      action: "like",
    }),
    query,
  )
    .filter()
    .sort()
    .fields()
    .populate(["fromUser"], {
      fromUser:
        "name nationality profile height weight education relationStatus bio",
    })
    .paginate();
  const [likesYouUsers, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    likesYouUsers,
    meta,
  };
};

const youLikedUsersFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const qb = new QueryBuilder(
    Swipe.find({
      fromUser: new Types.ObjectId(user.id),
      action: "like",
    }),
    query,
  )
    .filter()
    .sort()
    .fields()
    .populate(["toUser"], {
      toUser:
        "name nationality profile height weight education relationStatus bio",
    })
    .paginate();
  const [youLikedUsers, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    youLikedUsers,
    meta,
  };
};

export const SwipeServices = {
  createSwipeUserIntoDB,
  getFeedUsersFromDB,
  undoSwipeUserIntoDB,
  likesYouUsersFromDB,
  youLikedUsersFromDB,
};
