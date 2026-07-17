import { JwtPayload } from "jsonwebtoken";
import { IWink, WinkModel } from "./wink.interface";
import { Wink } from "./wink.model";
import { Types } from "mongoose";
import { sendNotificationToQueue } from "../../../helpers/notificationQueueHelper";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const createWinkIntoDB = async (payload: IWink, user: JwtPayload) => {
  const wink = await Wink.create({
    ...payload,
    senderId: new Types.ObjectId(user.id),
  });
  const sender = await User.findById(new Types.ObjectId(user.id)).lean();
  if (!sender) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
  // sending notification using queue
  await sendNotificationToQueue({
    text: `${sender?.name || "Someone"} winked at you`,
    receiver: new Types.ObjectId(payload.receiverId),
    referenceId: wink._id.toString(),
    read: false,
  });

  return wink;
};

// get all winks for me..
const getAllWinksForMeFromDB = async (user: JwtPayload) => {
  const winks = await Wink.find({ receiverId: new Types.ObjectId(user.id) })
    .populate("senderId", "")
    .lean();
  return winks;
};

const getSingleWinkFromDB = async (id: string) => {
  const wink = await Wink.findById(new Types.ObjectId(id)).lean();
  return wink;
};

const updateWinkMatchStatusIntoDB = async (
  id: string,
  payload: { isMatch: boolean },
  user: JwtPayload,
) => {
  const winkExist = await Wink.findById(new Types.ObjectId(id)).lean();
  if (!winkExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Wink not found");
  }

  if (winkExist.receiverId.toString() !== user.id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You are not authorized to update this status",
    );
  }
  const wink = await Wink.findByIdAndUpdate(
    new Types.ObjectId(id),
    { isMatch: payload.isMatch },
    { new: true },
  ).lean();

  return wink;
};

export const WinkServices = {
  createWinkIntoDB,
  getSingleWinkFromDB,
  getAllWinksForMeFromDB,
  updateWinkMatchStatusIntoDB,
};
