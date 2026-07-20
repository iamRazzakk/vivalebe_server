import { Schema, model } from "mongoose";
import {
  FirstDateIdeasModel,
  IFirstDateIdeas,
} from "./first_date_ideas.interface";
import { CATEGORY } from "../../../enums/categoryEnum";

const firstDateIdeasSchema = new Schema<IFirstDateIdeas, FirstDateIdeasModel>(
  {
    category: { type: String, enum: CATEGORY, required: true },
    description: { type: String, required: true },
    dateLocation: { type: String, required: true },
    media: { type: [String], required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  },
);

firstDateIdeasSchema.index({ category: 1 });

export const FirstDateIdeas = model<IFirstDateIdeas, FirstDateIdeasModel>(
  "FirstDateIdeas",
  firstDateIdeasSchema,
);
