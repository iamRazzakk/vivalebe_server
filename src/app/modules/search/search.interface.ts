import { Model, Types } from "mongoose";

export type ISearch = {
  searchTerm: string;
  user: Types.ObjectId;
};

export type SearchModel = Model<ISearch>;
