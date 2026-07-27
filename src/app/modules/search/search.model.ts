import { Schema, model } from "mongoose";
import { ISearch, SearchModel } from "./search.interface";

const searchSchema = new Schema<ISearch, SearchModel>(
  {
    searchTerm: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

searchSchema.index({ user: 1, searchTerm: 1 }, { unique: true });

export const Search = model<ISearch, SearchModel>("Search", searchSchema);
