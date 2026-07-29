import { Model, Types } from "mongoose";

export type ISuccess_story = {
  relationshipStatus: "dating" | "engaged" | "other";
  title: string;
  description: string;
  media: string[];
  userId:Types.ObjectId;
};

export type Success_storyModel = Model<ISuccess_story>;
