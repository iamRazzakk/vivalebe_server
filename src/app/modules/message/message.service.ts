import { JwtPayload } from "jsonwebtoken";
import { IMessage } from "./message.interface";
import { Message } from "./message.model";
import { Types } from "mongoose";
import QueryBuilder from "../../builder/queryBuilder";
import { Chat } from "../chat/chat.model";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";

const sendMessageToDB = async (
  user: JwtPayload,
  payload: IMessage,
): Promise<IMessage> => {
  // save to DB
  payload.sender = new Types.ObjectId(user.id);
  // need to check this chat id is blocked or not
  const chat = await Chat.findById(payload.chatId).select("blockedStatus");
  if (chat?.blockedStatus === "blocked") {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are blocked from this chat");
  }
  const response = await Message.create(payload);

  //@ts-ignore
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chatId}`, response);
  }

  return response;
};

const getMessageFromDB = async (
  id: any,
  query: Record<string, any>,
): Promise<{ meta: any; result: IMessage[] }> => {
  const qb = new QueryBuilder<IMessage>(Message.find({ chatId: id }), query)
    .filter()
    .paginate()
    .fields()
    .sort();
  const [meta, result] = await Promise.all([
    qb.getPaginationInfo(),
    qb.modelQuery,
  ]);
  return {
    meta,
    result,
  };
};

export const MessageService = { sendMessageToDB, getMessageFromDB };
