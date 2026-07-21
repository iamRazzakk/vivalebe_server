import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { UserService } from "./user.service";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

// register user
const createUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ...userData } = req.body;
    const result = await UserService.createUserToDB(userData);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message:
        "Your account has been successfully created. Verify Your Email By OTP. Check your email",
    });
  }
);

// retrieved user profile
const getUserProfile = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Profile data retrieved successfully",
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await UserService.updateProfileToDB(user, req.body);

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: "Profile updated successfully",
      data: result,
    });
  }
);


const updateOnboardingComplete = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await UserService.updateOnboardingCompleteToDB(user, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Onboarding complete updated successfully",
    data: result,
  });
});


const userMatchingUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.userMatchingUsersFromDB(req.user, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Matching users fetched successfully",
    data: result.users,
    pagination: result.meta,
  });
});

const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getSingleUserFromDB(req.user, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User fetched successfully",
    data: result,
  });
});

const insertBulkUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.insertBulkUsersToDB(req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users inserted successfully",
    data: result,
  });
});

const adminVerifiedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.adminVerifiedUserToDB(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Admin verified user successfully",
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  updateOnboardingComplete,
  userMatchingUsers,
  getSingleUser,
  insertBulkUsers,
  adminVerifiedUser,
};
