import { USER_ROLES } from "../../../../enums/user";
import QueryBuilder from "../../../builder/queryBuilder";
import { User } from "../../user/user.model";

const getUserListFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(
    User.find({
      role: { $ne: USER_ROLES.SUPER_ADMIN },
    }).select("-password"),
    query,
  )
    .filter()
    .sort()
    .search(["name", "email", "phone", "role", "status"])
    .paginate();
  const [data, meta] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    data,
    meta,
  };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findById(id).select("-password").lean();
  return user;
};

const banThisUserFromDB = async (id: string) => {
  const userDetails = await User.findById(id).lean();
  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: userDetails?.isBanned ? false : true },
    { new: true },
  )
    .select("-password")
    .lean();
  return user;
};

export const UserListService = {
  getUserListFromDB,
  getSingleUserFromDB,
  banThisUserFromDB,
};
