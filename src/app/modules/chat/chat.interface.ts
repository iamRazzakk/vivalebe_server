import { Model, Types } from "mongoose";

export type IChat = {
  participants: [Types.ObjectId];
  status: Boolean;
  chatType: "single" | "group";
};

export type ChatModel = Model<IChat, Record<string, unknown>>;
