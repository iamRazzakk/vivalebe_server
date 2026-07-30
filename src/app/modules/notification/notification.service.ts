import { JwtPayload } from "jsonwebtoken";
import QueryBuilder from "../../builder/queryBuilder";
import { Notification } from "./notification.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
const getAllNotificationsFromDB = async (
  user: JwtPayload,
  query: Record<string, any>,
) => {
  const qb = new QueryBuilder(Notification.find({ receiver: user.id }), query)
    .filter()
    .fields()
    .sort()
    .search(["title", "message"])
    .populate(["receiver"], {
      receiver: "name",
    });
  const [notifications, total] = await Promise.all([
    qb.modelQuery.lean(),
    qb.getPaginationInfo(),
  ]);
  return {
    notifications,
    total,
  };
};

const readNotificationFromDB = async (user: JwtPayload, id: string) => {
  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true },
  ).lean();
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }
  return notification;
};


export const NotificationService = {
  getAllNotificationsFromDB,
  readNotificationFromDB,
};