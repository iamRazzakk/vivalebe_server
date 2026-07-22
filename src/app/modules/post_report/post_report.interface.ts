import { Model, Types } from "mongoose";

export type IPostReport = {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  reason:
    | "usingAiGeneratedContent"
    | "containsContactInformation"
    | "inappropriateOrObsceneContent"
    | "photoImperSonatingAnotherIndividual"
    | "photoOfAChild"
    | "other";
  description?: string;
  image?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
};

export type PostReportModel = Model<IPostReport>;
