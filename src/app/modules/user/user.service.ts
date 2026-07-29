import { IUser } from "./user.interface";
import { JwtPayload } from "jsonwebtoken";
import { User } from "./user.model";
import { StatusCodes } from "http-status-codes";
import ApiError from "../../../errors/ApiErrors";
import generateOTP from "../../../util/generateOTP";
import { emailTemplate } from "../../../shared/emailTemplate";
import { emailProducer } from "../../../services/email.producer";
import { randomUUID } from "crypto";
import { dataStoreToRedis } from "../../../redis/redis.store";
import QueryBuilder from "../../builder/queryBuilder";
import { Viewme } from "../viewme/viewme.model";
import { createBlurredImageFromPath } from "../../../shared/protectedFile";
import { SearchServices } from "../search/search.service";
import { Types } from "mongoose";
import { Wink } from "../wink/wink.model";
import { Swipe } from "../swipe/swipe.model";

const createUserToDB = async (payload: Partial<IUser>): Promise<IUser> => {
  if (
    payload?.confirmPassword !== undefined &&
    payload?.password !== payload?.confirmPassword
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and confirm password do not match",
    );
  }
  delete payload?.confirmPassword;

  const createUser = await User.create(payload);
  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to create user");
  }

  //send email
  const otp = generateOTP();
  const values = {
    name: createUser.name,
    otp: otp,
    email: createUser.email!,
  };

  const emailJobId = randomUUID();
  const createAccountTemplate = emailTemplate.createAccount(values);
  const emailData = {
    jobId: emailJobId,
    to: createAccountTemplate.to,
    subject: createAccountTemplate.subject,
    html: createAccountTemplate.html,
    type: "create_account",
  };

  await emailProducer.sendEmailEvent(emailData);
  // store in redis instead of DB
  const result = await dataStoreToRedis(
    `authentication:${createUser.email.toString()}`,
    JSON.stringify({
      email: createUser?.email,
      oneTimeCode: otp,
      expireAt: new Date(Date.now() + 3 * 60000),
    }),
    3 * 60 * 1000,
  );

  return createUser;
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser: any = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  return updateDoc;
};

const updateOnboardingCompleteToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
) => {
  const { id } = user;
  const isExistUser = await User.findOne({ _id: id }).lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    {
      ...payload,
      onboardingComplete: true,
      updatedAt: new Date(),
    },
    {
      new: true,
    },
  );
  return updateDoc;
};

// get matching users from DB base on filters
const userMatchingUsersFromDB = async (
  user: JwtPayload,
  filters: Record<string, unknown>,
) => {
  const query = { ...filters };

  if (query.name) {
    query.searchTerm = query.name;
    delete query.name;
  }

  const searchTerm =
    typeof query.searchTerm === "string" ? query.searchTerm.trim() : "";

  if (searchTerm) {
    const dbUser = await User.findById(user.id)
      .select("premiumMembership")
      .lean();

    if (dbUser?.premiumMembership) {
      await SearchServices.createSearchIntoDB({
        searchTerm,
        user: new Types.ObjectId(user.id),
      });
    }
  }

  if (query.ageFrom || query.ageTo) {
    const today = new Date();
    const dobFilter: Record<string, Date> = {};

    if (query.ageTo) {
      dobFilter.$gte = new Date(
        today.getFullYear() - Number(query.ageTo),
        today.getMonth(),
        today.getDate(),
      );
    }

    if (query.ageFrom) {
      dobFilter.$lte = new Date(
        today.getFullYear() - Number(query.ageFrom),
        today.getMonth(),
        today.getDate(),
      );
    }

    query.DOB = dobFilter;
    delete query.ageFrom;
    delete query.ageTo;
  }

  const queryBuilder = new QueryBuilder<IUser>(
    User.find({
      _id: { $ne: user.id },
    }),
    query,
  )
    .filter()
    .sort()
    .search(["name", "email"])
    .paginate();

  const [users, meta] = await Promise.all([
    queryBuilder.modelQuery.lean(),
    queryBuilder.getPaginationInfo(),
  ]);

  const loginUserId = new Types.ObjectId(user.id);
  const userIds = users.map((item) => item._id);

  const [likedSwipes, winkRelations] = await Promise.all([
    Swipe.find({
      fromUser: loginUserId,
      toUser: { $in: userIds },
      action: "like",
    })
      .select("toUser")
      .lean(),

    Wink.find({
      $or: [
        {
          senderId: loginUserId,
          receiverId: { $in: userIds },
        },
        {
          receiverId: loginUserId,
          senderId: { $in: userIds },
        },
      ],
    })
      .select("senderId receiverId isMatch")
      .lean(),
  ]);

  const likedUserIds = new Set(
    likedSwipes.map((swipe) => swipe.toUser.toString()),
  );

  const winkMap = new Map<
    string,
    {
      isWinked: boolean;
      isMatch: boolean;
    }
  >();

  for (const wink of winkRelations) {
    const isMeSender = wink.senderId.toString() === String(user.id);

    const otherUserId = isMeSender
      ? wink.receiverId.toString()
      : wink.senderId.toString();

    winkMap.set(otherUserId, {
      isWinked: isMeSender || wink.isMatch,
      isMatch: wink.isMatch,
    });
  }

  const usersWithStatuses = users.map((item: any) => {
    const targetUserId = item._id.toString();

    return {
      ...item,
      isLiked: likedUserIds.has(targetUserId),
      ...(winkMap.get(targetUserId) ?? {
        isWinked: false,
        isMatch: false,
      }),
    };
  });

  return {
    users: usersWithStatuses,
    meta,
  };
};
// get user base on id
// TODO: filter the wink, frame
const getSingleUserFromDB = async (userId: JwtPayload, id: string) => {
  const user = await User.findById(id).lean();
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  await Viewme.findOneAndUpdate(
    { user: id, viewedUser: userId.id },
    {},
    { upsert: true, new: true },
  );

  const loginUser = await User.findById(userId.id).lean();

  // already has protected image → do nothing
  if (loginUser && !loginUser.protectedImages && loginUser.profile) {
    const blurPath = await createBlurredImageFromPath(loginUser.profile);
    if (blurPath) {
      await User.findByIdAndUpdate(
        userId.id,
        { $set: { protectedImages: blurPath } },
        { new: true },
      );
    }
  }

  return user;
};

const insertBulkUsersToDB = async (payload: Partial<IUser>[]) => {
  const users = await User.insertMany(payload);
  return users;
};

const adminVerifiedUserToDB = async (id: string, payload: Partial<IUser>) => {
  const isExistUser = await User.findOne({ _id: id }).lean();
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }
  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    {
      isAdminVerified: payload.isAdminVerified,
      updatedAt: new Date(),
    },
    {
      new: true,
    },
  );
  return updateDoc;
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  updateOnboardingCompleteToDB,
  userMatchingUsersFromDB,
  getSingleUserFromDB,
  insertBulkUsersToDB,
  adminVerifiedUserToDB,
};
