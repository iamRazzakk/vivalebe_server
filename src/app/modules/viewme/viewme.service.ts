import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/queryBuilder";
import { Viewme } from "./viewme.model";
import { Types } from "mongoose";

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
  return {
    recentlyViewedMe,
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
 const result =  await Viewme.deleteMany({
    user: new Types.ObjectId(user.id),
  });
  return result.deletedCount;
};

export const ViewMeServices = {
  getAllRecentlyViewedMeFromDB,
  getAllViewedMeFromDB,
  resetViewedMeFromDB,
};
