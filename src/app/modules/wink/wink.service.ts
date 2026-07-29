import { JwtPayload } from "jsonwebtoken";
import { IWink, WinkModel } from "./wink.interface";
import { Wink } from "./wink.model";
import { Types } from "mongoose";
import { sendNotificationToQueue } from "../../../helpers/notificationQueueHelper";
import { User } from "../user/user.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const createWinkIntoDB = async (payload: IWink, user: JwtPayload) => {
  const senderId = new Types.ObjectId(user.id);
  const receiverId = new Types.ObjectId(payload.receiverId);

  if (senderId.equals(receiverId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You can't wink yourself");
  }

  // Already winked?
  const existingWink = await Wink.findOne({
    senderId,
    receiverId,
  });

  if (existingWink) {
    // If matched, don't allow delete
    if (existingWink.isMatch) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "You are already matched with this user",
      );
    }

    // Toggle OFF
    await existingWink.deleteOne();

    return {
      action: "removed",
      message: "Wink removed successfully",
    };
  }

  // Check opposite wink
  const oppositeWink = await Wink.findOne({
    senderId: receiverId,
    receiverId: senderId,
  });

  const wink = await Wink.create({
    senderId,
    receiverId,
    isMatch: !!oppositeWink,
  });

  // If opposite exists, make both matched
  if (oppositeWink) {
    oppositeWink.isMatch = true;
    await oppositeWink.save();
  }

  const sender = await User.findById(senderId).lean();

  if (sender) {
    await sendNotificationToQueue({
      text: `${sender.name} winked at you`,
      receiver: receiverId,
      referenceId: wink._id.toString(),
      read: false,
    });
  }

  return {
    action: "created",
    message: oppositeWink
      ? "Congratulations! It's a match."
      : "Wink sent successfully.",
    data: wink,
  };
};

// get all winks for me..
const getAllWinksForMeFromDB = async (user: JwtPayload) => {
  const myId = user.id;

  const winks = await Wink.find({
    $or: [
      {
        senderId: new Types.ObjectId(user.id),
      },
      {
        receiverId: new Types.ObjectId(user.id),
      },
    ],
  })
    .populate("senderId")
    .populate("receiverId")
    .lean();

  return winks.map((wink: any) => {
    const isMeSender = wink.senderId._id.toString() === user.id;

    return {
      ...wink,
      isWinked: isMeSender || wink.isMatch,
    };
  });
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
