import { Model } from "mongoose";
import { SupportCategory } from "../../../enums/SupportCategory";

export type IFeedback = {
  topic: SupportCategory;
  description: string;
  phone: string;
  voiceMessage?: string;
  media?: string[];
  status: "pending" | "resolved";
};

export type FeedbackModel = Model<IFeedback>;
