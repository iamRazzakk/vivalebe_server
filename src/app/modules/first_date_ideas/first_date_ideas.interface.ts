import { Model, Types } from "mongoose";
import { CATEGORY } from "../../../enums/categoryEnum";

export type IFirstDateIdeas = {
  category: CATEGORY;
  description: string;
  dateLocation: string;
  media: string[];
  user: Types.ObjectId;
};

export type FirstDateIdeasModel = Model<IFirstDateIdeas>;
