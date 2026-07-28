import { model, Schema } from "mongoose";
import { ChatModel, IChat } from "./chat.interface";

const chatSchema = new Schema<IChat, ChatModel>({
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: Boolean,
    default: true,
  },
  chatType: {
    type: String,
    enum: ["single", "group"],
  },
  groupName: {
    type: String,
    required: false,
  },
  blockedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  blockedStatus: {
    type: String,
    default: "active",
    enum: ["active", "blocked"],
    required: false,
  },
});

export const Chat = model<IChat, ChatModel>("Chat", chatSchema);
