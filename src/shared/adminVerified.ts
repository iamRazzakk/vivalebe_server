import { JwtPayload } from "jsonwebtoken";
import { User } from "../app/modules/user/user.model";
import ApiError from "../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { USER_ROLES } from "../enums/user";

export const isAdminVerified = async (user: JwtPayload) => {
  const userData = await User.findById(user.id).lean();
  if (!userData) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  if (!userData.isAdminVerified && userData.role != USER_ROLES.SUPER_ADMIN) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Admin verification required");
  }
  return true;
};
