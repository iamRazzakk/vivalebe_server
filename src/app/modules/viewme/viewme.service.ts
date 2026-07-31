import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/queryBuilder";
import { Viewme } from "./viewme.model";
import { Types } from "mongoose";
import { Wink } from "../wink/wink.model";
import { Swipe } from "../swipe/swipe.model";

const getAllRecentlyViewedMeFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const qb = new QueryBuilder(
    Viewme.find({
      user: new Types.ObjectId(user.id),
    }),
    query,
  )
    .filter()
    .sort()
    .fields()
    .populate(["viewedUser"], {
      viewedUser:
        "name email profile education weight height religion nationality",
    })
    .paginate();
  const [recentlyViewedMe, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  // need to check the likes or winked
  const recentlyViewedMeWithWinkedAndLiked = await Promise.all(
    recentlyViewedMe.map(async (item: any) => {
      const wink = await Wink.findOne({
        senderId: new Types.ObjectId(user.id),
        receiverId: new Types.ObjectId(String(item.viewedUser._id)),
      });
      const liked = await Swipe.findOne({
        fromUser: new Types.ObjectId(user.id),
        toUser: new Types.ObjectId(String(item.viewedUser._id)),
        action: "like",
      });
      return {
        ...item,
        isWinked: wink ? true : false,
        isLiked: liked ? true : false,
      };
    }),
  );
  return {
    recentlyViewedMe: recentlyViewedMeWithWinkedAndLiked,
    meta,
  };
};

const getAllViewedMeFromDB = async (user: JwtPayload) => {
  const qb = await Viewme.find({
    user: new Types.ObjectId(user.id),
  }).lean();
  return qb.length;
};

const resetViewedMeFromDB = async (user: JwtPayload) => {
  const result = await Viewme.deleteMany({
    user: new Types.ObjectId(user.id),
  });
  return result.deletedCount;
};

export const ViewMeServices = {
  getAllRecentlyViewedMeFromDB,
  getAllViewedMeFromDB,
  resetViewedMeFromDB,
};
