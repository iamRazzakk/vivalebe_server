import { JwtPayload } from "jsonwebtoken";
import requirePremiumMembership from "../../../helpers/requirePremiumMembership";
import { isAdminVerified } from "../../../shared/adminVerified";
import { IMessage } from "../message/message.interface";
import { Message } from "../message/message.model";
import { IChat } from "./chat.interface";
import { Chat } from "./chat.model";
import { Types } from "mongoose";

const createChatToDB = async (
  payload: any,
  data: any,
  user: JwtPayload,
): Promise<IChat> => {
  const isExistChat: IChat | null = await Chat.findOne({
    participants: { $all: payload },
  });

  if (isExistChat) {
    return isExistChat;
  }
  if (data.chatType === "group") {
    await Promise.all([isAdminVerified(user), requirePremiumMembership]);
    data.groupName = "Group Chat";
  }
  const chat: IChat = await Chat.create({ participants: payload, ...data });
  return chat;
};

const getChatFromDB = async (user: any, search: string): Promise<IChat[]> => {
  const chats: any = await Chat.find({ participants: { $in: [user.id] } })
    .populate({
      path: "participants",
      select: "_id name displayName profile",
      match: {
        _id: { $ne: user.id }, // Exclude user.id in the populated participants
        ...(search && { name: { $regex: search, $options: "i" } }), // Apply $regex only if search is valid
      },
    })
    .select("participants status");

  // Filter out chats where no participants match the search (empty participants)
  const filteredChats = chats?.filter(
    (chat: any) => chat?.participants?.length > 0,
  );

  //Use Promise.all to handle the asynchronous operations inside the map
  const chatList: IChat[] = await Promise.all(
    filteredChats?.map(async (chat: any) => {
      const data = chat?.toObject();

      const lastMessage: IMessage | null = await Message.findOne({
        chatId: chat?._id,
      })
        .sort({ createdAt: -1 })
        .select("text offer createdAt sender");

      return {
        ...data,
        lastMessage: lastMessage || null,
      };
    }),
  );

  return chatList;
};

const getSingleChatFromDB = async (
  id: string,
  userId: string,
): Promise<IChat | null> => {
  const result = await Chat.findById(id)
    .populate("participants", "_id name displayName profile")
    .lean();
  if (!result) return null;
  const currentUserId = new Types.ObjectId(userId);
  // @ts-ignore
  result.participants = (result.participants as any[]).filter(
    (p) => p && !currentUserId.equals(p._id),
  );
  return result as IChat;
};

const blockUserFromChatIntoDB = async (
  id: string,
  userId: string,
  payload: IChat,
): Promise<IChat | null> => {
  payload.blockedBy = new Types.ObjectId(userId);
  const result = await Chat.findByIdAndUpdate(id, payload, { new: true });
  if (!result) return null;
  return result as IChat;
};

export const ChatService = {
  createChatToDB,
  getChatFromDB,
  getSingleChatFromDB,
  blockUserFromChatIntoDB,
};
