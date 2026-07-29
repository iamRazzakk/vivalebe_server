import { USER_ROLES } from "../../../../enums/user";
import QueryBuilder from "../../../builder/queryBuilder";
import { User } from "../../user/user.model";

const getUserListFromDB = async (query: Record<string, any>) => {
  const qb = new QueryBuilder(
    User.find({ $not: { $eq: USER_ROLES.SUPER_ADMIN } }).select("-password"),
    query,
  )
    .filter()
    .sort()
    .search(["name", "email", "phone", "role", "status"])
    .paginate();
  const [userList, total] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    userList,
    total,
  };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findById(id).select("-password").lean();
  return user;
};

const banThisUserFromDB = async (id: string) => {
  const user = await User.findByIdAndUpdate(
    id,
    { isBanned: true },
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
