import { Model, Types } from "mongoose";

export type IChat = {
  participants: [Types.ObjectId];
  status: Boolean;
  chatType: "single" | "group";
  groupName?: string;
  blockedBy?: Types.ObjectId;
  blockedStatus?: "active" | "blocked";
};

export type ChatModel = Model<IChat, Record<string, unknown>>;
