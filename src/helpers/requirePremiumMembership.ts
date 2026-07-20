import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
import { User } from "../app/modules/user/user.model";
import { USER_ROLES } from "../enums/user";

const requirePremiumMembership = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not authorized");
    }
    const user = await User.findById(userId).select("premiumMembership").lean();

    if (!user) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    if (req.user.role !== USER_ROLES.SUPER_ADMIN && !user.premiumMembership) {
      throw new ApiError(
        StatusCodes.FORBIDDEN,
        "Please subscribe first to access this feature",
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};

export default requirePremiumMembership;
